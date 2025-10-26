import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { resizeLayout } from '../../utils/windowResize.js';

export class CustomizeView extends LitElement {
    static styles = css`
        * {
            font-family:
                'Inter',
                -apple-system,
                BlinkMacSystemFont,
                sans-serif;
            cursor: default;
            user-select: none;
        }

        :host {
            display: block;
            padding: 12px;
            margin: 0 auto;
            max-width: 700px;
        }

        .settings-container {
            display: grid;
            gap: 12px;
            padding-bottom: 20px;
        }

        .settings-section {
            background: var(--card-background, rgba(255, 255, 255, 0.04));
            border: 1px solid var(--card-border, rgba(255, 255, 255, 0.1));
            border-radius: 6px;
            padding: 16px;
            backdrop-filter: blur(10px);
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-color);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .section-title::before {
            content: '';
            width: 3px;
            height: 14px;
            background: var(--accent-color, #007aff);
            border-radius: 1.5px;
        }

        .form-grid {
            display: grid;
            gap: 12px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            align-items: start;
        }

        @media (max-width: 600px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .form-group.full-width {
            grid-column: 1 / -1;
        }

        .form-label {
            font-weight: 500;
            font-size: 12px;
            color: var(--label-color, rgba(255, 255, 255, 0.9));
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .form-description {
            font-size: 11px;
            color: var(--description-color, rgba(255, 255, 255, 0.5));
            line-height: 1.3;
            margin-top: 2px;
        }

        .form-control {
            background: var(--input-background, rgba(0, 0, 0, 0.3));
            color: var(--text-color);
            border: 1px solid var(--input-border, rgba(255, 255, 255, 0.15));
            padding: 8px 10px;
            border-radius: 4px;
            font-size: 12px;
            transition: all 0.15s ease;
            min-height: 16px;
            font-weight: 400;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--focus-border-color, #007aff);
            box-shadow: 0 0 0 2px var(--focus-shadow, rgba(0, 122, 255, 0.1));
            background: var(--input-focus-background, rgba(0, 0, 0, 0.4));
        }

        .form-control:hover:not(:focus) {
            border-color: var(--input-hover-border, rgba(255, 255, 255, 0.2));
            background: var(--input-hover-background, rgba(0, 0, 0, 0.35));
        }

        select.form-control {
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 8px center;
            background-repeat: no-repeat;
            background-size: 12px;
            padding-right: 28px;
        }

        textarea.form-control {
            resize: vertical;
            min-height: 60px;
            line-height: 1.4;
            font-family: inherit;
        }

        textarea.form-control::placeholder {
            color: var(--placeholder-color, rgba(255, 255, 255, 0.4));
        }

        .profile-option {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .char-counter {
            margin-left: auto;
            font-size: 10px;
            font-weight: 400;
            color: var(--description-color, rgba(255, 255, 255, 0.5));
        }

        .template-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 8px;
            align-items: center;
        }

        .template-label {
            font-size: 11px;
            color: var(--description-color, rgba(255, 255, 255, 0.6));
            font-weight: 500;
        }

        .template-btn {
            background: var(--button-background, rgba(0, 122, 255, 0.15));
            color: var(--accent-color, #007aff);
            border: 1px solid var(--accent-color, rgba(0, 122, 255, 0.3));
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            white-space: nowrap;
        }

        .template-btn:hover {
            background: var(--button-hover-background, rgba(0, 122, 255, 0.25));
            border-color: var(--accent-color, #007aff);
            transform: translateY(-1px);
        }

        .template-btn:active {
            transform: translateY(0);
        }

        .custom-prompt-textarea {
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            font-size: 11px;
        }

        .current-selection {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            color: var(--success-color, #34d399);
            background: var(--success-background, rgba(52, 211, 153, 0.1));
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 500;
            border: 1px solid var(--success-border, rgba(52, 211, 153, 0.2));
        }

        .current-selection::before {
            content: '✓';
            font-weight: 600;
        }

        .keybind-input {
            cursor: pointer;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
            text-align: center;
            letter-spacing: 0.5px;
            font-weight: 500;
        }

        .keybind-input:focus {
            cursor: text;
            background: var(--input-focus-background, rgba(0, 122, 255, 0.1));
        }

        .keybind-input::placeholder {
            color: var(--placeholder-color, rgba(255, 255, 255, 0.4));
            font-style: italic;
        }

        .reset-keybinds-button {
            background: var(--button-background, rgba(255, 255, 255, 0.1));
            color: var(--text-color);
            border: 1px solid var(--button-border, rgba(255, 255, 255, 0.15));
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .reset-keybinds-button:hover {
            background: var(--button-hover-background, rgba(255, 255, 255, 0.15));
            border-color: var(--button-hover-border, rgba(255, 255, 255, 0.25));
        }

        .reset-keybinds-button:active {
            transform: translateY(1px);
        }

        .keybinds-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            border-radius: 4px;
            overflow: hidden;
        }

        .keybinds-table th,
        .keybinds-table td {
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid var(--table-border, rgba(255, 255, 255, 0.08));
        }

        .keybinds-table th {
            background: var(--table-header-background, rgba(255, 255, 255, 0.04));
            font-weight: 600;
            font-size: 11px;
            color: var(--label-color, rgba(255, 255, 255, 0.8));
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .keybinds-table td {
            vertical-align: middle;
        }

        .keybinds-table .action-name {
            font-weight: 500;
            color: var(--text-color);
            font-size: 12px;
        }

        .keybinds-table .action-description {
            font-size: 10px;
            color: var(--description-color, rgba(255, 255, 255, 0.5));
            margin-top: 1px;
        }

        .keybinds-table .keybind-input {
            min-width: 100px;
            padding: 4px 8px;
            margin: 0;
            font-size: 11px;
        }

        .keybinds-table tr:hover {
            background: var(--table-row-hover, rgba(255, 255, 255, 0.02));
        }

        .keybinds-table tr:last-child td {
            border-bottom: none;
        }

        .table-reset-row {
            border-top: 1px solid var(--table-border, rgba(255, 255, 255, 0.08));
        }

        .table-reset-row td {
            padding-top: 10px;
            padding-bottom: 8px;
            border-bottom: none;
        }

        .settings-note {
            font-size: 10px;
            color: var(--note-color, rgba(255, 255, 255, 0.4));
            font-style: italic;
            text-align: center;
            margin-top: 10px;
            padding: 8px;
            background: var(--note-background, rgba(255, 255, 255, 0.02));
            border-radius: 4px;
            border: 1px solid var(--note-border, rgba(255, 255, 255, 0.08));
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            padding: 8px;
            background: var(--checkbox-background, rgba(255, 255, 255, 0.02));
            border-radius: 4px;
            border: 1px solid var(--checkbox-border, rgba(255, 255, 255, 0.06));
        }

        .checkbox-input {
            width: 14px;
            height: 14px;
            accent-color: var(--focus-border-color, #007aff);
            cursor: pointer;
        }

        .checkbox-label {
            font-weight: 500;
            font-size: 12px;
            color: var(--label-color, rgba(255, 255, 255, 0.9));
            cursor: pointer;
            user-select: none;
        }

        /* Better focus indicators */
        .form-control:focus-visible {
            outline: none;
            border-color: var(--focus-border-color, #007aff);
            box-shadow: 0 0 0 2px var(--focus-shadow, rgba(0, 122, 255, 0.1));
        }

        /* Improved button states */
        .reset-keybinds-button:focus-visible {
            outline: none;
            border-color: var(--focus-border-color, #007aff);
            box-shadow: 0 0 0 2px var(--focus-shadow, rgba(0, 122, 255, 0.1));
        }

        /* Slider styles */
        .slider-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .slider-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .slider-value {
            font-size: 11px;
            color: var(--success-color, #34d399);
            background: var(--success-background, rgba(52, 211, 153, 0.1));
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 500;
            border: 1px solid var(--success-border, rgba(52, 211, 153, 0.2));
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
        }

        .slider-input {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 4px;
            border-radius: 2px;
            background: var(--input-background, rgba(0, 0, 0, 0.3));
            outline: none;
            border: 1px solid var(--input-border, rgba(255, 255, 255, 0.15));
            cursor: pointer;
        }

        .slider-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--focus-border-color, #007aff);
            cursor: pointer;
            border: 2px solid var(--text-color, white);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-input::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--focus-border-color, #007aff);
            cursor: pointer;
            border: 2px solid var(--text-color, white);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-input:hover::-webkit-slider-thumb {
            background: var(--text-input-button-hover, #0056b3);
        }

        .slider-input:hover::-moz-range-thumb {
            background: var(--text-input-button-hover, #0056b3);
        }

        .slider-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 4px;
            font-size: 10px;
            color: var(--description-color, rgba(255, 255, 255, 0.5));
        }
    `;

