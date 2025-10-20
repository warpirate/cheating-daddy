# Vision Detection Fix

## Problem

When asking text-only questions like "What is AI agents? Explain the architectures", the provider was trying to send all queued screenshots (more than 5) with the query, causing:
```
Error: Too many images provided. This model supports up to 5 images
```

## Root Cause

The provider was blindly including ALL pending images with EVERY text query, regardless of whether the question needed visual context.

## Solution

Implemented **smart vision detection** that analyzes the user's query to determine if it needs visual context:

### 1. Vision Keywords Detection

```javascript
_isVisionRelatedQuery(text) {
    const visionKeywords = [
        'screen', 'image', 'picture', 'photo', 'see', 'look', 'show', 'display',
        'visual', 'screenshot', 'what do you see', 'describe', 'analyze',
        'this', 'that', 'here', 'current', 'now', 'interface', 'ui', 'page'
    ];
    
    const lowerText = text.toLowerCase();
    return visionKeywords.some(keyword => lowerText.includes(keyword));
}
```

### 2. Conditional Image Usage

```javascript
const isVisionQuery = this._isVisionRelatedQuery(text);
const shouldUseImages = hasPendingImages && isVisionQuery;

if (shouldUseImages) {
    // Use vision model with images
    messageContent = [{ type: 'text', text }, ...this.pendingImages];
    this.pendingImages = []; // Clear after use
} else {
    // Use text model, keep images queued
    messageContent = text;
}
```

### 3. Image Limit Enforcement

```javascript
// Groq: Max 5 images
if (this.pendingImages.length > 5) {
    this.pendingImages = this.pendingImages.slice(-5); // Keep most recent 5
}

// OpenRouter: Max 10 images
if (this.pendingImages.length > 10) {
    this.pendingImages = this.pendingImages.slice(-10); // Keep most recent 10
}
```

## Behavior Examples

### Text-Only Query
```
User: "What is AI agents? Explain the architectures"
Detection: No vision keywords found
Action: Use text model (openai/gpt-oss-120b)
Images: Remain queued (5 pending)
Result: Fast text-only response
```

### Vision Query
```
User: "What do you see on the screen?"
Detection: Vision keywords found ("see", "screen")
Action: Use vision model (llama-4-scout-17b-16e-instruct)
Images: Send all 5 queued images with query
Result: AI analyzes screenshots and responds
```

### Mixed Scenario
```
1. Screenshots captured → 5 images queued
2. User: "What is AI?" → Text model, images stay queued
3. User: "Now look at this screen" → Vision model, sends 5 images
4. More screenshots → New images queued
5. User: "Explain more" → Text model, images stay queued
```

## Benefits

1. **No more "too many images" errors** - Limited to 5 (Groq) or 10 (OpenRouter)
2. **Faster text responses** - Text-only queries use faster text model
3. **Smarter context usage** - Only uses images when relevant
4. **Better user experience** - Natural conversation flow
5. **Cost efficient** - Doesn't waste vision API calls on text-only queries

## Additional Features

### Manual Image Management

```javascript
// Clear all pending images
provider.clearPendingImages();

// Check pending image count
const count = provider.getPendingImageCount();
```

## Testing

### Test Case 1: Text-Only Query
```
1. Enable auto-screenshots (5 second interval)
2. Wait for 10+ screenshots to be captured
3. Ask: "What is machine learning?"
4. Expected: Fast response, no image error, images remain queued
```

### Test Case 2: Vision Query
```
1. Have 5 screenshots queued
2. Ask: "What do you see on the screen?"
3. Expected: Response includes analysis of all 5 screenshots
4. Expected: Image queue cleared after response
```

### Test Case 3: Image Limit
```
1. Enable auto-screenshots
2. Wait for 20+ screenshots
3. Ask: "Describe this interface"
4. Expected: Only most recent 5 images sent (Groq)
5. Expected: No "too many images" error
```

## Files Modified

- `src/utils/providers/groq.js`
  - Added `_isVisionRelatedQuery()` method
  - Modified `sendText()` to use smart detection
  - Modified `sendImage()` to enforce 5 image limit
  - Added `clearPendingImages()` and `getPendingImageCount()` methods

- `src/utils/providers/openrouter.js`
  - Same changes as Groq
  - Uses 10 image limit instead of 5

- `GROQ_FEATURES.md`
  - Updated documentation with smart detection explanation

## Future Improvements

1. Make vision keywords configurable
2. Add user preference to always/never use images
3. Implement image compression for large screenshots
4. Add image quality selection (low/medium/high)
5. Support for explicit image references (e.g., "use last 3 screenshots")
