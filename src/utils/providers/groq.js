const { BaseLLMProvider } = require('./base');
const { getSystemPrompt } = require('../prompts');
const https = require('https');

/**
 * Groq Provider
 * Ultra-fast inference with multi-model support (text + vision) and tools
 * Requires transcribed audio (no real-time streaming)
 */
class GroqProvider extends BaseLLMProvider {
    constructor(apiKey, config = {}) {
        super(apiKey, config);
        this.baseUrl = 'api.groq.com';
        
        // Multi-model configuration
        this.textModel = config.textModel || 'openai/gpt-oss-120b';
        this.visionModel = config.visionModel || 'meta-llama/llama-4-scout-17b-16e-instruct';
        this.currentModel = this.textModel; // Start with text model
        
        this.conversationHistory = [];
        this.pendingImages = []; // Queue images instead of sending immediately
        this.systemPrompt = '';
        this.callbacks = config.callbacks || {};
    }

    getName() {
        return 'groq';
    }

    getDisplayName() {
        return 'Groq (Ultra-fast + Vision)';
    }

    getCapabilities() {
        return {
            supportsRealtimeAudio: false,
            supportsVision: true, // Vision supported via visionModel
            supportsStreaming: true,
            supportsTools: true, // Both models support tools
            requiresTranscription: true,
        };
    }

    async initializeSession(options = {}) {
        const { profile = 'interview', customPrompt = '' } = options;

        // Groq doesn't support Google Search, so pass false
        this.systemPrompt = getSystemPrompt(profile, customPrompt, false);
        this.conversationHistory = [];
        this.sessionActive = true;

        if (this.callbacks.onStatusUpdate) {
            this.callbacks.onStatusUpdate('Groq session ready');
        }

        return true;
    }

    async _makeRequest(messages, stream = true, tools = null) {
        return new Promise((resolve, reject) => {
            const requestBody = {
                model: this.currentModel,
                messages: [{ role: 'system', content: this.systemPrompt }, ...messages],
                stream: stream,
                temperature: 0.7,
                max_completion_tokens: 2048,
            };

            // Add tools if provided
            if (tools && tools.length > 0) {
                requestBody.tools = tools;
                requestBody.tool_choice = 'auto';
            }

            const postData = JSON.stringify(requestBody);

            const options = {
                hostname: this.baseUrl,
                port: 443,
                path: '/openai/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
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
                        reject(new Error(`Groq API error: ${res.statusCode} - ${errorData}`));
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

    async sendText(text, tools = null) {
        if (!this.sessionActive) {
            return { success: false, error: 'No active session' };
        }

        try {
            // Check if we have pending images
            const hasPendingImages = this.pendingImages.length > 0;
            
            // Determine if we should use images based on query context
            const isVisionQuery = this._isVisionRelatedQuery(text);
            const shouldUseImages = hasPendingImages && isVisionQuery;

            // Choose model based on whether we're using images
            this.currentModel = shouldUseImages ? this.visionModel : this.textModel;

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

            const response = await this._makeRequest(this.conversationHistory, true, tools);
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
            console.error('Error sending text to Groq:', error);
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

            // Groq vision model supports max 5 images - keep only the most recent 5
            const MAX_IMAGES = 5;
            if (this.pendingImages.length > MAX_IMAGES) {
                this.pendingImages = this.pendingImages.slice(-MAX_IMAGES);
            }

            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate(`Image queued (${this.pendingImages.length} pending)`);
            }

            return { success: true };
        } catch (error) {
            console.error('Error queuing image for Groq:', error);
            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate('Error: ' + error.message);
            }
            return { success: false, error: error.message };
        }
    }

    async sendTranscription(transcription) {
        // For Groq, transcriptions are sent as regular text
        return this.sendText(transcription);
    }

    /**
     * Send a message with tool support
     * @param {string} text - The text message
     * @param {Array} tools - Array of tool definitions (OpenAI format)
     * @returns {Promise<Object>} Response with tool calls if any
     */
    async sendWithTools(text, tools) {
        if (!this.sessionActive) {
            return { success: false, error: 'No active session' };
        }

        try {
            // Use text model for tool calls
            this.currentModel = this.textModel;

            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: text,
            });

            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate('Processing with tools...');
            }

            const response = await this._makeRequest(this.conversationHistory, true, tools);
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
            console.error('Error sending with tools to Groq:', error);
            if (this.callbacks.onStatusUpdate) {
                this.callbacks.onStatusUpdate('Error: ' + error.message);
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Send an image with tool support
     * @param {string} base64Data - Base64 encoded image
     * @param {string} mimeType - Image MIME type
     * @param {Array} tools - Array of tool definitions (OpenAI format)
     * @returns {Promise<Object>} Response with tool calls if any
     */
    async sendImageWithTools(base64Data, mimeType = 'image/jpeg', tools) {
        return this.sendImage(base64Data, mimeType, tools);
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

module.exports = { GroqProvider };