    static properties = {
        selectedProfile: { type: String },
        selectedLanguage: { type: String },
        selectedScreenshotInterval: { type: String },
        selectedImageQuality: { type: String },
        layoutMode: { type: String },
        keybinds: { type: Object },
        googleSearchEnabled: { type: Boolean },
        backgroundTransparency: { type: Number },
        fontSize: { type: Number },
        onProfileChange: { type: Function },
        onLanguageChange: { type: Function },
        onScreenshotIntervalChange: { type: Function },
        onImageQualityChange: { type: Function },
        onLayoutModeChange: { type: Function },
        advancedMode: { type: Boolean },
        onAdvancedModeChange: { type: Function },
    };

    constructor() {
        super();
        this.selectedProfile = 'interview';
        this.selectedLanguage = 'en-US';
        this.selectedScreenshotInterval = '5';
        this.selectedImageQuality = 'medium';
        this.layoutMode = 'normal';
        this.keybinds = this.getDefaultKeybinds();
        this.onProfileChange = () => {};
        this.onLanguageChange = () => {};
        this.onScreenshotIntervalChange = () => {};
        this.onImageQualityChange = () => {};
        this.onLayoutModeChange = () => {};
        this.onAdvancedModeChange = () => {};

        // Google Search default
        this.googleSearchEnabled = true;

        // Advanced mode default
        this.advancedMode = false;

        // Background transparency default
        this.backgroundTransparency = 0.8;

        // Font size default (in pixels)
        this.fontSize = 20;

        this.loadKeybinds();
        this.loadGoogleSearchSettings();
        this.loadAdvancedModeSettings();
        this.loadBackgroundTransparency();
        this.loadFontSize();
    }

    connectedCallback() {
        super.connectedCallback();
        // Load layout mode for display purposes
        this.loadLayoutMode();
        // Resize window for this view
        resizeLayout();
    }

    getProfiles() {
        return [
            {
                value: 'interview',
                name: 'Job Interview',
                description: 'Get help with answering interview questions',
            },
            {
                value: 'sales',
                name: 'Sales Call',
                description: 'Assist with sales conversations and objection handling',
            },
            {
                value: 'meeting',
                name: 'Business Meeting',
                description: 'Support for professional meetings and discussions',
            },
            {
                value: 'presentation',
                name: 'Presentation',
                description: 'Help with presentations and public speaking',
            },
            {
                value: 'negotiation',
                name: 'Negotiation',
                description: 'Guidance for business negotiations and deals',
            },
            {
                value: 'firstday',
                name: 'First Day Work',
                description: 'Calm guidance for navigating your first day at a new job',
            },
            {
                value: 'exam',
                name: 'Exam Assistant',
                description: 'Academic assistance for test-taking and exam questions',
            },
            {
                value: 'test',
                name: 'Online Test',
                description: 'Rapid assistance for timed online tests and coding challenges',
            },
            {
                value: 'homework',
                name: 'Homework Helper',
                description: 'Comprehensive help with assignments and problem sets',
            },
        ];
    }

