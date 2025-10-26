import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { resizeLayout } from '../../utils/windowResize.js';

export class MainView extends LitElement {
    static styles = css`
        * {
            font-family: 'Inter', sans-serif;
            cursor: default;
            user-select: none;
        }

        .welcome {
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: 600;
            margin-top: auto;
        }

        .input-group {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }

        .input-group input {
            flex: 1;
        }

        input {
            background: var(--input-background);
            color: var(--text-color);
            border: 1px solid var(--button-border);
            padding: 10px 14px;
            width: 100%;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s ease;
        }

        input:focus {
            outline: none;
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 3px var(--focus-box-shadow);
            background: var(--input-focus-background);
        }

        input::placeholder {
            color: var(--placeholder-color);
        }

        /* Red blink animation for empty API key */
        input.api-key-error {
            animation: blink-red 1s ease-in-out;
            border-color: #ff4444;
        }

        @keyframes blink-red {
            0%,
            100% {
                border-color: var(--button-border);
                background: var(--input-background);
            }
            25%,
            75% {
                border-color: #ff4444;
                background: rgba(255, 68, 68, 0.1);
            }
            50% {
                border-color: #ff6666;
                background: rgba(255, 68, 68, 0.15);
            }
        }

        .start-button {
            background: var(--start-button-background);
            color: var(--start-button-color);
            border: 1px solid var(--start-button-border);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .start-button:hover {
            background: var(--start-button-hover-background);
            border-color: var(--start-button-hover-border);
        }

        .start-button.initializing {
            opacity: 0.5;
        }

        .start-button.initializing:hover {
            background: var(--start-button-background);
            border-color: var(--start-button-border);
        }

        .shortcut-icons {
            display: flex;
            align-items: center;
            gap: 2px;
            margin-left: 4px;
        }

        .shortcut-icons svg {
            width: 14px;
            height: 14px;
        }

        .shortcut-icons svg path {
            stroke: currentColor;
        }

        .description {
            color: var(--description-color);
            font-size: 14px;
            margin-bottom: 24px;
            line-height: 1.5;
        }

        .link {
            color: var(--link-color);
            text-decoration: underline;
            cursor: pointer;
        }

        .shortcut-hint {
            color: var(--description-color);
            font-size: 11px;
            opacity: 0.8;
        }

        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 500px;
        }

        .provider-selector {
            margin-bottom: 16px;
        }

        .provider-selector label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: var(--label-color);
            margin-bottom: 6px;
        }

        .provider-selector select {
            width: 100%;
            background: var(--input-background);
            color: var(--text-color);
            border: 1px solid var(--button-border);
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 10px center;
            background-repeat: no-repeat;
            background-size: 16px;
            padding-right: 36px;
        }

        .provider-selector select:focus {
            outline: none;
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 3px var(--focus-box-shadow);
        }

        .provider-info {
            font-size: 11px;
            color: var(--description-color);
            margin-top: 4px;
            line-height: 1.4;
        }

        .provider-warning {
            background: rgba(255, 152, 0, 0.1);
            border: 1px solid rgba(255, 152, 0, 0.3);
            color: #ffb84d;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 11px;
            margin-top: 8px;
            line-height: 1.4;
        }

        .profile-selector {
            margin-bottom: 16px;
        }

        .profile-selector label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: var(--label-color);
            margin-bottom: 6px;
        }

        .profile-selector select {
            width: 100%;
            background: var(--input-background);
            color: var(--text-color);
            border: 1px solid var(--button-border);
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 10px center;
            background-repeat: no-repeat;
            background-size: 16px;
            padding-right: 36px;
        }

        .profile-selector select:focus {
            outline: none;
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 3px var(--focus-box-shadow);
        }

        .custom-instructions {
            margin-bottom: 16px;
        }

        .custom-instructions label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: var(--label-color);
            margin-bottom: 6px;
        }

        .custom-instructions textarea {
            width: 100%;
            min-height: 80px;
            background: var(--input-background);
            color: var(--text-color);
            border: 1px solid var(--button-border);
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            resize: vertical;
            transition: border-color 0.2s ease;
        }

        .custom-instructions textarea:focus {
            outline: none;
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 3px var(--focus-box-shadow);
            background: var(--input-focus-background);
        }

        .custom-instructions textarea::placeholder {
            color: var(--placeholder-color);
        }

        .field-description {
            font-size: 11px;
            color: var(--description-color);
            margin-top: 4px;
            line-height: 1.4;
        }
    `;

