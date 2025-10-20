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
        this.pendingImages = []; // Queue images instead of sending immediately
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

    _isVisionRelatedQuery(text) {
        // Check if the query is asking about visual content
        const visionKeywords = [
            'screen', 'image', 'picture', 'photo', 'see', 'look', 'show', 'display',
            'visual', 'screenshot', 'what do you see', 'describe', 'analyze',
            'this', 'that', 'here', 'current', 'now', 'interface', 'ui', 'page'
        ];
        
        const lowerText = text.toLowerCase();
        return visionKeywords.some(keyword => lowerText.includes(keyword));
    }

    async sendText(text) {
        if (!this.sessionActive) {
            return { success: false, error: 'No active session' };
        }

        try {
            // Check if we have pending images
            const hasPendingImages = this.pendingImages.length > 0;
            
            // Determine if we should use images based on query context
            const isVisionQuery = this._isVisionRelatedQuery(text);
            const shouldUseImages = hasPendingImages && isVisionQuery;

            // Build message content
            let messageContent;
            if (shouldUseImages) {
                // Combine text with pending images
                messageContent = [
                    { type: 'text', text: text },
                    ...this.pendingImages
                ];
                this.pendingImages = []; // Clear pending images after using them
            } else {
                // Text only - keep images queued for later
                messageContent = text;
                
                // If we have images but query is not vision-related, inform user
                if (hasPendingImages && !isVisionQuery) {
                    console.log(`Text-only query detected. ${this.pendingImages.length} images remain queued.`);
                }
            }

            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: messageContent,
            });

            if (this.callbacks.onStatusUpdate) {
                const status = shouldUseImages 
                    ? `Processing with ${this.pendingImages.length} images...` 
                    : 'Processing...';
                this.callbacks.onStatusUpdate(status);
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
            // Queue the image instead of sending immediately (like Gemini)
            // Images will be sent when user sends text or explicitly requests analysis
            this.pendingImages.push({
                type: 'image_url',
                image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                },
            });

            // Most models support 5-10 images, keep only the most recent 10
            const MAX_IMAGES = 10;
            if (this.pendingImages.length > MAX_IMAGES) {
                this.pendingImages = this.pendingImages.slice(-MAX_IMAGES);
            }

            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate(`Image queued (${this.pendingImages.length} pending)`);
            }

            return { success: true };
        } catch (error) {
            console.error('Error queuing image for OpenRouter:', error);
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

    /**
     * Clear all pending images without sending them
     */
    clearPendingImages() {
        const count = this.pendingImages.length;
        this.pendingImages = [];
        console.log(`Cleared ${count} pending images`);
        if (this.callbacks.onStatusUpdate) {
            this.callbacks.onStatusUpdate('Pending images cleared');
        }
    }

    /**
     * Get count of pending images
     */
    getPendingImageCount() {
        return this.pendingImages.length;
    }

    async closeSession() {
        this.conversationHistory = [];
        this.pendingImages = [];
        this.sessionActive = false;
    }
}

module.exports = { OpenRouterProvider };