    getLanguages() {
        return [
            { value: 'en-US', name: 'English (US)' },
            { value: 'en-GB', name: 'English (UK)' },
            { value: 'en-AU', name: 'English (Australia)' },
            { value: 'en-IN', name: 'English (India)' },
            { value: 'de-DE', name: 'German (Germany)' },
            { value: 'es-US', name: 'Spanish (United States)' },
            { value: 'es-ES', name: 'Spanish (Spain)' },
            { value: 'fr-FR', name: 'French (France)' },
            { value: 'fr-CA', name: 'French (Canada)' },
            { value: 'hi-IN', name: 'Hindi (India)' },
            { value: 'pt-BR', name: 'Portuguese (Brazil)' },
            { value: 'ar-XA', name: 'Arabic (Generic)' },
            { value: 'id-ID', name: 'Indonesian (Indonesia)' },
            { value: 'it-IT', name: 'Italian (Italy)' },
            { value: 'ja-JP', name: 'Japanese (Japan)' },
            { value: 'tr-TR', name: 'Turkish (Turkey)' },
            { value: 'vi-VN', name: 'Vietnamese (Vietnam)' },
            { value: 'bn-IN', name: 'Bengali (India)' },
            { value: 'gu-IN', name: 'Gujarati (India)' },
            { value: 'kn-IN', name: 'Kannada (India)' },
            { value: 'ml-IN', name: 'Malayalam (India)' },
            { value: 'mr-IN', name: 'Marathi (India)' },
            { value: 'ta-IN', name: 'Tamil (India)' },
            { value: 'te-IN', name: 'Telugu (India)' },
            { value: 'nl-NL', name: 'Dutch (Netherlands)' },
            { value: 'ko-KR', name: 'Korean (South Korea)' },
            { value: 'cmn-CN', name: 'Mandarin Chinese (China)' },
            { value: 'pl-PL', name: 'Polish (Poland)' },
            { value: 'ru-RU', name: 'Russian (Russia)' },
            { value: 'th-TH', name: 'Thai (Thailand)' },
        ];
    }

    getProfileNames() {
        return {
            interview: 'Job Interview',
            sales: 'Sales Call',
            meeting: 'Business Meeting',
            presentation: 'Presentation',
            negotiation: 'Negotiation',
            firstday: 'First Day Work',
            exam: 'Exam Assistant',
            test: 'Online Test',
            homework: 'Homework Helper',
        };
    }

    handleProfileSelect(e) {
        this.selectedProfile = e.target.value;
        localStorage.setItem('selectedProfile', this.selectedProfile);
        this.onProfileChange(this.selectedProfile);
    }

    handleLanguageSelect(e) {
        this.selectedLanguage = e.target.value;
        localStorage.setItem('selectedLanguage', this.selectedLanguage);
        this.onLanguageChange(this.selectedLanguage);
    }

    handleScreenshotIntervalSelect(e) {
        this.selectedScreenshotInterval = e.target.value;
        localStorage.setItem('selectedScreenshotInterval', this.selectedScreenshotInterval);
        this.onScreenshotIntervalChange(this.selectedScreenshotInterval);
    }

    handleImageQualitySelect(e) {
        this.selectedImageQuality = e.target.value;
        this.onImageQualityChange(e.target.value);
    }

    handleLayoutModeSelect(e) {
        this.layoutMode = e.target.value;
        localStorage.setItem('layoutMode', this.layoutMode);
        this.onLayoutModeChange(e.target.value);
    }

    handleCustomPromptInput(e) {
        const maxLength = 2000; // ~500 tokens
        let value = e.target.value;
        
        if (value.length > maxLength) {
            value = value.substring(0, maxLength);
            e.target.value = value;
        }
        
        localStorage.setItem('customPrompt', value);
        this.requestUpdate(); // Update character counter
    }

