# LLM Provider Integration Guide

This document explains the multi-provider LLM system implemented in MeharNolan.

## Overview

The application now supports multiple LLM providers:

-   **Google Gemini** (default) - Real-time audio streaming + vision
-   **Groq** - Ultra-fast inference with vision
-   **OpenRouter** - Access to 100+ models (GPT-4, Claude, Llama, etc.)

## Architecture

### Provider Abstraction Layer

All providers implement the `BaseLLMProvider` interface located in `/src/utils/providers/base.js`:

```
src/utils/providers/
├── base.js          # Base provider interface
├── gemini.js        # Google Gemini implementation
├── groq.js          # Groq implementation
├── openrouter.js    # OpenRouter implementation
└── factory.js       # Provider factory
```

### Key Capabilities

| Provider   | Real-time Audio | Vision | Streaming | Tools              |
| ---------- | --------------- | ------ | --------- | ------------------ |
| Gemini     | ✅              | ✅     | ✅        | ✅ (Google Search) |
| Groq       | ❌              | ✅     | ✅        | ❌                 |
| OpenRouter | ❌              | ✅     | ✅        | ❌                 |

## How It Works

### 1. Provider Selection (UI)

Users select their provider in `MainView.js`:

-   Provider dropdown with descriptions
-   Dynamic API key placeholder
-   Warning messages for non-audio providers

### 2. Session Initialization

When "Start Session" is clicked:

```javascript
// renderer.js
async function initializeLLM(profile, language) {
    const apiKey = localStorage.getItem('apiKey');
    const providerName = localStorage.getItem('llmProvider') || 'gemini';

    await ipcRenderer.invoke('initialize-llm', providerName, apiKey, customPrompt, profile, language);
}
```

### 3. Provider Instance Creation

```javascript
// llmProvider.js
const currentProvider = createProvider(providerName, apiKey, { callbacks });
await currentProvider.initializeSession({ profile, language, customPrompt, tools });
```

### 4. Data Flow

**For Gemini (Real-time Audio):**

```
Audio Stream → SystemAudioDump → Base64 → sendAudio() → Gemini Live API
Screenshots → Base64 → sendImage() → Gemini Live API
Text → sendText() → Gemini Live API
```

**For Groq/OpenRouter (Vision + Text):**

```
Screenshots → Base64 → sendImage() → Chat Completions API
Text → sendText() → Chat Completions API
Audio → ❌ Not supported (requires transcription)
```

## Input Formats

### Audio (Gemini only)

-   **Format**: PCM, 24kHz, mono, base64 encoded
-   **Chunk Duration**: 0.1 seconds
-   **Streaming**: Real-time via `sendRealtimeInput()`

### Images (All providers)

-   **Format**: JPEG, base64 encoded
-   **Quality**: Configurable (low/medium/high)
-   **Interval**: 5s, 10s, 15s, 30s, or manual

### Text (All providers)

-   **Format**: Plain text strings
-   **Use cases**: Manual messages, transcriptions

## Adding a New Provider

### Step 1: Create Provider Class

Create `/src/utils/providers/yourprovider.js`:

```javascript
const { BaseLLMProvider } = require('./base');

class YourProvider extends BaseLLMProvider {
    getName() {
        return 'yourprovider';
    }

    getDisplayName() {
        return 'Your Provider Name';
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

    async initializeSession(options) {
        // Initialize your provider
        this.sessionActive = true;
        return true;
    }

    async sendText(text) {
        // Send text to your provider
        return { success: true };
    }

    async sendImage(base64Data, mimeType) {
        // Send image to your provider
        return { success: true };
    }

    async closeSession() {
        this.sessionActive = false;
    }
}

module.exports = { YourProvider };
```

### Step 2: Register in Factory

Update `/src/utils/providers/factory.js`:

```javascript
const { YourProvider } = require('./yourprovider');

const PROVIDERS = {
    // ... existing providers
    yourprovider: {
        class: YourProvider,
        displayName: 'Your Provider',
        description: 'Description of your provider',
        requiresTranscription: true,
        supportsAudio: false,
    },
};
```

### Step 3: Add to UI

Update `MainView.js`:

