const { GeminiProvider } = require('./gemini');
const { GroqProvider } = require('./groq');
const { OpenRouterProvider } = require('./openrouter');

/**
 * Provider Factory
 * Creates and manages LLM provider instances
 */

const PROVIDERS = {
    gemini: {
        class: GeminiProvider,
        displayName: 'Google Gemini',
        description: 'Real-time audio + vision support',
        requiresTranscription: false,
        supportsAudio: true,
    },
    groq: {
        class: GroqProvider,
        displayName: 'Groq',
        description: 'Ultra-fast inference with vision',
        requiresTranscription: true,
        supportsAudio: false,
    },
    openrouter: {
        class: OpenRouterProvider,
        displayName: 'OpenRouter',
        description: 'Access 100+ models',
        requiresTranscription: true,
        supportsAudio: false,
    },
};

/**
 * Get list of available providers
 * @returns {Array} Array of provider info objects
 */
function getAvailableProviders() {
    return Object.entries(PROVIDERS).map(([key, info]) => ({
        id: key,
        displayName: info.displayName,
        description: info.description,
        requiresTranscription: info.requiresTranscription,
        supportsAudio: info.supportsAudio,
    }));
}

/**
 * Create a provider instance
 * @param {string} providerName - Provider name (gemini, groq, openrouter)
 * @param {string} apiKey - API key for the provider
 * @param {Object} config - Provider configuration
 * @returns {BaseLLMProvider} Provider instance
 */
function createProvider(providerName, apiKey, config = {}) {
    const provider = PROVIDERS[providerName];
    if (!provider) {
        throw new Error(`Unknown provider: ${providerName}`);
    }

    return new provider.class(apiKey, config);
}

/**
 * Get provider info
 * @param {string} providerName - Provider name
 * @returns {Object} Provider info
 */
function getProviderInfo(providerName) {
    return PROVIDERS[providerName] || null;
}

module.exports = {
    createProvider,
    getAvailableProviders,
    getProviderInfo,
    PROVIDERS,
};