    static properties = {
        onStart: { type: Function },
        onAPIKeyHelp: { type: Function },
        isInitializing: { type: Boolean },
        onLayoutModeChange: { type: Function },
        showApiKeyError: { type: Boolean },
        selectedProvider: { type: String },
        selectedProfile: { type: String },
        customInstructions: { type: String },
    };

    constructor() {
        super();
        this.onStart = () => {};
        this.onAPIKeyHelp = () => {};
        this.isInitializing = false;
        this.onLayoutModeChange = () => {};
        this.showApiKeyError = false;
        this.selectedProvider = localStorage.getItem('llmProvider') || 'gemini';
        this.selectedProfile = localStorage.getItem('selectedProfile') || 'interview';
        this.customInstructions = localStorage.getItem('customPrompt') || '';
        this.boundKeydownHandler = this.handleKeydown.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        window.electron?.ipcRenderer?.on('session-initializing', (event, isInitializing) => {
            this.isInitializing = isInitializing;
        });

        // Add keyboard event listener for Ctrl+Enter (or Cmd+Enter on Mac)
        document.addEventListener('keydown', this.boundKeydownHandler);

        // Load and apply layout mode on startup
        this.loadLayoutMode();
        // Resize window for this view
        resizeLayout();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.electron?.ipcRenderer?.removeAllListeners('session-initializing');
        // Remove keyboard event listener
        document.removeEventListener('keydown', this.boundKeydownHandler);
    }

    handleKeydown(e) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isStartShortcut = isMac ? e.metaKey && e.key === 'Enter' : e.ctrlKey && e.key === 'Enter';