    getProfileTemplates() {
        return {
            interview: [
                {
                    name: 'Software Engineer',
                    template: `I'm interviewing for a Senior Software Engineer role at [Company Name].

Key Details:
- 5+ years experience with React, Node.js, and TypeScript
- Led a team of 3 developers at my current company
- Built a microservices architecture handling 1M+ requests/day
- Strong focus on system design and scalability

Company Info:
- [Company] is a [industry] company focused on [product/service]
- The role involves [key responsibilities]
- Tech stack: [technologies they use]

What I want to emphasize:
- My leadership experience and mentoring skills
- Technical depth in [specific area]
- Problem-solving approach and system thinking`
                },
                {
                    name: 'Product Manager',
                    template: `I'm interviewing for a Product Manager position at [Company Name].

Background:
- 4 years of PM experience in [industry]
- Launched 3 major features with 50K+ active users
- Strong in user research, roadmap planning, and stakeholder management
- Experience with Agile/Scrum methodologies

Company Context:
- [Company] builds [product description]
- They're looking for someone to own [product area]
- Key challenges: [known challenges or goals]

Focus Areas:
- Data-driven decision making
- Cross-functional collaboration
- User-centric product development`
                },
                {
                    name: 'Generic Template',
                    template: `I'm interviewing for a [Job Title] role at [Company Name].

My Background:
- [Years] of experience in [field/industry]
- Key skills: [skill 1], [skill 2], [skill 3]
- Major achievements: [achievement 1], [achievement 2]

About the Company:
- [Company] is known for [what they do]
- The role involves [key responsibilities]
- Company culture: [culture notes if known]

What I Want to Highlight:
- [Key strength 1]
- [Key strength 2]
- [Relevant experience or project]`
                }
            ],
            sales: [
                {
                    name: 'SaaS Sales',
                    template: `I'm selling [Product Name], a SaaS platform for [target audience].

Product Details:
- Pricing: $[X]/month or $[Y]/year
- Key features: [feature 1], [feature 2], [feature 3]
- Main value proposition: [how it helps customers]
- ROI: Customers typically see [X]% improvement in [metric]

Target Audience:
- [Job titles] at [company size] companies
- Industries: [industry 1], [industry 2]
- Pain points: [problem 1], [problem 2]

Competitors:
- Main competitors: [competitor 1], [competitor 2]
- Our differentiators: [what makes us unique]

Common Objections:
- Price concerns: [how to handle]
- "We already use [competitor]": [response strategy]`
                },
                {
                    name: 'Generic Sales',
                    template: `I'm selling [Product/Service Name] to [target customer type].

What We Offer:
- [Brief product/service description]
- Price point: [pricing information]
- Key benefits: [benefit 1], [benefit 2], [benefit 3]

Target Customers:
- [Customer profile]
- Common pain points: [pain 1], [pain 2]

Competitive Landscape:
- Main competitors: [names]
- Our advantages: [differentiators]

Sales Goals:
- [What you're trying to achieve in this call]`
                }
            ],
            meeting: [
                {
                    name: 'Project Status Update',
                    template: `Meeting Type: Project Status Update

Project: [Project Name]
My Role: [Your role/responsibility]

Current Status:
- Progress: [X]% complete
- Timeline: [on track / behind / ahead]
- Budget: [status]

Key Updates:
- [Recent accomplishment 1]
- [Recent accomplishment 2]
- [Challenge or blocker]

Next Steps:
- [Action item 1]
- [Action item 2]

Questions I May Face:
- [Anticipated question 1]
- [Anticipated question 2]`
                },
                {
                    name: 'Generic Meeting',
                    template: `Meeting Type: [Type of meeting]
Attendees: [Key people attending]
My Role: [Participant / Presenter / Facilitator]

Meeting Purpose:
- [Main objective]

Key Topics:
- [Topic 1]
- [Topic 2]
- [Topic 3]

My Preparation:
- [What I need to discuss or present]
- [Questions I have]
- [Decisions needed]`
                }
            ],
            presentation: [
                {
                    name: 'Product Demo',
                    template: `Presentation Type: Product Demo
Audience: [Who's attending - titles, company size]
Duration: [X] minutes

Product: [Product Name]
Key Message: [Main value proposition]

Demo Flow:
1. [Feature/section 1]
2. [Feature/section 2]
3. [Feature/section 3]

Key Metrics to Mention:
- [Metric 1]: [value]
- [Metric 2]: [value]

Anticipated Questions:
- [Question 1]
- [Question 2]

Call to Action:
- [What you want audience to do next]`
                },
                {
                    name: 'Generic Presentation',
                    template: `Presentation Topic: [Topic]
Audience: [Who's attending]
Duration: [X] minutes

Main Points:
1. [Point 1]
2. [Point 2]
3. [Point 3]

Key Data/Facts:
- [Stat or fact 1]
- [Stat or fact 2]

Potential Questions:
- [Question 1]
- [Question 2]`
                }
            ],
            negotiation: [
                {
                    name: 'Salary Negotiation',
                    template: `Negotiation Type: Salary/Compensation

Current Offer:
- Base salary: $[X]
- Bonus: [details]
- Equity: [details]
- Other benefits: [list]

My Target:
- Desired base: $[Y]
- Justification: [market rate, experience, competing offers]

Market Research:
- Industry average for this role: $[range]
- My current compensation: $[amount]
- Competing offer (if any): $[amount]

Negotiation Strategy:
- Primary ask: [what you want most]
- Secondary priorities: [other items]
- Walk-away point: [minimum acceptable]

Leverage Points:
- [Unique skill or experience]
- [Market demand]
- [Other offers or opportunities]`
                },
                {
                    name: 'Business Deal',
                    template: `Negotiation Type: [Contract / Partnership / Deal]

What We Want:
- [Primary objective]
- [Secondary objectives]

What They Want:
- [Their likely priorities]

Our Position:
- Strengths: [what we bring to the table]
- Constraints: [our limitations]

Their Position:
- Strengths: [what they have]
- Constraints: [their limitations]

BATNA (Best Alternative):
- [What we'll do if this doesn't work out]

Negotiation Range:
- Ideal outcome: [best case]
- Acceptable outcome: [middle ground]
- Walk-away point: [minimum acceptable]`
                }
            ],
            firstday: [
                {
                    name: 'Tech Company',
                    template: `I'm starting my first day at [Company Name] as a [Job Title].

About Me:
- [X] years of experience in [field/technology]
- Previously worked at [Previous Company] as [Previous Role]
- Strong background in [key skill 1], [key skill 2], [key skill 3]
- Most proud of: [major achievement or project]

About This Role:
- Joining the [Team Name] team
- Will be working on [project/product area]
- Reports to [Manager Name]
- Team size: [number] people

What I Know About the Company:
- [Company] builds [product/service description]
- Known for [company culture trait or achievement]
- Tech stack includes: [technologies if known]
- Recent news: [any recent company news]

My Goals for Today:
- Make a great first impression
- Learn team dynamics and culture
- Understand my initial responsibilities
- Set up development environment
- Meet key team members

Conversation Style:
- I'm naturally [friendly/analytical/enthusiastic]
- I prefer to [listen first/ask questions/jump in]
- I want to come across as [confident but humble/eager to learn/collaborative]`
                },
                {
                    name: 'Generic First Day',
                    template: `I'm starting my first day at [Company Name] as a [Job Title].

My Background:
- [X] years of experience in [industry/field]
- Previously at [Previous Company] doing [what you did]
- Key strengths: [strength 1], [strength 2], [strength 3]
- Notable achievement: [something you're proud of]

About This Position:
- Role: [Job Title]
- Department: [Department Name]
- Manager: [Manager Name]
- Key responsibilities: [what you'll be doing]

What I Know About the Company:
- Industry: [industry]
- Company size: [number of employees]
- Culture: [what you know about culture]
- Why I joined: [what attracted you]

My Personality:
- Communication style: [direct/diplomatic/friendly]
- Work style: [collaborative/independent/flexible]
- How I want to be perceived: [professional/approachable/competent]

First Day Goals:
- Understand team structure and dynamics
- Learn key processes and tools
- Make positive connections
- Clarify expectations and priorities`
                },
                {
                    name: 'Career Change',
                    template: `I'm starting my first day at [Company Name] as a [Job Title] - this is a career change for me.

My Previous Career:
- Spent [X] years in [previous field/industry]
- Most recent role: [Previous Job Title] at [Previous Company]
- Transferable skills: [skill 1], [skill 2], [skill 3]

Why I'm Changing Careers:
- [Brief reason for career change]
- What attracted me to [new field]: [motivation]
- Relevant preparation: [courses/certifications/projects]

About This New Role:
- Position: [Job Title]
- Team: [Team Name]
- Manager: [Manager Name]
- What I'll be doing: [responsibilities]

My Approach:
- I'm aware I'm new to [field] but bring [relevant experience]
- Eager to learn and ask questions
- Want to leverage my [previous industry] background where relevant
- Committed to getting up to speed quickly

How I Want to Present Myself:
- Confident in my transferable skills
- Humble about what I need to learn
- Enthusiastic about the career change
- Professional and adaptable`
                }
            ],
            exam: [
                {
                    name: 'Computer Science Exam',
                    template: `Exam: [Course Name] - [Exam Type]
Duration: [X] minutes
Format: [Multiple choice / Short answer / Coding / Mixed]

Topics Covered:
- [Topic 1]
- [Topic 2]
- [Topic 3]

Key Concepts:
- [Concept 1]
- [Concept 2]

Allowed Resources:
- [Calculator / Notes / Open book / None]

Focus Areas:
- [What professor emphasized]
- [Common exam patterns]`
                },
                {
                    name: 'Generic Exam',
                    template: `Exam Subject: [Subject]
Level: [Course level or grade]
Duration: [X] minutes

Topics:
- [Topic 1]
- [Topic 2]
- [Topic 3]

Format:
- [Question types]

Allowed Materials:
- [What you can use]`
                }
            ],
            test: [
                {
                    name: 'Coding Challenge',
                    template: `Test Type: Coding Challenge
Platform: [LeetCode / HackerRank / Company platform]
Duration: [X] minutes
Language: [Programming language]

Focus Areas:
- Data structures: [arrays, trees, graphs, etc.]
- Algorithms: [sorting, searching, dynamic programming, etc.]
- Complexity: [Expected time/space complexity]

My Strengths:
- [Strong area 1]
- [Strong area 2]

Need Quick Help With:
- [Weak area 1]
- [Weak area 2]

Test Format:
- [Number] problems
- Difficulty: [Easy / Medium / Hard]`
                },
                {
                    name: 'Certification Exam',
                    template: `Certification: [Certification Name]
Duration: [X] minutes
Format: [Multiple choice / Practical / Mixed]

Key Topics:
- [Topic 1]
- [Topic 2]
- [Topic 3]

Passing Score: [X]%

Focus Areas:
- [What's heavily tested]

Time Management:
- [Strategy for pacing]`
                }
            ],
            homework: [
                {
                    name: 'Programming Assignment',
                    template: `Assignment: [Assignment Name]
Course: [Course Name]
Due: [Date and time]
Language: [Programming language]

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Constraints:
- [Any limitations or rules]

What I Need Help With:
- [Specific area 1]
- [Specific area 2]

My Approach So Far:
- [What you've tried]

Grading Criteria:
- [What's being evaluated]`
                },
                {
                    name: 'Essay/Research',
                    template: `Assignment: [Assignment Title]
Subject: [Subject/Course]
Due: [Date]
Length: [Word count or pages]

Topic: [Essay topic or research question]

Requirements:
- [Requirement 1]
- [Requirement 2]

Sources Needed:
- [Number] sources
- Types: [Academic journals / Books / etc.]

My Thesis/Argument:
- [Your main argument or thesis statement]

Areas I Need Help With:
- [Specific section or concept]

Citation Style: [APA / MLA / Chicago / etc.]`
                },
                {
                    name: 'Math/Science Problem Set',
                    template: `Assignment: [Problem Set Name]
Subject: [Math / Physics / Chemistry / etc.]
Due: [Date]

Topics Covered:
- [Topic 1]
- [Topic 2]

Number of Problems: [X]

Concepts I Understand:
- [Concept 1]
- [Concept 2]

Concepts I'm Struggling With:
- [Concept 1]
- [Concept 2]

Show Work Required: [Yes / No]

Calculator Allowed: [Yes / No]`
                }
            ]
        };
    }