```javascript
<select .value=${this.selectedProvider} @change=${this.handleProviderChange}>
    <option value="gemini">Google Gemini (Real-time Audio)</option>
    <option value="groq">Groq (Ultra-fast)</option>
    <option value="openrouter">OpenRouter (Multi-model)</option>
    <option value="yourprovider">Your Provider</option>
</select>
```

## API Keys

### Getting API Keys

**Google Gemini:**

-   Visit: https://aistudio.google.com/apikey
-   Free tier: 15 requests/minute

**Groq:**

-   Visit: https://console.groq.com/keys
-   Free tier: 30 requests/minute

**OpenRouter:**

-   Visit: https://openrouter.ai/keys
-   Pay-per-use: $0.01+ per request (varies by model)

### Storing API Keys

API keys are stored in localStorage:

```javascript
localStorage.setItem('apiKey', 'your-api-key');
localStorage.setItem('llmProvider', 'gemini'); // or 'groq', 'openrouter'
```

## Provider-Specific Notes

### Google Gemini

**Model**: `gemini-live-2.5-flash-preview`

**Features**:

-   Real-time audio streaming (unique to Gemini)
-   Speaker diarization (identifies interviewer vs candidate)
-   Google Search tool integration
-   Context window compression

**Best for**: Live interviews with audio

### Groq

**Model**: `llama-3.2-90b-vision-preview`

**Features**:

-   Ultra-fast inference (LPU technology)
-   Vision support for screenshots
-   Streaming responses
-   Very low latency

**Best for**: Screenshot-based assistance where speed matters

**Limitations**:

-   No real-time audio streaming
-   No tool/function calling
-   Requires manual screenshot capture or intervals

### OpenRouter

**Default Model**: `anthropic/claude-3.5-sonnet`

**Features**:

-   Access to 100+ models via single API
-   Model switching without code changes
-   Unified billing across providers
-   Vision support (model-dependent)

**Best for**: Experimenting with different models

**Limitations**:

-   No real-time audio streaming
-   Pricing varies by model
-   Some models don't support vision

## Callbacks

All providers support these callbacks:

```javascript
const callbacks = {
    onStatusUpdate: status => {
        // Update UI status
    },
    onResponse: response => {
        // Stream response to UI
    },
    onConversationTurn: (transcription, response) => {
        // Save conversation history
    },
    onError: error => {
        // Handle errors
    },
    onClose: event => {
        // Handle session close
    },
};
```

## Testing

### Manual Testing

1. Select a provider in the UI
2. Enter valid API key
3. Click "Start Session"
4. Verify:
    - Status updates appear
    - Screenshots are captured
    - Responses stream correctly
    - Audio works (Gemini only)

### Provider Switching

1. Start session with Provider A
2. Close session
3. Switch to Provider B
4. Start new session
5. Verify Provider B is active

## Troubleshooting

### "No active session" error

-   Ensure provider initialized successfully
-   Check API key is valid
-   Verify network connectivity

### Images not sending

-   Check base64 encoding is correct
-   Verify image size > 1KB
-   Ensure provider supports vision

### Audio not working (Gemini)

-   Only works on macOS with SystemAudioDump
-   Verify SystemAudioDump has permissions
-   Check audio device is active

### Streaming not working

-   Verify provider supports streaming
-   Check network isn't blocking SSE
-   Look for CORS issues in console

## Performance Considerations

### Token Usage

-   **Gemini**: Audio = 32 tokens/sec, Images = 258-2064 tokens
-   **Groq**: Very fast, low cost per token
-   **OpenRouter**: Varies by model

### Rate Limiting

-   Implement token tracking (already done in renderer.js)
-   Respect provider rate limits
-   Use appropriate screenshot intervals

### Memory

-   Audio buffers are cleared after processing
-   Conversation history grows over time
-   Consider limiting history length for long sessions

## Future Enhancements

1. **Audio Transcription**: Add Web Speech API or Whisper for non-Gemini providers
2. **Model Selection**: Allow users to choose specific models per provider
3. **Fallback**: Auto-switch providers on failure
4. **Cost Tracking**: Show estimated costs per session
5. **Provider Comparison**: Side-by-side response comparison

## Contributing

When adding new providers:

1. Follow the `BaseLLMProvider` interface
2. Add comprehensive error handling
3. Support streaming when possible
4. Document capabilities clearly
5. Test with various input types
6. Update this guide

## License

GPL-3.0 - Same as main project
