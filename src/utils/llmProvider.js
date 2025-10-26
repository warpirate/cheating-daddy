const { BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const { saveDebugAudio } = require('../audioUtils');
const { createProvider, getAvailableProviders } = require('./providers/factory');

// Current provider instance
let currentProvider = null;
let currentProviderName = 'gemini';

// Conversation tracking variables
let currentSessionId = null;
let conversationHistory = [];

// Audio capture variables (for macOS)
let systemAudioProc = null;

function sendToRenderer(channel, data) {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
        windows[0].webContents.send(channel, data);
    }
}

// Conversation management functions
function initializeNewSession() {
    currentSessionId = Date.now().toString();
    conversationHistory = [];
    console.log('New conversation session started:', currentSessionId);
}

function saveConversationTurn(transcription, aiResponse) {
    if (!currentSessionId) {
        initializeNewSession();
    }

    const conversationTurn = {
        timestamp: Date.now(),
        transcription: transcription.trim(),
        ai_response: aiResponse.trim(),
    };

    conversationHistory.push(conversationTurn);
    console.log('Saved conversation turn:', conversationTurn);

    // Send to renderer to save in IndexedDB
    sendToRenderer('save-conversation-turn', {
        sessionId: currentSessionId,
        turn: conversationTurn,
        fullHistory: conversationHistory,
    });
}

function getCurrentSessionData() {
    return {
        sessionId: currentSessionId,
        history: conversationHistory,
    };
}

async function getStoredSetting(key, defaultValue) {
    try {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));

            const value = await windows[0].webContents.executeJavaScript(`
                (function() {
                    try {
                        if (typeof localStorage === 'undefined') {
                            return '${defaultValue}';
                        }
                        const stored = localStorage.getItem('${key}');
                        return stored || '${defaultValue}';
                    } catch (e) {
                        return '${defaultValue}';
                    }
                })()
            `);
            return value;
        }
    } catch (error) {
        console.error('Error getting stored setting for', key, ':', error.message);
    }
    return defaultValue;
}

async function getEnabledTools() {
    const tools = [];
    const googleSearchEnabled = await getStoredSetting('googleSearchEnabled', 'true');

    if (googleSearchEnabled === 'true') {
        tools.push({ googleSearch: {} });
    }

    return tools;
}

async function initializeLLMSession(providerName, apiKey, customPrompt = '', profile = 'interview', language = 'en-US') {
    console.log(`Initializing ${providerName} provider...`);

    try {
        // Get enabled tools
        const tools = await getEnabledTools();

        // Create provider instance with callbacks
        const callbacks = {
            onStatusUpdate: status => {
                sendToRenderer('update-status', status);
            },
            onResponse: response => {
                sendToRenderer('update-response', response);
            },
            onConversationTurn: (transcription, response) => {
                saveConversationTurn(transcription, response);
            },
            onError: error => {
                console.error('Provider error:', error);
            },
            onClose: event => {
                console.log('Provider session closed:', event);
            },
        };

        currentProvider = createProvider(providerName, apiKey, { callbacks });
        currentProviderName = providerName;

        // Initialize new conversation session
        initializeNewSession();

        // Initialize the provider session
        const success = await currentProvider.initializeSession({
            profile,
            language,
            customPrompt,
            tools,
        });

        if (success) {
            sendToRenderer('session-initializing', false);
            console.log(`${providerName} session initialized successfully`);
            return true;
        } else {
            sendToRenderer('session-initializing', false);
            sendToRenderer('update-status', 'Failed to initialize session');
            return false;
        }
    } catch (error) {
        console.error(`Failed to initialize ${providerName} session:`, error);
        sendToRenderer('session-initializing', false);
        sendToRenderer('update-status', 'Error: ' + error.message);
        return false;
    }
}

// macOS Audio Capture Functions (only for Gemini)
function killExistingSystemAudioDump() {
    return new Promise(resolve => {
        console.log('Checking for existing SystemAudioDump processes...');

        const killProc = spawn('pkill', ['-f', 'SystemAudioDump'], {
            stdio: 'ignore',
        });

        killProc.on('close', code => {
            if (code === 0) {
                console.log('Killed existing SystemAudioDump processes');
            }
            resolve();
        });

        killProc.on('error', err => {
            console.log('Error checking for existing processes:', err.message);
            resolve();
        });

        setTimeout(() => {
            killProc.kill();
            resolve();
        }, 2000);
    });
}

