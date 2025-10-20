# Screenshot Behavior by Provider

## Overview

Different providers handle screenshots differently based on their capabilities and use cases.

## Provider-Specific Behavior

### Gemini (Real-time Audio)

**Screenshot Mode**: Automatic + Manual

- ✅ **Automatic screenshots** at configured interval (1s, 2s, 5s, 10s)
- ✅ **Manual screenshots** with CTRL+ENTER
- 🎯 **Use case**: Real-time interview assistance with continuous screen monitoring

**Why automatic?**
- Gemini supports real-time audio streaming
- AI can see screen context while listening to conversation
- Provides continuous assistance during interviews

**Configuration**:
```javascript
// Automatic every 5 seconds (default)
screenshotInterval: '5'

// Manual only
screenshotInterval: 'manual'
```

---

### Groq (Speech-to-Text)

**Screenshot Mode**: Manual ONLY

- ❌ **No automatic screenshots**
- ✅ **Manual screenshots** with CTRL+ENTER ONLY
- 🎯 **Use case**: On-demand screen analysis when needed

**Why manual only?**
- Groq uses speech-to-text (not real-time audio)
- Images are queued and sent with text queries
- Prevents unwanted image accumulation
- User controls when screen context is needed

**How it works**:
1. User presses **CTRL+ENTER** → Screenshot captured
2. Screenshot queued (not sent immediately)
3. User asks question → Screenshot sent with question
4. AI analyzes screen + answers question

**Example**:
```
1. Press CTRL+ENTER → Screenshot queued
2. Ask: "What do you see on the screen?" → Screenshot + text sent
3. AI responds with screen analysis
```

---

### OpenRouter (Speech-to-Text)

**Screenshot Mode**: Manual ONLY

- ❌ **No automatic screenshots**
- ✅ **Manual screenshots** with CTRL+ENTER ONLY
- 🎯 **Use case**: On-demand screen analysis when needed

**Why manual only?**
- Same as Groq - uses speech-to-text
- Images are queued and sent with text queries
- Prevents unwanted image accumulation
- User controls when screen context is needed

**How it works**:
Same as Groq (see above)

---

## Comparison Table

| Feature | Gemini | Groq | OpenRouter |
|---------|--------|------|------------|
| **Automatic Screenshots** | ✅ Yes | ❌ No | ❌ No |
| **Manual Screenshots** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Screenshot Trigger** | Interval + CTRL+ENTER | CTRL+ENTER only | CTRL+ENTER only |
| **Image Queuing** | No (sent immediately) | Yes | Yes |
| **Audio Handling** | Real-time streaming | Speech-to-text | Speech-to-text |
| **Best For** | Continuous monitoring | On-demand help | On-demand help |

---

## Implementation Details

### Automatic Screenshot Prevention

For Groq and OpenRouter, automatic screenshots are blocked at two levels:

#### 1. Interval Setup Prevention
```javascript
// In startCapture()
const providerName = localStorage.getItem('llmProvider');

if (providerName === 'groq' || providerName === 'openrouter') {
    console.log('Screenshots will ONLY be captured on manual trigger (CTRL+ENTER)');
    // Don't start automatic interval
} else {
    // Start automatic interval for Gemini
    screenshotInterval = setInterval(() => captureScreenshot(), interval);
}
```

#### 2. Capture Function Prevention
```javascript
// In captureScreenshot()
async function captureScreenshot(imageQuality, isManual = false) {
    const providerName = localStorage.getItem('llmProvider');
    
    // Block automatic captures for Groq/OpenRouter
    if ((providerName === 'groq' || providerName === 'openrouter') && !isManual) {
        console.log('⚠️ Automated screenshot blocked - use CTRL+ENTER');
        return;
    }
    
    // Continue with capture...
}
```

### Manual Screenshot Trigger

```javascript
// CTRL+ENTER triggers manual screenshot
async function captureManualScreenshot(imageQuality) {
    await captureScreenshot(quality, true); // isManual = true
    // Screenshot is captured and queued
}
```

---

## User Experience

### For Gemini Users

**Setup**:
1. Select Gemini provider
2. Choose screenshot interval (1s, 2s, 5s, 10s, or manual)
3. Start capture

**During Use**:
- Screen is automatically captured at interval
- AI sees screen context in real-time
- Can also press CTRL+ENTER for immediate capture
- Continuous assistance during interviews

**Example Flow**:
```
[Auto] Screenshot every 5s → AI sees screen
[Auto] Screenshot every 5s → AI sees screen
[Manual] CTRL+ENTER → Immediate screenshot
[Auto] Screenshot every 5s → AI sees screen
```