        if (isStartShortcut) {
            e.preventDefault();
            this.handleStartClick();
        }
    }

    handleInput(e) {
        localStorage.setItem('apiKey', e.target.value);
        // Clear error state when user starts typing
        if (this.showApiKeyError) {
            this.showApiKeyError = false;
        }
    }

    handleProviderChange(e) {
        this.selectedProvider = e.target.value;
        localStorage.setItem('llmProvider', this.selectedProvider);
        this.requestUpdate();
    }

    handleProfileChange(e) {
        this.selectedProfile = e.target.value;
        localStorage.setItem('selectedProfile', this.selectedProfile);
        this.requestUpdate();
    }

    handleCustomInstructionsInput(e) {
        this.customInstructions = e.target.value;
        localStorage.setItem('customPrompt', this.customInstructions);
    }

    getProviderInfo() {
        const providers = {
            gemini: {
                name: 'Google Gemini',
                description: 'Real-time audio streaming + vision support. Best for live interviews.',
                warning: null,
            },
            groq: {
                name: 'Groq',
                description: 'Ultra-fast inference with vision. Screenshots only (no audio streaming).',
                warning: '⚠️ Audio streaming not supported. Only screenshots and text will be sent.',
            },
            openrouter: {
                name: 'OpenRouter',
                description: 'Access 100+ models (GPT-4, Claude, etc). Screenshots only.',
                warning: '⚠️ Audio streaming not supported. Only screenshots and text will be sent.',
            },
        };
        return providers[this.selectedProvider] || providers.gemini;
    }

    handleStartClick() {
        if (this.isInitializing) {
            return;
        }
        this.onStart();
    }

    handleAPIKeyHelpClick() {
        this.onAPIKeyHelp();
    }

    handleResetOnboarding() {
        localStorage.removeItem('onboardingCompleted');
        // Refresh the page to trigger onboarding
        window.location.reload();
    }

    loadLayoutMode() {
        const savedLayoutMode = localStorage.getItem('layoutMode');
        if (savedLayoutMode && savedLayoutMode !== 'normal') {
            // Notify parent component to apply the saved layout mode
            this.onLayoutModeChange(savedLayoutMode);
        }
    }

    // Method to trigger the red blink animation
    triggerApiKeyError() {
        this.showApiKeyError = true;
        // Remove the error class after 1 second
        setTimeout(() => {
            this.showApiKeyError = false;
        }, 1000);
    }

    getStartButtonText() {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

        const cmdIcon = html`<svg width="14px" height="14px" viewBox="0 0 24 24" stroke-width="2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M15 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path
                d="M9 6C9 4.34315 7.65685 3 6 3C4.34315 3 3 4.34315 3 6C3 7.65685 4.34315 9 6 9H18C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
            <path
                d="M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15H18C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
        </svg>`;

        const enterIcon = html`<svg width="14px" height="14px" stroke-width="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M10.25 19.25L6.75 15.75L10.25 12.25"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
            <path
                d="M6.75 15.75H12.75C14.9591 15.75 16.75 13.9591 16.75 11.75V4.75"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
        </svg>`;

        if (isMac) {
            return html`Start Session <span class="shortcut-icons">${cmdIcon}${enterIcon}</span>`;
        } else {
            return html`Start Session <span class="shortcut-icons">Ctrl${enterIcon}</span>`;
        }
    }

    render() {
        const providerInfo = this.getProviderInfo();
        const apiKeyPlaceholder =
            this.selectedProvider === 'gemini'
                ? 'Enter your Gemini API Key'
                : this.selectedProvider === 'groq'
                ? 'Enter your Groq API Key'
                : 'Enter your OpenRouter API Key';

        return html`
            <div class="welcome">Welcome</div>

            <div class="provider-selector">
                <label>AI Provider</label>
                <select .value=${this.selectedProvider} @change=${this.handleProviderChange}>
                    <option value="gemini">Google Gemini (Real-time Audio)</option>
                    <option value="groq">Groq (Ultra-fast)</option>
                    <option value="openrouter">OpenRouter (Multi-model)</option>
                </select>
                <div class="provider-info">${providerInfo.description}</div>
                ${providerInfo.warning ? html`<div class="provider-warning">${providerInfo.warning}</div>` : ''}
            </div>

            <div class="input-group">
                <input
                    type="password"
                    placeholder="${apiKeyPlaceholder}"
                    .value=${localStorage.getItem('apiKey') || ''}
                    @input=${this.handleInput}
                    class="${this.showApiKeyError ? 'api-key-error' : ''}"
                />
                <button @click=${this.handleStartClick} class="start-button ${this.isInitializing ? 'initializing' : ''}">
                    ${this.getStartButtonText()}
                </button>
            </div>
            <p class="description">
                dont have an api key?
                <span @click=${this.handleAPIKeyHelpClick} class="link">get one here</span>
            </p>

            <div class="profile-selector">
                <label>Profile Type</label>
                <select .value=${this.selectedProfile} @change=${this.handleProfileChange}>
                    <option value="interview">Interview Assistant</option>
                    <option value="meeting">Meeting Assistant</option>
                    <option value="firstday">First Day at Work</option>
                    <option value="presentation">Presentation Helper</option>
                    <option value="learning">Learning Companion</option>
                    <option value="custom">Custom Profile</option>
                </select>
                <div class="field-description">Choose the AI behavior that best fits your use case</div>
            </div>

            <div class="custom-instructions">
                <label>Custom AI Instructions</label>
                <textarea
                    placeholder="Add context like your resume, job description, or specific instructions for the AI..."
                    .value=${this.customInstructions}
                    @input=${this.handleCustomInstructionsInput}
                ></textarea>
                <div class="field-description">Provide additional context to personalize AI responses</div>
            </div>
        `;
    }
}

customElements.define('main-view', MainView);
