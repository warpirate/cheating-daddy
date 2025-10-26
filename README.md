<img width="1299" height="424" alt="cd (1)" src="https://github.com/user-attachments/assets/b25fff4d-043d-4f38-9985-f832ae0d0f6e" />

> [!NOTE]  
> Use latest MacOS and Windows version, older versions have limited support

> [!NOTE]  
> During testing it wont answer if you ask something, you need to simulate interviewer asking question, which it will answer

A real-time AI assistant that provides contextual help during video calls, interviews, presentations, and meetings using screen capture and audio analysis.

## Features

### Core Capabilities
- **Live AI Assistance**: Real-time help powered by Google Gemini 2.0 Flash Live
- **Multi-Provider Support**: Gemini, OpenRouter, and Groq with automatic fallback
- **Screen & Audio Capture**: Analyzes what you see and hear for contextual responses
- **Smart Vision Detection**: Automatically determines when to use visual context
- **Transparent Overlay**: Always-on-top window that can be positioned anywhere
- **Click-through Mode**: Make window transparent to clicks when needed

### Profile System (9 Profiles)
- **Professional**: Interview, Sales Call, Business Meeting, Presentation, Negotiation
- **Career**: First Day Work (NEW!)
- **Academic**: Exam Assistant, Online Test, Homework Helper

### Custom Instructions
- **Profile-Specific Templates**: 27 pre-written templates across all profiles
- **Character Limit**: 2000 characters (~500 tokens) with real-time counter
- **Quick Load**: One-click template loading with customization
- **Smart Guidance**: Templates show what information to provide

### Platform Support
- **Cross-platform**: Works on macOS, Windows, and Linux
- **Local Speech-to-Text**: Optional offline transcription support
- **Multiple Languages**: 30+ language options for speech recognition

## Setup

1. **Get a Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. **Install Dependencies**: `npm install`
3. **Run the App**: `npm start`

## Usage

1. Enter your Gemini API key in the main window
2. Choose your profile and language in settings
3. Click "Start Session" to begin
4. Position the window using keyboard shortcuts
5. The AI will provide real-time assistance based on your screen and what interview asks

## Keyboard Shortcuts

- **Window Movement**: `Ctrl/Cmd + Arrow Keys` - Move window
- **Click-through**: `Ctrl/Cmd + M` - Toggle mouse events
- **Close/Back**: `Ctrl/Cmd + \` - Close window or go back
- **Send Message**: `Enter` - Send text to AI

## Audio Capture

- **macOS**: [SystemAudioDump](https://github.com/Mohammed-Yasin-Mulla/Sound) for system audio
- **Windows**: Loopback audio capture
- **Linux**: Microphone input

## Requirements

- Electron-compatible OS (macOS, Windows, Linux)
- API key (Gemini, OpenRouter, or Groq)
- Screen recording permissions
- Microphone/audio permissions

## Documentation

### Feature Documentation
- **[Custom Instruction Templates](docs/CUSTOM_INSTRUCTION_TEMPLATES.md)** - Profile-specific templates with character limits
- **[Template UI Guide](docs/TEMPLATE_UI_GUIDE.md)** - Visual guide for using templates
- **[Quick Template Reference](docs/QUICK_TEMPLATE_REFERENCE.md)** - All 27 templates at a glance
- **[First Day Work Profile](docs/FIRST_DAY_PROFILE.md)** - New profile for first-day job anxiety

### Technical Documentation
- **[Provider Integration](PROVIDERS.md)** - Multi-provider LLM system architecture
- **[Groq Features](docs/GROQ_FEATURES.md)** - Groq-specific capabilities and vision support
- **[Vision Detection Fix](docs/VISION_DETECTION_FIX.md)** - Smart image usage system
- **[Local Speech-to-Text](docs/LOCAL_SPEECH_TO_TEXT.md)** - Offline transcription setup
- **[Screenshot Behavior](docs/SCREENSHOT_BEHAVIOR.md)** - Auto-screenshot system details
- **[Migration Guide](MIGRATION.md)** - Upgrading from older versions

### Recent Updates
- **[Rebrand Documentation](docs/REBRAND_TO_MEHARNOLAN.md)** - Complete rebrand from Cheating Daddy to MeharNolan
- **[Provider Fix Summary](docs/PROVIDER_FIX_SUMMARY.md)** - Recent provider improvements
- **[Template Feature Summary](docs/TEMPLATE_FEATURE_SUMMARY.md)** - Template system overview

## Profiles Overview

| Profile | Use Case | Templates |
|---------|----------|-----------|
| **Job Interview** | Answer interview questions | 3 templates |
| **Sales Call** | Handle sales conversations | 2 templates |
| **Business Meeting** | Professional meetings | 2 templates |
| **Presentation** | Public speaking & demos | 2 templates |
| **Negotiation** | Salary & business deals | 2 templates |
| **First Day Work** | Roleplay as you on day one | 3 templates |
| **Exam Assistant** | Test-taking help | 2 templates |
| **Online Test** | Timed tests & coding | 2 templates |
| **Homework Helper** | Assignment assistance | 3 templates |

## Provider Comparison

| Feature | Gemini | OpenRouter | Groq |
|---------|--------|------------|------|
| **Live Audio** | ✅ Yes | ❌ No | ❌ No |
| **Vision Support** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Google Search** | ✅ Yes | ❌ No | ❌ No |
| **Max Images** | Unlimited | 10 | 5 |
| **Speed** | Fast | Medium | Very Fast |
| **Cost** | Free tier | Pay-per-use | Free tier |

## Advanced Features

### Smart Vision Detection
The app automatically detects when your query needs visual context:
- **Text queries** → Fast text-only responses
- **Vision queries** → Analyzes screenshots automatically
- **Image limits** → Prevents "too many images" errors

### Custom Instructions System
- **27 templates** across all profiles
- **2000 character limit** prevents token overflow
- **Profile-aware** templates match your use case
- **One-click loading** with easy customization

### Multi-Provider Architecture
- **Automatic fallback** if primary provider fails
- **Provider-specific features** (live audio, search, vision)
- **Unified interface** across all providers
- **Easy switching** between providers

## Contributing

See [AGENTS.md](AGENTS.md) for development guidelines and contribution standards.

## License

GPL-3.0

