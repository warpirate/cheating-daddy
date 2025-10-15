const { GoogleGenAI } = require('@google/genai');
const { BaseLLMProvider } = require('./base');
const { getSystemPrompt } = require('../prompts');

/**
 * Google Gemini Provider
 * Supports real-time audio streaming, vision, and tools
 */
class GeminiProvider extends BaseLLMProvider {
    constructor(apiKey, config = {}) {
        super(apiKey, config);
        this.client = null;
        this.session = null;
        this.messageBuffer = '';
        this.currentTranscription = '';
        this.callbacks = config.callbacks || {};
    }

    getName() {
        return 'gemini';
    }

    getDisplayName() {
        return 'Google Gemini (Real-time Audio)';
    }

    getCapabilities() {
        return {
            supportsRealtimeAudio: true,
            supportsVision: true,
            supportsStreaming: true,
            supportsTools: true,
            requiresTranscription: false,
        };
    }

    async initializeSession(options = {}) {
        const { profile = 'interview', language = 'en-US', customPrompt = '', tools = [] } = options;

        this.client = new GoogleGenAI({
            vertexai: false,
            apiKey: this.apiKey,
        });

        const googleSearchEnabled = tools.some(tool => tool.googleSearch);
        const systemPrompt = getSystemPrompt(profile, customPrompt, googleSearchEnabled);

        try {
            this.session = await this.client.live.connect({
                model: 'gemini-live-2.5-flash-preview',
                callbacks: {
                    onopen: () => {
                        this.sessionActive = true;
                        if (this.callbacks.onStatusUpdate) {
                            this.callbacks.onStatusUpdate('Live session connected');
                        }
                    },
                    onmessage: message => {
                        this._handleMessage(message);
                    },
                    onerror: e => {
                        console.error('Gemini error:', e.message);
                        if (this.callbacks.onStatusUpdate) {
                            this.callbacks.onStatusUpdate('Error: ' + e.message);
                        }
                        if (this.callbacks.onError) {
                            this.callbacks.onError(e);
                        }
                    },
                    onclose: e => {
                        console.log('Gemini session closed:', e.reason);
                        this.sessionActive = false;
                        if (this.callbacks.onStatusUpdate) {
                            this.callbacks.onStatusUpdate('Session closed');
                        }
                        if (this.callbacks.onClose) {
                            this.callbacks.onClose(e);
                        }
                    },
                },
                config: {
                    responseModalities: ['TEXT'],
                    tools: tools,
                    inputAudioTranscription: {
                        enableSpeakerDiarization: true,
                        minSpeakerCount: 2,
                        maxSpeakerCount: 2,
                    },
                    contextWindowCompression: { slidingWindow: {} },
                    speechConfig: { languageCode: language },
                    systemInstruction: {
                        parts: [{ text: systemPrompt }],
                    },
                },
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize Gemini session:', error);
            return false;
        }
    }

    _handleMessage(message) {
        // Handle input transcription
        if (message.serverContent?.inputTranscription?.results) {
            const results = message.serverContent.inputTranscription.results;
            for (const result of results) {
                if (result.transcript && result.speakerId) {
                    const speakerLabel = result.speakerId === 1 ? 'Interviewer' : 'Candidate';
                    this.currentTranscription += `[${speakerLabel}]: ${result.transcript}\n`;
                }
            }
        }

        // Handle AI model response
        if (message.serverContent?.modelTurn?.parts) {
            for (const part of message.serverContent.modelTurn.parts) {
                if (part.text) {
                    this.messageBuffer += part.text;
                    if (this.callbacks.onResponse) {
                        this.callbacks.onResponse(this.messageBuffer);
                    }
                }
            }
        }

        // Handle generation complete
        if (message.serverContent?.generationComplete) {
            if (this.callbacks.onResponse) {
                this.callbacks.onResponse(this.messageBuffer);
            }
            if (this.callbacks.onConversationTurn) {
                this.callbacks.onConversationTurn(this.currentTranscription, this.messageBuffer);
            }
            this.currentTranscription = '';
            this.messageBuffer = '';
        }

        // Handle turn complete
        if (message.serverContent?.turnComplete) {
            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate('Listening...');
            }
        }
    }

    async sendText(text) {
        if (!this.session || !this.sessionActive) {
            return { success: false, error: 'No active session' };
        }

        try {
            await this.session.sendRealtimeInput({ text: text.trim() });
            return { success: true };
        } catch (error) {
            console.error('Error sending text to Gemini:', error);
            return { success: false, error: error.message };
        }
    }

    async sendImage(base64Data, mimeType = 'image/jpeg') {
        if (!this.session || !this.sessionActive) {
            return { success: false, error: 'No active session' };
        }

        try {
            await this.session.sendRealtimeInput({
                media: { data: base64Data, mimeType: mimeType },
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending image to Gemini:', error);
            return { success: false, error: error.message };
        }
    }

    async sendAudio(base64Data, mimeType = 'audio/pcm;rate=24000') {
        if (!this.session || !this.sessionActive) {
            return { success: false, error: 'No active session' };
        }

        try {
            await this.session.sendRealtimeInput({
                audio: { data: base64Data, mimeType: mimeType },
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending audio to Gemini:', error);
            return { success: false, error: error.message };
        }
    }

    async closeSession() {
        if (this.session) {
            try {
                await this.session.close();
            } catch (error) {
                console.error('Error closing Gemini session:', error);
            }
            this.session = null;
        }
        this.sessionActive = false;
    }
}

module.exports = { GeminiProvider };
