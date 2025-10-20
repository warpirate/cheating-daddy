# Groq Provider - Multi-Model & Tools Support

## Overview

The Groq provider now supports:
- **Multi-model approach**: Automatically switches between text and vision models
- **Tool use**: Both models support function calling
- **Ultra-fast inference**: Leveraging Groq's speed for both text and vision tasks
- **Image queuing**: Images are queued and sent with the next text message (like Gemini)

## Models Used

### Text Model (Default)
- **Model**: `openai/gpt-oss-120b`
- **Use case**: Text-only conversations, tool calls
- **Features**: Fast text generation, tool use support

### Vision Model
- **Model**: `meta-llama/llama-4-scout-17b-16e-instruct`
- **Use case**: Image analysis, visual question answering
- **Features**: Vision + text, tool use support, multi-turn conversations
- **Limits**: 
  - Max 5 images per request
  - Max 20MB per image URL
  - Max 4MB for base64 encoded images
  - Max 33 megapixels per image

## How It Works

The provider intelligently manages images and automatically switches models:

1. **Screenshots are captured** → Images are queued (max 5, keeps most recent)
2. **User sends text message** → Provider analyzes the query:
   - **Vision-related query** (contains keywords like "screen", "see", "show", "this", etc.)
     - Uses `meta-llama/llama-4-scout-17b-16e-instruct` (vision model)
     - Sends text + queued images together
     - Clears image queue after sending
   - **Text-only query** (e.g., "what is AI?", "explain architecture")
     - Uses `openai/gpt-oss-120b` (text model) for faster response
     - Keeps images queued for next vision-related query
3. **AI responds** → Ready for next interaction

### Smart Vision Detection

The provider automatically detects if your question needs visual context by looking for keywords:
- `screen`, `image`, `picture`, `photo`, `see`, `look`, `show`, `display`
- `visual`, `screenshot`, `describe`, `analyze`
- `this`, `that`, `here`, `current`, `now`, `interface`, `ui`, `page`

**Examples:**
- ✅ "What do you see on the screen?" → Uses vision model with images
- ✅ "Describe this interface" → Uses vision model with images
- ❌ "What is AI agents?" → Uses text model, keeps images queued
- ❌ "Explain the architecture" → Uses text model, keeps images queued

This smart detection prevents the "too many images" error and ensures faster responses for text-only questions.

## Tool Use

Both models support OpenAI-compatible tool definitions. Tools allow the LLM to:
- Call external APIs
- Perform calculations
- Access databases
- Execute custom functions

### Example Tool Definition

```javascript
const tools = [
    {
        type: "function",
        function: {
            name: "get_weather",
            description: "Get the current weather for a location",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "The city and state, e.g. San Francisco, CA"
                    },
                    unit: {
                        type: "string",
                        enum: ["celsius", "fahrenheit"],
                        description: "Temperature unit"
                    }
                },
                required: ["location"]
            }
        }
    }
];
```

### Using Tools with Text

```javascript
// Send text with tools
await groqProvider.sendWithTools("What's the weather in New York?", tools);
```

### Using Tools with Images

```javascript
// Send image with tools (e.g., identify location and get weather)
await groqProvider.sendImageWithTools(base64Image, 'image/jpeg', tools);
```

## Configuration

You can customize the models used:

```javascript
const groqProvider = new GroqProvider(apiKey, {
    textModel: 'openai/gpt-oss-120b',  // Custom text model
    visionModel: 'meta-llama/llama-4-scout-17b-16e-instruct'  // Custom vision model
});
```

## Supported Models with Tool Use

According to Groq documentation, these models support tool use:

| Model | Tool Use | Parallel Tools | JSON Mode |
|-------|----------|----------------|-----------|
| openai/gpt-oss-120b | ✅ | ❌ | ✅ |
| openai/gpt-oss-20b | ✅ | ❌ | ✅ |
| meta-llama/llama-4-scout-17b-16e-instruct | ✅ | ✅ | ✅ |
| meta-llama/llama-4-maverick-17b-128e-instruct | ✅ | ✅ | ✅ |
| llama-3.3-70b-versatile | ✅ | ✅ | ✅ |

## Benefits

1. **Automatic model selection**: No need to manually switch models
2. **Optimized performance**: Text model for fast text, vision model for images
3. **Tool support**: Both models can call external functions
4. **Seamless experience**: Conversation history maintained across model switches

## API Reference

### Methods

- `sendText(text, tools)` - Send text message (optionally with tools)
- `sendImage(base64Data, mimeType, tools)` - Send image (optionally with tools)
- `sendWithTools(text, tools)` - Send text with tool support
- `sendImageWithTools(base64Data, mimeType, tools)` - Send image with tool support

## Learn More

- [Groq Vision Documentation](https://console.groq.com/docs/vision)
- [Groq Tool Use Documentation](https://console.groq.com/docs/tool-use)
