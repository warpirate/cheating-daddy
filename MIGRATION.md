# Migration Guide: Multi-Provider Support

## Summary of Changes

This update adds support for multiple LLM providers (Groq, OpenRouter) while maintaining full backward compatibility with Google Gemini.

## What Changed

### New Files Created

```
src/utils/providers/
├── base.js           # Base provider interface
├── gemini.js         # Gemini provider (refactored from gemini.js)
├── groq.js           # New Groq provider
├── openrouter.js     # New OpenRouter provider
└── factory.js        # Provider factory

src/utils/llmProvider.js  # New unified LLM manager (replaces gemini.js)
```

### Modified Files

- `src/index.js` - Updated to use `llmProvider.js` instead of `gemini.js`
- `src/utils/renderer.js` - Added `initializeLLM()` function
- `src/components/views/MainView.js` - Added provider selector UI

### Deprecated Files

- `src/utils/gemini.js` - **Can be deleted** (functionality moved to `llmProvider.js` and `providers/gemini.js`)

## Breaking Changes

**None!** The application is fully backward compatible:

- Existing users will default to Gemini provider
- All existing API keys continue to work
- No configuration changes required
- `initializeGemini()` function still works (aliased to `initializeLLM()`)

## For Existing Users

### No Action Required

If you're happy with Gemini, nothing changes:
- Your API key is preserved
- Default provider is still Gemini
- All features work exactly as before

### To Try New Providers

1. **Get API Keys**:
   - Groq: https://console.groq.com/keys
   - OpenRouter: https://openrouter.ai/keys

2. **Switch Provider**:
   - Open the app
   - Select provider from dropdown
   - Enter new API key
   - Click "Start Session"

3. **Note the Differences**:
   - ⚠️ Groq and OpenRouter don't support real-time audio
   - They work with screenshots + text only
   - Responses are still fast and accurate

## For Developers

### API Changes

#### Old Way (Still Works)
```javascript
await cheddar.initializeGemini(profile, language);
```

#### New Way (Recommended)
```javascript
await cheddar.initializeLLM(profile, language);
```

### IPC Handler Changes

#### Old
```javascript
ipcRenderer.invoke('initialize-gemini', apiKey, customPrompt, profile, language);
```

#### New
```javascript
ipcRenderer.invoke('initialize-llm', providerName, apiKey, customPrompt, profile, language);
```

### Provider Selection

```javascript
// Get selected provider
const provider = localStorage.getItem('llmProvider') || 'gemini';

// Set provider
localStorage.setItem('llmProvider', 'groq');
```

## Testing Checklist

After updating, verify:

- [ ] App starts without errors
- [ ] Gemini provider works (default)
- [ ] Can switch to Groq provider
- [ ] Can switch to OpenRouter provider
- [ ] Screenshots are captured
- [ ] Responses stream correctly
- [ ] Audio works with Gemini (macOS only)
- [ ] Provider warnings display correctly
- [ ] API key validation works
- [ ] Session close works for all providers

## Rollback Instructions

If you need to rollback:

1. **Restore old gemini.js**:
   ```bash
   git checkout HEAD~1 src/utils/gemini.js
   ```

2. **Revert index.js**:
   ```javascript
   // Change this:
   const { setupLLMIpcHandlers } = require('./utils/llmProvider');
   
   // Back to this:
   const { setupGeminiIpcHandlers } = require('./utils/gemini');
   ```

3. **Revert renderer.js**:
   ```javascript
   // Remove initializeLLM, keep only initializeGemini
   ```

4. **Revert MainView.js**:
   - Remove provider selector UI
   - Restore original API key input

## Performance Impact

### Positive
- Groq is **significantly faster** than Gemini for text generation
- OpenRouter gives access to more efficient models
- Better cost control with provider choice

### Neutral
- Same memory usage
- Same network bandwidth
- No additional dependencies

### Considerations
- Non-Gemini providers don't support audio streaming
- May need higher screenshot frequency to compensate

## Security Notes

- API keys are still stored in localStorage (same as before)
- Each provider has separate API key storage
- No API keys are sent to third parties
- All communication is direct to provider APIs

## Support

### Common Issues

**"Provider not found" error**
- Ensure you're using latest version
- Check provider name is correct: 'gemini', 'groq', or 'openrouter'

**"Invalid API key" error**
- Verify API key is correct for selected provider
- Check API key hasn't expired
- Ensure you have credits/quota remaining

**Responses not streaming**
- Check network connectivity
- Verify provider supports streaming
- Look for errors in console

### Getting Help

1. Check `PROVIDERS.md` for detailed documentation
2. Review console logs for errors
3. Test with Gemini first (known working)
4. Open issue on GitHub with:
   - Provider name
   - Error messages
   - Console logs
   - Steps to reproduce

## Future Updates

Planned enhancements:
- Audio transcription for non-Gemini providers
- Model selection per provider
- Cost tracking and estimates
- Provider performance comparison
- Automatic fallback on errors

## Feedback

We'd love to hear about your experience:
- Which provider works best for you?
- Any issues or bugs?
- Feature requests?
- Performance feedback?

Open an issue or PR on GitHub!