---

### For Groq/OpenRouter Users

**Setup**:
1. Select Groq or OpenRouter provider
2. Screenshot interval setting is IGNORED
3. Start capture

**During Use**:
- No automatic screenshots
- Press CTRL+ENTER when you need screen analysis
- Screenshot is queued (not sent immediately)
- Ask question → Screenshot sent with question

**Example Flow**:
```
User: [Speaks] "What is machine learning?"
→ Text-only query, no screenshot needed
→ AI responds with explanation

User: [CTRL+ENTER] → Screenshot captured and queued
User: [Speaks] "What do you see on the screen?"
→ Screenshot + text sent together
→ AI analyzes screen and responds

User: [Speaks] "Explain more about that"
→ Text-only query, previous screenshot already used
→ AI responds based on previous context
```

---

## Benefits of Manual-Only for Groq/OpenRouter

### 1. **Prevents Image Queue Overflow**
- Groq vision model supports max 5 images
- Automatic screenshots would quickly exceed limit
- Manual control prevents "too many images" errors

### 2. **Reduces Unnecessary API Calls**
- Only captures when user needs screen analysis
- Saves on vision API costs
- Faster responses for text-only queries

### 3. **Better User Control**
- User decides when screen context is needed
- More intentional screen sharing
- Privacy-friendly (no constant screen capture)

### 4. **Optimized Performance**
- Text-only queries use faster text model
- Vision queries use vision model only when needed
- Smart model selection based on query type

### 5. **Clearer Intent**
- CTRL+ENTER = "I want you to see my screen"
- Text/speech only = "Just answer my question"
- No ambiguity about when screen is shared

---

## Configuration

### Disable Automatic Screenshots (Gemini)

```javascript
// Set to manual mode
localStorage.setItem('selectedScreenshotInterval', 'manual');
```

### Enable Automatic Screenshots (Gemini)

```javascript
// Set interval in seconds
localStorage.setItem('selectedScreenshotInterval', '5'); // Every 5 seconds
```

### For Groq/OpenRouter

```javascript
// Screenshot interval setting is automatically ignored
// Always manual-only, regardless of setting
```

---

## Keyboard Shortcuts

| Shortcut | Action | All Providers |
|----------|--------|---------------|
| **CTRL+ENTER** | Capture screenshot manually | ✅ Yes |
| **CTRL+SHIFT+N** | Ask for next step (with screenshot) | ✅ Yes |

---

## Console Messages

### Gemini
```
✅ Starting automatic screenshots every 5 seconds
📸 Capturing automated screenshot...
📸 Capturing manual screenshot...
```

### Groq/OpenRouter
```
📸 groq provider: Screenshots will ONLY be captured on manual trigger (CTRL+ENTER)
⚠️ Automated screenshot blocked for groq - use CTRL+ENTER to capture manually
📸 Capturing manual screenshot...
```

---

## Troubleshooting

### Issue: "Images are queuing but I didn't request them" (Groq/OpenRouter)

**Solution**: This is now fixed! Automatic screenshots are completely disabled for Groq and OpenRouter.

### Issue: "I want automatic screenshots with Groq"

**Explanation**: Groq's vision model has a 5-image limit. Automatic screenshots would quickly exceed this limit and cause errors. Manual screenshots give you control over when screen context is needed.

**Alternative**: Use Gemini if you need continuous screen monitoring.

### Issue: "CTRL+ENTER doesn't capture screenshot"

**Check**:
1. Ensure capture is started
2. Check console for error messages
3. Verify screen sharing permission granted
4. Try stopping and restarting capture

### Issue: "Screenshot captured but not sent to AI"

**Explanation**: For Groq/OpenRouter, screenshots are queued and sent with your next text/speech query. This is intentional.

**To send**:
1. Press CTRL+ENTER (screenshot queued)
2. Ask a vision-related question: "What do you see?"
3. Screenshot is sent with your question

---

## Summary

| Provider | Screenshot Mode | Trigger | Image Handling |
|----------|----------------|---------|----------------|
| **Gemini** | Automatic + Manual | Interval + CTRL+ENTER | Sent immediately |
| **Groq** | Manual ONLY | CTRL+ENTER ONLY | Queued, sent with text |
| **OpenRouter** | Manual ONLY | CTRL+ENTER ONLY | Queued, sent with text |

This design ensures optimal performance and user experience for each provider's capabilities.