async function startMacOSAudioCapture() {
    if (process.platform !== 'darwin') return false;
    if (!currentProvider || currentProviderName !== 'gemini') {
        console.log('macOS audio capture only available for Gemini provider');
        return false;
    }

    await killExistingSystemAudioDump();

    console.log('Starting macOS audio capture with SystemAudioDump...');

    const { app } = require('electron');
    const path = require('path');

    let systemAudioPath;
    if (app.isPackaged) {
        systemAudioPath = path.join(process.resourcesPath, 'SystemAudioDump');
    } else {
        systemAudioPath = path.join(__dirname, '../assets', 'SystemAudioDump');
    }

    const spawnOptions = {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
            ...process.env,
            PROCESS_NAME: 'AudioService',
            APP_NAME: 'System Audio Service',
        },
    };

    if (process.platform === 'darwin') {
        spawnOptions.detached = false;
        spawnOptions.windowsHide = false;
    }

    systemAudioProc = spawn(systemAudioPath, [], spawnOptions);

    if (!systemAudioProc.pid) {
        console.error('Failed to start SystemAudioDump');
        return false;
    }

    console.log('SystemAudioDump started with PID:', systemAudioProc.pid);

    const CHUNK_DURATION = 0.1;
    const SAMPLE_RATE = 24000;
    const BYTES_PER_SAMPLE = 2;
    const CHANNELS = 2;
    const CHUNK_SIZE = SAMPLE_RATE * BYTES_PER_SAMPLE * CHANNELS * CHUNK_DURATION;

    let audioBuffer = Buffer.alloc(0);

    systemAudioProc.stdout.on('data', data => {
        audioBuffer = Buffer.concat([audioBuffer, data]);

        while (audioBuffer.length >= CHUNK_SIZE) {
            const chunk = audioBuffer.slice(0, CHUNK_SIZE);
            audioBuffer = audioBuffer.slice(CHUNK_SIZE);

            const monoChunk = CHANNELS === 2 ? convertStereoToMono(chunk) : chunk;
            const base64Data = monoChunk.toString('base64');
            sendAudioToProvider(base64Data);

            if (process.env.DEBUG_AUDIO) {
                saveDebugAudio(monoChunk, 'system_audio');
            }
        }

        const maxBufferSize = SAMPLE_RATE * BYTES_PER_SAMPLE * 1;
        if (audioBuffer.length > maxBufferSize) {
            audioBuffer = audioBuffer.slice(-maxBufferSize);
        }
    });

    systemAudioProc.stderr.on('data', data => {
        console.error('SystemAudioDump stderr:', data.toString());
    });

    systemAudioProc.on('close', code => {
        console.log('SystemAudioDump process closed with code:', code);
        systemAudioProc = null;
    });

    systemAudioProc.on('error', err => {
        console.error('SystemAudioDump process error:', err);
        systemAudioProc = null;
    });

    return true;
}

function convertStereoToMono(stereoBuffer) {
    const samples = stereoBuffer.length / 4;
    const monoBuffer = Buffer.alloc(samples * 2);

    for (let i = 0; i < samples; i++) {
        const leftSample = stereoBuffer.readInt16LE(i * 4);
        monoBuffer.writeInt16LE(leftSample, i * 2);
    }

    return monoBuffer;
}

function stopMacOSAudioCapture() {
    if (systemAudioProc) {
        console.log('Stopping SystemAudioDump...');
        systemAudioProc.kill('SIGTERM');
        systemAudioProc = null;
    }
}

async function sendAudioToProvider(base64Data) {
    if (!currentProvider) return;

    try {
        process.stdout.write('.');
        await currentProvider.sendAudio(base64Data, 'audio/pcm;rate=24000');
    } catch (error) {
        console.error('Error sending audio to provider:', error);
    }
}

