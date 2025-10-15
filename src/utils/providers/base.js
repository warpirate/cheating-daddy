/**
 * Base Provider Interface
 * All LLM providers must implement this interface
 */

class BaseLLMProvider {
    constructor(apiKey, config = {}) {
        this.apiKey = apiKey;
        this.config = config;
        this.sessionActive = false;
    }

    /**
     * Get provider capabilities
     * @returns {Object} Capabilities object
     */
    getCapabilities() {
        return {
            supportsRealtimeAudio: false, // Real-time audio streaming
            supportsVision: false, // Image/vision input
            supportsStreaming: false, // Streaming text responses
            supportsTools: false, // Function calling / tools
            requiresTranscription: false, // Needs audio transcribed to text
        };
    }

    /**
     * Initialize a session with the provider
     * @param {Object} options - Session options (profile, language, customPrompt, etc.)
     * @returns {Promise<boolean>} Success status
     */
    async initializeSession(options) {
        throw new Error('initializeSession must be implemented by provider');
    }

    /**
     * Send text message to the provider
     * @param {string} text - Text message
     * @returns {Promise<Object>} Result object
     */
    async sendText(text) {
        throw new Error('sendText must be implemented by provider');
    }

    /**
     * Send image to the provider
     * @param {string} base64Data - Base64 encoded image
     * @param {string} mimeType - Image mime type
     * @returns {Promise<Object>} Result object
     */
    async sendImage(base64Data, mimeType = 'image/jpeg') {
        throw new Error('sendImage must be implemented by provider');
    }

    /**
     * Send audio to the provider (for real-time audio streaming)
     * @param {string} base64Data - Base64 encoded audio
     * @param {string} mimeType - Audio mime type
     * @returns {Promise<Object>} Result object
     */
    async sendAudio(base64Data, mimeType) {
        throw new Error('sendAudio not supported by this provider');
    }

    /**
     * Send transcribed audio as text
     * @param {string} transcription - Transcribed text
     * @returns {Promise<Object>} Result object
     */
    async sendTranscription(transcription) {
        return this.sendText(transcription);
    }

    /**
     * Close the session
     * @returns {Promise<void>}
     */
    async closeSession() {
        this.sessionActive = false;
    }

    /**
     * Get provider name
     * @returns {string} Provider name
     */
    getName() {
        throw new Error('getName must be implemented by provider');
    }

    /**
     * Get provider display name
     * @returns {string} Display name
     */
    getDisplayName() {
        return this.getName();
    }
}

module.exports = { BaseLLMProvider };
