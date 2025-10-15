const { BaseLLMProvider } = require('./base');
const { getSystemPrompt } = require('../prompts');
const https = require('https');

/**
 * OpenRouter Provider
 * Access to 100+ models through a single API
 * Requires transcribed audio (no real-time streaming)
 */
class OpenRouterProvider extends BaseLLMProvider {
    constructor(apiKey, config = {}) {
        super(apiKey, config);
        this.baseUrl = 'openrouter.ai';
        // Default to a vision-capable model
        this.model = config.model || 'anthropic/claude-3.5-sonnet';
        this.conversationHistory = [];
        this.systemPrompt = '';
        this.callbacks = config.callbacks || {};
        this.appName = config.appName || 'CheatingDaddy';
    }

    getName() {
        return 'openrouter';
    }

    getDisplayName() {
        return 'OpenRouter (Multi-model)';
    }

    getCapabilities() {
        return {
            supportsRealtimeAudio: false,
            supportsVision: true,
            supportsStreaming: true,
            supportsTools: false,
            requiresTranscription: true,
        };
    }

    async initializeSession(options = {}) {
        const { profile = 'interview', customPrompt = '' } = options;

        // OpenRouter doesn't support Google Search directly
        this.systemPrompt = getSystemPrompt(profile, customPrompt, false);
        this.conversationHistory = [];
        this.sessionActive = true;

        if (this.callbacks.onStatusUpdate) {
            this.callbacks.onStatusUpdate('OpenRouter session ready');
        }

        return true;
    }

    async _makeRequest(messages, stream = true) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                model: this.model,
                messages: [{ role: 'system', content: this.systemPrompt }, ...messages],
                stream: stream,
                temperature: 0.7,
                max_tokens: 2048,
            });

            const options = {
                hostname: this.baseUrl,
                port: 443,
                path: '/api/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://github.com/sohzm/cheating-daddy',
                    'X-Title': this.appName,
                    'Content-Length': Buffer.byteLength(postData),
                },
            };

            const req = https.request(options, (res) => {
                if (res.statusCode !== 200) {
                    let errorData = '';
                    res.on('data', (chunk) => {
                        errorData += chunk;
                    });
                    res.on('end', () => {
                        reject(new Error(`OpenRouter API error: ${res.statusCode} - ${errorData}`));
                    });
                } else {
                    resolve(res);
                }
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    }

    async _handleStreamingResponse(response) {
        return new Promise((resolve, reject) => {
            let fullResponse = '';
            let buffer = '';

            response.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                fullResponse += content;
                                if (this.callbacks.onResponse) {
                                    this.callbacks.onResponse(fullResponse);
                                }
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            });

            response.on('end', () => {
                resolve(fullResponse);
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
    }

    async sendText(text) {
        if (!this.sessionActive) {
            return { success: false, error: 'No active session' };
        }

        try {
            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: text,
            });

            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate('Processing...');
            }

            const response = await this._makeRequest(this.conversationHistory, true);
            const fullResponse = await this._handleStreamingResponse(response);

            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: fullResponse,
            });

            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate('Ready');
            }

            if (this.callbacks.onConversationTurn) {
                this.callbacks.onConversationTurn(text, fullResponse);
            }

            return { success: true, response: fullResponse };
        } catch (error) {
            console.error('Error sending text to OpenRouter:', error);
            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate('Error: ' + error.message);
            }
            return { success: false, error: error.message };
        }
    }

    async sendImage(base64Data, mimeType = 'image/jpeg') {
        if (!this.sessionActive) {
            return { success: false, error: 'No active session' };
        }

        try {
            // Add image to conversation history
            this.conversationHistory.push({
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:${mimeType};base64,${base64Data}`,
                        },
                    },
                ],
            });

            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate('Processing image...');
            }

            const response = await this._makeRequest(this.conversationHistory, true);
            const fullResponse = await this._handleStreamingResponse(response);

            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: fullResponse,
            });

            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate('Ready');
            }

            return { success: true, response: fullResponse };
        } catch (error) {
            console.error('Error sending image to OpenRouter:', error);
            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate('Error: ' + error.message);
            }
            return { success: false, error: error.message };
        }
    }

    async sendTranscription(transcription) {
        // For OpenRouter, transcriptions are sent as regular text
        return this.sendText(transcription);
    }

    async closeSession() {
        this.conversationHistory = [];
        this.sessionActive = false;
    }
}

module.exports = { OpenRouterProvider };
