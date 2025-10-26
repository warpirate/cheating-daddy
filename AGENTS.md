# MeharNolan - Development Guidelines

This repository provides an Electron-based real-time AI assistant that captures screen and audio for contextual responses during interviews, meetings, presentations, and learning sessions. The application uses JavaScript/LitElement and Electron Forge for packaging.

## Project Overview

**MeharNolan** is a multi-provider AI assistant with:
- **9 specialized profiles** for different scenarios (interview, sales, meeting, etc.)
- **3 LLM providers** (Gemini, OpenRouter, Groq) with automatic fallback
- **Smart vision detection** for optimal image usage
- **Custom instruction templates** (27 templates across all profiles)
- **Real-time audio/screen capture** with privacy controls
- **Cross-platform support** (macOS, Windows, Linux)

## Getting started

Install dependencies and run the development app:

```
1. npm install
2. npm start
```

## Style

Run `npx prettier --write .` before committing. Prettier uses the settings in
`.prettierrc` (four-space indentation, print width 150, semicolons and single
quotes). `src/assets` and `node_modules` are ignored via `.prettierignore`.
The project does not provide linting; `npm run lint` simply prints
"No linting configured".

## Code standards

Development is gradually migrating toward a TypeScript/React codebase inspired by the
[transcriber](https://github.com/Gatecrashah/transcriber) project. Keep the following
rules in mind as new files are created:

- **TypeScript strict mode** – avoid `any` and prefer explicit interfaces.
- **React components** should be functional with hooks and wrapped in error
  boundaries where appropriate.
- **Secure IPC** – validate and sanitize all parameters crossing the renderer/main
  boundary.
- **Non‑blocking audio** – heavy processing must stay off the UI thread.
- **Tests** – every new feature requires tests once the test suite is available.

## Shadcn and Electron

The interface is being rebuilt with [shadcn/ui](https://ui.shadcn.com) components.
Follow these guidelines when working on UI code:

- **Component directory** – place generated files under `src/components/ui` and export them from that folder.
- **Add components with the CLI** – run `npx shadcn@latest add <component>`; never hand-roll components.
- **Component pattern** – use `React.forwardRef` with the `cn()` helper for class names.
- **Path aliases** – import modules from `src` using the `@/` prefix.
- **React 19 + Compiler** – target React 19 with the new compiler when available.
- **Context isolation** – maintain Electron's context isolation pattern for IPC.
- **TypeScript strict mode** – run `npm run typecheck` before claiming work complete.
- **Tailwind theming** – rely on CSS variables and utilities in `@/utils/tailwind` for styling.
- **Testing without running** – confirm `npm run typecheck` and module resolution with `node -e "require('<file>')"`.

## Tests

No automated tests yet. When a suite is added, run `npm test` before each
commit. Until then, at minimum ensure `npm install` and `npm start` work after
merging upstream changes.

## Merging upstream PRs

Pull requests from <https://github.com/sohzm/meharnolan> are commonly
cherry‑picked here. When merging:

1. Inspect the diff and keep commit messages short (`feat:` / `fix:` etc.).
2. After merging, run the application locally to verify it still builds and
   functions.

## Project Architecture

### Core Components

```
src/
├── components/
│   ├── app/
│   │   ├── MeharNolanApp.js      # Main application component
│   │   └── AppHeader.js           # Header with navigation
│   └── views/
│       ├── AssistantView.js       # Main AI assistant interface
│       ├── CustomizeView.js       # Settings & templates
│       ├── HistoryView.js         # Conversation history
│       ├── HelpView.js            # Help & shortcuts
│       └── OnboardingView.js      # First-run experience
├── utils/
│   ├── providers/
│   │   ├── base.js                # Base provider class
│   │   ├── gemini.js              # Gemini provider
│   │   ├── openrouter.js          # OpenRouter provider
│   │   └── groq.js                # Groq provider
│   ├── prompts.js                 # Profile prompts & templates
│   ├── llmProvider.js             # Provider management
│   ├── renderer.js                # IPC & UI utilities
│   └── speechToText.js            # Audio transcription
└── index.html                     # Main HTML entry
```

### Key Features

#### 1. Profile System
- **9 profiles** with specialized prompts (see `src/utils/prompts.js`)
- Each profile has intro, format requirements, search usage, content, and output instructions
- Profiles: interview, sales, meeting, presentation, negotiation, firstday, exam, test, homework

#### 2. Custom Instruction Templates
- **27 templates** across all profiles (see `docs/CUSTOM_INSTRUCTION_TEMPLATES.md`)
- **2000 character limit** (~500 tokens) enforced
- Real-time character counter
- One-click template loading
- Profile-specific guidance

#### 3. Multi-Provider System
- **Gemini**: Live audio, Google Search, unlimited images
- **OpenRouter**: Vision support, 10 image limit
- **Groq**: Fast inference, vision support, 5 image limit
- Automatic fallback on provider failure
- Unified interface via `BaseLLMProvider`

#### 4. Smart Vision Detection
- Analyzes queries for vision keywords
- Only sends images when relevant
- Prevents "too many images" errors
- Enforces provider-specific image limits
- See `docs/VISION_DETECTION_FIX.md`

## Documentation Structure

### Feature Documentation
- **[Custom Instruction Templates](docs/CUSTOM_INSTRUCTION_TEMPLATES.md)** - Template system technical docs
- **[Template UI Guide](docs/TEMPLATE_UI_GUIDE.md)** - Visual guide and UX flows
- **[Quick Template Reference](docs/QUICK_TEMPLATE_REFERENCE.md)** - All templates at a glance
- **[Template Feature Summary](docs/TEMPLATE_FEATURE_SUMMARY.md)** - Feature overview
- **[First Day Work Profile](docs/FIRST_DAY_PROFILE.md)** - New profile documentation

### Technical Documentation
- **[Provider Integration](PROVIDERS.md)** - Multi-provider architecture
- **[Groq Features](docs/GROQ_FEATURES.md)** - Groq-specific capabilities
- **[Vision Detection Fix](docs/VISION_DETECTION_FIX.md)** - Smart image usage
- **[Provider Fix Summary](docs/PROVIDER_FIX_SUMMARY.md)** - Recent improvements
- **[Local Speech-to-Text](docs/LOCAL_SPEECH_TO_TEXT.md)** - Offline transcription
- **[Screenshot Behavior](docs/SCREENSHOT_BEHAVIOR.md)** - Auto-screenshot system

### Migration & Updates
- **[Migration Guide](MIGRATION.md)** - Upgrading from older versions
- **[Rebrand Documentation](docs/REBRAND_TO_MEHARNOLAN.md)** - Cheating Daddy → MeharNolan

## Development Workflow

### Adding a New Profile

1. **Add profile prompt** in `src/utils/prompts.js`:
```javascript
profilePrompts.newprofile = {
    intro: `...`,
    formatRequirements: `...`,
    searchUsage: `...`,
    content: `...`,
    outputInstructions: `...`
};
```

2. **Add profile to UI** in `src/components/views/CustomizeView.js`:
```javascript
getProfiles() {
    return [
        // ... existing profiles
        {
            value: 'newprofile',
            name: 'New Profile',
            description: 'Description here'
        }
    ];
}
```

3. **Add profile name mapping** in multiple files:
- `src/components/views/CustomizeView.js` - `getProfileNames()`
- `src/components/views/AssistantView.js` - `getProfileNames()`
- `src/components/views/HistoryView.js` - `getProfileNames()`

4. **Add templates** in `src/components/views/CustomizeView.js`:
```javascript
getProfileTemplates() {
    return {
        newprofile: [
            {
                name: 'Template Name',
                template: `Template content...`
            }
        ]
    };
}
```

5. **Update documentation**:
- Add to `README.md` profiles table
- Create `docs/NEWPROFILE_PROFILE.md` if needed
- Update `docs/QUICK_TEMPLATE_REFERENCE.md`

### Adding a New Provider

1. **Create provider class** in `src/utils/providers/`:
```javascript
const { BaseLLMProvider } = require('./base');

class NewProvider extends BaseLLMProvider {
    async initializeSession(options) { /* ... */ }
    async sendText(text, stream) { /* ... */ }
    async sendImage(imageData) { /* ... */ }
    endSession() { /* ... */ }
}
```

2. **Register in provider factory** (`src/utils/llmProvider.js`):
```javascript
function createProvider(providerName, apiKey, config) {
    switch (providerName) {
        case 'newprovider':
            return new NewProvider(apiKey, config);
        // ... other cases
    }
}
```

3. **Add UI option** in `src/components/views/CustomizeView.js`

4. **Document capabilities** in `PROVIDERS.md`

### Adding Custom Instruction Templates

1. **Add to profile templates** in `src/components/views/CustomizeView.js`:
```javascript
getProfileTemplates() {
    return {
        profilename: [
            {
                name: 'Template Name',
                template: `Your template content with [placeholders]...`
            }
        ]
    };
}
```

2. **Follow template guidelines**:
- Use `[placeholders]` for user customization
- Keep under 2000 characters
- Include relevant sections for the profile
- Provide clear structure

3. **Update documentation**:
- Add to `docs/QUICK_TEMPLATE_REFERENCE.md`
- Update template count in `docs/TEMPLATE_FEATURE_SUMMARY.md`

## Strategy and Future Work

### Planned Features

#### Local Transcription
- Integrate `whisper.cpp` for offline speech-to-text
- GPU acceleration support
- Voice activity detection
- Speaker diarization with tinydiarize

#### Enhanced Audio Capture
- Dual-stream audio (microphone + system audio)
- Cross-platform audio capture improvements
- Audio quality selection
- Noise reduction

#### UI Improvements
- Migrate to shadcn/ui components
- React 19 with new compiler
- Improved accessibility
- Mobile-responsive design

#### Testing Infrastructure
- Jest for unit tests
- React Testing Library for component tests
- E2E testing with Playwright
- CI/CD pipeline

#### Additional Features
- Template sharing/community templates
- AI-powered template suggestions
- Multi-language template support
- Custom template saving
- Usage analytics dashboard

### TODO

1. ✅ Multi-provider support (Gemini, OpenRouter, Groq)
2. ✅ Smart vision detection
3. ✅ Custom instruction templates (27 templates)
4. ✅ First Day Work profile
5. ✅ Character limit enforcement
6. ⏳ Local transcription with whisper.cpp
7. ⏳ Dual-stream audio capture
8. ⏳ Speaker diarization
9. ⏳ Testing infrastructure
10. ⏳ UI migration to shadcn/ui
11. ⏳ Template sharing system
12. ⏳ Usage analytics

## Audio processing principles

When implementing transcription features borrow the following rules from
`transcriber`:

- **16 kHz compatibility** – resample all audio before sending to whisper.cpp.
- **Dual‑stream architecture** – capture microphone and system audio on separate
  channels.
- **Speaker diarization** – integrate tinydiarize (`--tinydiarize` flag) for mono
  audio and parse `[SPEAKER_TURN]` markers to label speakers (Speaker A, B, C…).
- **Voice activity detection** – pre‑filter silent segments to improve speed.
- **Quality preservation** – keep sample fidelity and avoid blocking the UI
  during heavy processing.
- **Memory efficiency** – stream large audio files instead of loading them all at
  once.
- **Error recovery** – handle audio device failures gracefully.

## Privacy by design

- **Local processing** – transcriptions should happen locally whenever possible.
- **User control** – provide clear options for data retention and deletion.
- **Transparency** – document what is stored and where.
- **Minimal data** – only persist what is required for functionality.

## LLM plans

There are placeholder files for future LLM integration (e.g. Qwen models via
`llama.cpp`). Continue development after the core transcription pipeline is
stable and ensure tests cover this new functionality.