    loadTemplate(template) {
        const textarea = this.shadowRoot.querySelector('.custom-prompt-textarea');
        if (textarea) {
            textarea.value = template;
            localStorage.setItem('customPrompt', template);
            this.requestUpdate();
        }
    }

    getDefaultKeybinds() {
        const isMac = cheddar.isMacOS || navigator.platform.includes('Mac');
        return {
            moveUp: isMac ? 'Alt+Up' : 'Ctrl+Up',
            moveDown: isMac ? 'Alt+Down' : 'Ctrl+Down',
            moveLeft: isMac ? 'Alt+Left' : 'Ctrl+Left',
            moveRight: isMac ? 'Alt+Right' : 'Ctrl+Right',
            toggleVisibility: isMac ? 'Cmd+\\' : 'Ctrl+\\',
            toggleClickThrough: isMac ? 'Cmd+M' : 'Ctrl+M',
            nextStep: isMac ? 'Cmd+Enter' : 'Ctrl+Enter',
            previousResponse: isMac ? 'Cmd+[' : 'Ctrl+[',
            nextResponse: isMac ? 'Cmd+]' : 'Ctrl+]',
            scrollUp: isMac ? 'Cmd+Shift+Up' : 'Ctrl+Shift+Up',
            scrollDown: isMac ? 'Cmd+Shift+Down' : 'Ctrl+Shift+Down',
        };
    }

    loadKeybinds() {
        const savedKeybinds = localStorage.getItem('customKeybinds');
        if (savedKeybinds) {
            try {
                this.keybinds = { ...this.getDefaultKeybinds(), ...JSON.parse(savedKeybinds) };
            } catch (e) {
                console.error('Failed to parse saved keybinds:', e);
                this.keybinds = this.getDefaultKeybinds();
            }
        }
    }

