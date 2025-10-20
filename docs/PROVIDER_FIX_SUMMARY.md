# Provider Fix Summary - Image Queuing

## Problem

Groq and OpenRouter providers were responding immediately when screenshots were captured, even before the user pressed Enter or provided any input. This was different from Gemini's behavior and caused unwanted AI responses.

## Root Cause

The `sendImage()` method in Groq and OpenRouter was immediately:
1. Adding the image to conversation history
2. Making an API request
3. Getting and displaying a response

This is different from Gemini, which:
1. Queues images without triggering responses
2. Only responds when user explicitly sends audio/text input

## Solution

Updated both Groq and OpenRouter providers to match Gemini's behavior:

### Changes Made

1. **Added image queue**: `this.pendingImages = []` to store images temporarily
2. **Modified `sendImage()`**: Now queues images instead of sending them immediately
3. **Modified `sendText()`**: Checks for pending images and includes them in the request
4. **Model selection**: Groq automatically switches to vision model when images are present

### How It Works Now

```
Screenshot captured → Image queued (no API call)
Screenshot captured → Another image queued (no API call)
User types message and presses Enter → API call with text + all queued images
AI responds → Pending images cleared
```

## Benefits

1. **User control**: AI only responds when user explicitly requests it
2. **Better UX**: No unexpected responses from automatic screenshots
3. **Consistent behavior**: All providers (Gemini, Groq, OpenRouter) work the same way
4. **Efficient**: Multiple screenshots can be sent together with one text message

## Provider Comparison

| Provider | Audio Streaming | Image Handling | Response Trigger |
|----------|----------------|----------------|------------------|
| Gemini | ✅ Real-time | Queued | User input (audio/text) |
| Groq | ❌ Transcription only | Queued | User input (text) |
| OpenRouter | ❌ Transcription only | Queued | User input (text) |

## Testing

To verify the fix works:

1. Start a session with Groq or OpenRouter
2. Enable automatic screenshots (e.g., every 5 seconds)
3. Wait for screenshots to be captured
4. Verify: AI should NOT respond automatically
5. Type a message and press Enter
6. Verify: AI responds with analysis of the queued screenshots

## Technical Details

### Groq Multi-Model Logic

```javascript
// When user sends text:
const hasPendingImages = this.pendingImages.length > 0;
this.currentModel = hasPendingImages ? this.visionModel : this.textModel;

// Build message with images if present
let messageContent = hasPendingImages 
    ? [{ type: 'text', text: text }, ...this.pendingImages]
    : text;

// Clear pending images after sending
this.pendingImages = [];
```

### OpenRouter Logic

Same approach as Groq, but uses a single configurable model (default: `anthropic/claude-3.5-sonnet`) that supports both text and vision.

## Files Modified

- `src/utils/providers/groq.js` - Added image queuing and multi-model support
- `src/utils/providers/openrouter.js` - Added image queuing
- `GROQ_FEATURES.md` - Updated documentation
- `PROVIDER_FIX_SUMMARY.md` - This file