function setupLLMIpcHandlers(providerRef) {
    // Store the provider ref globally
    global.llmProviderRef = providerRef;

    // Get available providers
    ipcMain.handle('get-available-providers', async event => {
        try {
            const providers = getAvailableProviders();
            return { success: true, providers };
        } catch (error) {
            console.error('Error getting available providers:', error);
            return { success: false, error: error.message };
        }
    });

    // Initialize LLM session
    ipcMain.handle('initialize-llm', async (event, providerName, apiKey, customPrompt, profile = 'interview', language = 'en-US') => {
        const success = await initializeLLMSession(providerName, apiKey, customPrompt, profile, language);
        if (success) {
            providerRef.current = currentProvider;
            providerRef.providerName = currentProviderName;
        }
        return success;
    });

    // Send audio content (only for Gemini)
    ipcMain.handle('send-audio-content', async (event, { data, mimeType }) => {
        if (!currentProvider) return { success: false, error: 'No active session' };
        if (currentProviderName !== 'gemini') {
            return { success: false, error: 'Audio streaming only supported by Gemini' };
        }

        try {
            process.stdout.write('.');
            const result = await currentProvider.sendAudio(data, mimeType);
            return result;
        } catch (error) {
            console.error('Error sending system audio:', error);
            return { success: false, error: error.message };
        }
    });

    // Send microphone audio (only for Gemini)
    ipcMain.handle('send-mic-audio-content', async (event, { data, mimeType }) => {
        if (!currentProvider) return { success: false, error: 'No active session' };
        if (currentProviderName !== 'gemini') {
            return { success: false, error: 'Audio streaming only supported by Gemini' };
        }

        try {
            process.stdout.write(',');
            const result = await currentProvider.sendAudio(data, mimeType);
            return result;
        } catch (error) {
            console.error('Error sending mic audio:', error);
            return { success: false, error: error.message };
        }
    });

    // Send image content
    ipcMain.handle('send-image-content', async (event, { data, debug }) => {
        if (!currentProvider) return { success: false, error: 'No active session' };

        try {
            if (!data || typeof data !== 'string') {
                console.error('Invalid image data received');
                return { success: false, error: 'Invalid image data' };
            }

            const buffer = Buffer.from(data, 'base64');

            if (buffer.length < 1000) {
                console.error(`Image buffer too small: ${buffer.length} bytes`);
                return { success: false, error: 'Image buffer too small' };
            }

            process.stdout.write('!');
            const result = await currentProvider.sendImage(data, 'image/jpeg');
            return result;
        } catch (error) {
            console.error('Error sending image:', error);
            return { success: false, error: error.message };
        }
    });

    // Send text message
    ipcMain.handle('send-text-message', async (event, text) => {
        if (!currentProvider) return { success: false, error: 'No active session' };

        try {
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                return { success: false, error: 'Invalid text message' };
            }

            console.log('Sending text message:', text);
            const result = await currentProvider.sendText(text.trim());
            return result;
        } catch (error) {
            console.error('Error sending text:', error);
            return { success: false, error: error.message };
        }
    });

    // macOS audio handlers
    ipcMain.handle('start-macos-audio', async event => {
        if (process.platform !== 'darwin') {
            return {
                success: false,
                error: 'macOS audio capture only available on macOS',
            };
        }

        try {
            const success = await startMacOSAudioCapture();
            return { success };
        } catch (error) {
            console.error('Error starting macOS audio capture:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('stop-macos-audio', async event => {
        try {
            stopMacOSAudioCapture();
            return { success: true };
        } catch (error) {
            console.error('Error stopping macOS audio capture:', error);
            return { success: false, error: error.message };
        }
    });

    // Close session
    ipcMain.handle('close-session', async event => {
        try {
            stopMacOSAudioCapture();

            if (currentProvider) {
                await currentProvider.closeSession();
                currentProvider = null;
            }

            return { success: true };
        } catch (error) {
            console.error('Error closing session:', error);
            return { success: false, error: error.message };
        }
    });

    // Close LLM session (for profile switching)
    ipcMain.handle('close-llm-session', async (event) => {
        try {
            if (currentProvider) {
                await currentProvider.closeSession();
                console.log('LLM session closed successfully');
            }
            return { success: true };
        } catch (error) {
            console.error('Error closing LLM session:', error);
            return { success: false, error: error.message };
        }
    });

    // Conversation history handlers
    ipcMain.handle('get-current-session', async event => {
        try {
            return { success: true, data: getCurrentSessionData() };
        } catch (error) {
            console.error('Error getting current session:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('start-new-session', async event => {
        try {
            initializeNewSession();
            return { success: true, sessionId: currentSessionId };
        } catch (error) {
            console.error('Error starting new session:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('update-google-search-setting', async (event, enabled) => {
        try {
            console.log('Google Search setting updated to:', enabled);
            return { success: true };
        } catch (error) {
            console.error('Error updating Google Search setting:', error);
            return { success: false, error: error.message };
        }
    });
}

module.exports = {
    initializeLLMSession,
    getEnabledTools,
    getStoredSetting,
    sendToRenderer,
    initializeNewSession,
    saveConversationTurn,
    getCurrentSessionData,
    killExistingSystemAudioDump,
    startMacOSAudioCapture,
    convertStereoToMono,
    stopMacOSAudioCapture,
    sendAudioToProvider,
    setupLLMIpcHandlers,
};