    saveKeybinds() {
        localStorage.setItem('customKeybinds', JSON.stringify(this.keybinds));
        // Send to main process to update global shortcuts
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('update-keybinds', this.keybinds);
        }
    }

    handleKeybindChange(action, value) {
        this.keybinds = { ...this.keybinds, [action]: value };
        this.saveKeybinds();
        this.requestUpdate();
    }

    resetKeybinds() {
        this.keybinds = this.getDefaultKeybinds();
        localStorage.removeItem('customKeybinds');
        this.requestUpdate();
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('update-keybinds', this.keybinds);
        }
    }

    getKeybindActions() {
        return [
            {
                key: 'moveUp',
                name: 'Move Window Up',
                description: 'Move the application window up',
            },
            {
                key: 'moveDown',
                name: 'Move Window Down',
                description: 'Move the application window down',
            },
            {
                key: 'moveLeft',
                name: 'Move Window Left',
                description: 'Move the application window left',
            },
            {
                key: 'moveRight',
                name: 'Move Window Right',
                description: 'Move the application window right',
            },
            {
                key: 'toggleVisibility',
                name: 'Toggle Window Visibility',
                description: 'Show/hide the application window',
            },
            {
                key: 'toggleClickThrough',
                name: 'Toggle Click-through Mode',
                description: 'Enable/disable click-through functionality',
            },
            {
                key: 'nextStep',
                name: 'Ask Next Step',
                description: 'Take screenshot and ask AI for the next step suggestion',
            },
            {
                key: 'previousResponse',
                name: 'Previous Response',
                description: 'Navigate to the previous AI response',
            },
            {
                key: 'nextResponse',
                name: 'Next Response',
                description: 'Navigate to the next AI response',
            },
            {
                key: 'scrollUp',
                name: 'Scroll Response Up',
                description: 'Scroll the AI response content up',
            },
            {
                key: 'scrollDown',
                name: 'Scroll Response Down',
                description: 'Scroll the AI response content down',
            },
        ];
    }

    handleKeybindFocus(e) {
        e.target.placeholder = 'Press key combination...';
        e.target.select();
    }

    handleKeybindInput(e) {
        e.preventDefault();

        const modifiers = [];
        const keys = [];

        // Check modifiers
        if (e.ctrlKey) modifiers.push('Ctrl');
        if (e.metaKey) modifiers.push('Cmd');
        if (e.altKey) modifiers.push('Alt');
        if (e.shiftKey) modifiers.push('Shift');

        // Get the main key
        let mainKey = e.key;

        // Handle special keys
        switch (e.code) {
            case 'ArrowUp':
                mainKey = 'Up';
                break;
            case 'ArrowDown':
                mainKey = 'Down';
                break;
            case 'ArrowLeft':
                mainKey = 'Left';
                break;
            case 'ArrowRight':
                mainKey = 'Right';
                break;
            case 'Enter':
                mainKey = 'Enter';
                break;
            case 'Space':
                mainKey = 'Space';
                break;
            case 'Backslash':
                mainKey = '\\';
                break;
            case 'KeyS':
                if (e.shiftKey) mainKey = 'S';
                break;
            case 'KeyM':
                mainKey = 'M';
                break;
            default:
                if (e.key.length === 1) {
                    mainKey = e.key.toUpperCase();
                }
                break;
        }

        // Skip if only modifier keys are pressed
        if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
            return;
        }

        // Construct keybind string
        const keybind = [...modifiers, mainKey].join('+');

        // Get the action from the input's data attribute
        const action = e.target.dataset.action;

        // Update the keybind
        this.handleKeybindChange(action, keybind);

        // Update the input value
        e.target.value = keybind;
        e.target.blur();
    }

    loadGoogleSearchSettings() {
        const googleSearchEnabled = localStorage.getItem('googleSearchEnabled');
        if (googleSearchEnabled !== null) {
            this.googleSearchEnabled = googleSearchEnabled === 'true';
        }
    }

    async handleGoogleSearchChange(e) {
        this.googleSearchEnabled = e.target.checked;
        localStorage.setItem('googleSearchEnabled', this.googleSearchEnabled.toString());

        // Notify main process if available
        if (window.require) {
            try {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('update-google-search-setting', this.googleSearchEnabled);
            } catch (error) {
                console.error('Failed to notify main process:', error);
            }
        }

        this.requestUpdate();
    }

    loadLayoutMode() {
        const savedLayoutMode = localStorage.getItem('layoutMode');
        if (savedLayoutMode) {
            this.layoutMode = savedLayoutMode;
        }
    }

    loadAdvancedModeSettings() {
        const advancedMode = localStorage.getItem('advancedMode');
        if (advancedMode !== null) {
            this.advancedMode = advancedMode === 'true';
        }
    }

    async handleAdvancedModeChange(e) {
        this.advancedMode = e.target.checked;
        localStorage.setItem('advancedMode', this.advancedMode.toString());
        this.onAdvancedModeChange(this.advancedMode);
        this.requestUpdate();
    }

    loadBackgroundTransparency() {
        const backgroundTransparency = localStorage.getItem('backgroundTransparency');
        if (backgroundTransparency !== null) {
            this.backgroundTransparency = parseFloat(backgroundTransparency) || 0.8;
        }
        this.updateBackgroundTransparency();
    }

    handleBackgroundTransparencyChange(e) {
        this.backgroundTransparency = parseFloat(e.target.value);
        localStorage.setItem('backgroundTransparency', this.backgroundTransparency.toString());
        this.updateBackgroundTransparency();
        this.requestUpdate();
    }

    updateBackgroundTransparency() {
        const root = document.documentElement;
        root.style.setProperty('--header-background', `rgba(0, 0, 0, ${this.backgroundTransparency})`);
        root.style.setProperty('--main-content-background', `rgba(0, 0, 0, ${this.backgroundTransparency})`);
        root.style.setProperty('--card-background', `rgba(255, 255, 255, ${this.backgroundTransparency * 0.05})`);
        root.style.setProperty('--input-background', `rgba(0, 0, 0, ${this.backgroundTransparency * 0.375})`);
        root.style.setProperty('--input-focus-background', `rgba(0, 0, 0, ${this.backgroundTransparency * 0.625})`);
        root.style.setProperty('--button-background', `rgba(0, 0, 0, ${this.backgroundTransparency * 0.625})`);
        root.style.setProperty('--preview-video-background', `rgba(0, 0, 0, ${this.backgroundTransparency * 1.125})`);
        root.style.setProperty('--screen-option-background', `rgba(0, 0, 0, ${this.backgroundTransparency * 0.5})`);
        root.style.setProperty('--screen-option-hover-background', `rgba(0, 0, 0, ${this.backgroundTransparency * 0.75})`);
        root.style.setProperty('--scrollbar-background', `rgba(0, 0, 0, ${this.backgroundTransparency * 0.5})`);
    }

    loadFontSize() {
        const fontSize = localStorage.getItem('fontSize');
        if (fontSize !== null) {
            this.fontSize = parseInt(fontSize, 10) || 20;
        }
        this.updateFontSize();
    }

    handleFontSizeChange(e) {
        this.fontSize = parseInt(e.target.value, 10);
        localStorage.setItem('fontSize', this.fontSize.toString());
        this.updateFontSize();
        this.requestUpdate();
    }

    updateFontSize() {
        const root = document.documentElement;
        root.style.setProperty('--response-font-size', `${this.fontSize}px`);
    }

    render() {
        const profiles = this.getProfiles();
        const languages = this.getLanguages();
        const profileNames = this.getProfileNames();
        const currentProfile = profiles.find(p => p.value === this.selectedProfile);
        const currentLanguage = languages.find(l => l.value === this.selectedLanguage);

        return html`
            <div class="settings-container">
                <!-- Profile & Behavior Section -->
                <div class="settings-section">
                    <div class="section-title">
                        <span>AI Profile & Behavior</span>
                    </div>

                    <div class="form-grid">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    Profile Type
                                    <span class="current-selection">${currentProfile?.name || 'Unknown'}</span>
                                </label>
                                <select class="form-control" .value=${this.selectedProfile} @change=${this.handleProfileSelect}>
                                    ${profiles.map(
                                        profile => html`
                                            <option value=${profile.value} ?selected=${this.selectedProfile === profile.value}>
                                                ${profile.name}
                                            </option>
                                        `
                                    )}
                                </select>
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label">
                                Custom AI Instructions
                                <span class="char-counter">
                                    ${(localStorage.getItem('customPrompt') || '').length} / 2000 characters
                                </span>
                            </label>
                            
                            ${this.getProfileTemplates()[this.selectedProfile] ? html`
                                <div class="template-buttons">
                                    <span class="template-label">Quick Templates:</span>
                                    ${this.getProfileTemplates()[this.selectedProfile].map(
                                        template => html`
                                            <button
                                                class="template-btn"
                                                @click=${() => this.loadTemplate(template.template)}
                                                type="button"
                                            >
                                                ${template.name}
                                            </button>
                                        `
                                    )}
                                </div>
                            ` : ''}
                            
                            <textarea
                                class="form-control custom-prompt-textarea"
                                placeholder="Add specific instructions for how you want the AI to behave during ${
                                    profileNames[this.selectedProfile] || 'this interaction'
                                }..."
                                .value=${localStorage.getItem('customPrompt') || ''}
                                rows="6"
                                maxlength="2000"
                                @input=${this.handleCustomPromptInput}
                            ></textarea>
                            <div class="form-description">
                                Personalize the AI's behavior with specific instructions that will be added to the
                                ${profileNames[this.selectedProfile] || 'selected profile'} base prompts. 
                                Use templates above as a starting point and customize them for your situation.
                </div>
                </div>
            </div>
        </div>

                <!-- Audio & Microphone Section -->
                <div class="settings-section">
                    <div class="section-title">
                        <span>Audio & Microphone</span>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Audio Mode</label>
                            <select class="form-control" .value=${localStorage.getItem('audioMode') || 'speaker_only'} @change=${e => localStorage.setItem('audioMode', e.target.value)}>
                                <option value="speaker_only">Speaker Only (Interviewer)</option>
                                <option value="mic_only">Microphone Only (Me)</option>
                                <option value="both">Both Speaker & Microphone</option>
                            </select>
                            <div class="form-description">
                                Choose which audio sources to capture for the AI.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stealth Profile Section -->
                <div class="settings-section">
                    <div class="section-title">
                        <span>Stealth Profile</span>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Profile</label>
                            <select class="form-control" .value=${localStorage.getItem('stealthProfile') || 'balanced'} @change=${e => {
                                localStorage.setItem('stealthProfile', e.target.value);
                                // We need to notify the main process to restart for some settings to apply
                                alert('Restart the application for stealth changes to take full effect.');
                            }}>
                                <option value="visible">Visible</option>
                                <option value="balanced">Balanced</option>
                                <option value="ultra">Ultra-Stealth</option>
                            </select>
                            <div class="form-description">
                                Adjusts visibility and detection resistance. A restart is required for changes to apply.
                            </div>
                        </div>
                    </div>
                </div>


                <!-- Language & Audio Section -->
                <div class="settings-section">
                    <div class="section-title">
                        <span>Language & Audio</span>
                    </div>

                    <div class="form-grid">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    Speech Language
                                    <span class="current-selection">${currentLanguage?.name || 'Unknown'}</span>
                                </label>
                                <select class="form-control" .value=${this.selectedLanguage} @change=${this.handleLanguageSelect}>
                                    ${languages.map(
                                        language => html`
                                            <option value=${language.value} ?selected=${this.selectedLanguage === language.value}>
                                                ${language.name}
                                            </option>
                                        `
                                    )}
                                </select>
                                <div class="form-description">Language for speech recognition and AI responses</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Interface Layout Section -->
                <div class="settings-section">
                    <div class="section-title">
                        <span>Interface Layout</span>
                    </div>

                    <div class="form-grid">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    Layout Mode
                                    <span class="current-selection">${this.layoutMode === 'compact' ? 'Compact' : 'Normal'}</span>
                                </label>
                                <select class="form-control" .value=${this.layoutMode} @change=${this.handleLayoutModeSelect}>
                                    <option value="normal" ?selected=${this.layoutMode === 'normal'}>Normal</option>
                                    <option value="compact" ?selected=${this.layoutMode === 'compact'}>Compact</option>
                                </select>
                                <div class="form-description">
                                    ${
                                        this.layoutMode === 'compact'
                                            ? 'Smaller window size with reduced padding and font sizes for minimal screen footprint'
                                            : 'Standard layout with comfortable spacing and font sizes'
                                    }
                                </div>
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <div class="slider-container">
                                <div class="slider-header">
                                    <label class="form-label">Background Transparency</label>
                                    <span class="slider-value">${Math.round(this.backgroundTransparency * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    class="slider-input"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    .value=${this.backgroundTransparency}
                                    @input=${this.handleBackgroundTransparencyChange}
                                />
                                <div class="slider-labels">
                                    <span>Transparent</span>
                                    <span>Opaque</span>
                                </div>
                                <div class="form-description">
                                    Adjust the transparency of the interface background elements
                                </div>
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <div class="slider-container">
                                <div class="slider-header">
                                    <label class="form-label">Response Font Size</label>
                                    <span class="slider-value">${this.fontSize}px</span>
                                </div>
                                <input
                                    type="range"
                                    class="slider-input"
                                    min="12"
                                    max="32"
                                    step="1"
                                    .value=${this.fontSize}
                                    @input=${this.handleFontSizeChange}
                                />
                                <div class="slider-labels">
                                    <span>12px</span>
                                    <span>32px</span>
                                </div>
                                <div class="form-description">
                                    Adjust the font size of AI response text in the assistant view
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                <!-- Screen Capture Section -->
                <div class="settings-section">
                    <div class="section-title">
                        <span>Screen Capture Settings</span>
                    </div>

                    <div class="form-grid">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    Capture Interval
                                    <span class="current-selection"
                                        >${this.selectedScreenshotInterval === 'manual' ? 'Manual' : this.selectedScreenshotInterval + 's'}</span
                                    >
                                </label>
                                <select class="form-control" .value=${this.selectedScreenshotInterval} @change=${this.handleScreenshotIntervalSelect}>
                                    <option value="manual" ?selected=${this.selectedScreenshotInterval === 'manual'}>Manual (On demand)</option>
                                    <option value="1" ?selected=${this.selectedScreenshotInterval === '1'}>Every 1 second</option>
                                    <option value="2" ?selected=${this.selectedScreenshotInterval === '2'}>Every 2 seconds</option>
                                    <option value="5" ?selected=${this.selectedScreenshotInterval === '5'}>Every 5 seconds</option>
                                    <option value="10" ?selected=${this.selectedScreenshotInterval === '10'}>Every 10 seconds</option>
                                </select>
                                <div class="form-description">
                                    ${
                                        this.selectedScreenshotInterval === 'manual'
                                            ? 'Screenshots will only be taken when you use the "Ask Next Step" shortcut'
                                            : 'Automatic screenshots will be taken at the specified interval'
                                    }
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    Image Quality
                                    <span class="current-selection"
                                        >${this.selectedImageQuality.charAt(0).toUpperCase() + this.selectedImageQuality.slice(1)}</span
                                    >
                                </label>
                                <select class="form-control" .value=${this.selectedImageQuality} @change=${this.handleImageQualitySelect}>
                                    <option value="high" ?selected=${this.selectedImageQuality === 'high'}>High Quality</option>
                                    <option value="medium" ?selected=${this.selectedImageQuality === 'medium'}>Medium Quality</option>
                                    <option value="low" ?selected=${this.selectedImageQuality === 'low'}>Low Quality</option>
                                </select>
                                <div class="form-description">
                                    ${
                                        this.selectedImageQuality === 'high'
                                            ? 'Best quality, uses more tokens'
                                            : this.selectedImageQuality === 'medium'
                                              ? 'Balanced quality and token usage'
                                              : 'Lower quality, uses fewer tokens'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Keyboard Shortcuts Section -->
                <div class="settings-section">
                    <div class="section-title">
                        <span>Keyboard Shortcuts</span>
                    </div>

                    <table class="keybinds-table">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Shortcut</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getKeybindActions().map(
                                action => html`
                                    <tr>
                                        <td>
                                            <div class="action-name">${action.name}</div>
                                            <div class="action-description">${action.description}</div>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                class="form-control keybind-input"
                                                .value=${this.keybinds[action.key]}
                                                placeholder="Press keys..."
                                                data-action=${action.key}
                                                @keydown=${this.handleKeybindInput}
                                                @focus=${this.handleKeybindFocus}
                                                readonly
                                            />
                                        </td>
                                    </tr>
                                `
                            )}
                            <tr class="table-reset-row">
                                <td colspan="2">
                                    <button class="reset-keybinds-button" @click=${this.resetKeybinds}>Reset to Defaults</button>
                                    <div class="form-description" style="margin-top: 8px;">
                                        Restore all keyboard shortcuts to their default values
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>



                <!-- Google Search Section -->
                <div class="settings-section">
                    <div class="section-title">
                        <span>Google Search</span>
                    </div>

                    <div class="form-grid">
                        <div class="checkbox-group">
                            <input
                                type="checkbox"
                                class="checkbox-input"
                                id="google-search-enabled"
                                .checked=${this.googleSearchEnabled}
                                @change=${this.handleGoogleSearchChange}
                            />
                            <label for="google-search-enabled" class="checkbox-label"> Enable Google Search </label>
                        </div>
                        <div class="form-description" style="margin-left: 24px; margin-top: -8px;">
                            Allow the AI to search Google for up-to-date information and facts during conversations
                            <br /><strong>Note:</strong> Changes take effect when starting a new AI session
                        </div>
                    </div>
                </div>

                <div class="settings-note">
                    💡 Settings are automatically saved as you change them. Changes will take effect immediately or on the next session start.
                </div>

                <!-- Advanced Mode Section (Danger Zone) -->
                <div class="settings-section" style="border-color: var(--danger-border, rgba(239, 68, 68, 0.3)); background: var(--danger-background, rgba(239, 68, 68, 0.05));">
                    <div class="section-title" style="color: var(--danger-color, #ef4444);">
                        <span>⚠️ Advanced Mode</span>
                    </div>

                    <div class="form-grid">
                        <div class="checkbox-group">
                                <input
                                    type="checkbox"
                                    class="checkbox-input"
                                    id="advanced-mode"
                                    .checked=${this.advancedMode}
                                    @change=${this.handleAdvancedModeChange}
                                />
                                <label for="advanced-mode" class="checkbox-label"> Enable Advanced Mode </label>
                            </div>
                            <div class="form-description" style="margin-left: 24px; margin-top: -8px;">
                                Unlock experimental features, developer tools, and advanced configuration options
                                <br /><strong>Note:</strong> Advanced mode adds a new icon to the main navigation bar
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('customize-view', CustomizeView);
