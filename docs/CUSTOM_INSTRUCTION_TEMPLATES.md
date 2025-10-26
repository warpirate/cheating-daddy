# Custom AI Instruction Templates

## Overview
Profile-specific templates help users quickly create effective custom instructions without starting from scratch. Each profile now includes 2-3 pre-written templates that can be loaded and customized.

## Features

### 1. Character Limit
- **Maximum**: 2000 characters (~500 tokens)
- **Real-time counter**: Shows current usage (e.g., "245 / 2000 characters")
- **Hard limit**: Textarea enforces the limit, preventing over-entry
- **Rationale**: Prevents token limit issues and encourages concise, focused instructions

### 2. Profile-Specific Templates
Each profile includes tailored templates that match the use case:

#### Interview Profile (3 templates)
- **Software Engineer**: Tech role with experience, skills, and company context
- **Product Manager**: PM role with product experience and methodologies
- **Generic Template**: Flexible template for any role

#### Sales Profile (2 templates)
- **SaaS Sales**: Software sales with pricing, features, and objections
- **Generic Sales**: Flexible sales template for any product/service

#### Meeting Profile (2 templates)
- **Project Status Update**: Structured project meeting template
- **Generic Meeting**: Flexible meeting template

#### Presentation Profile (2 templates)
- **Product Demo**: Demo-specific with features and metrics
- **Generic Presentation**: Flexible presentation template

#### Negotiation Profile (2 templates)
- **Salary Negotiation**: Compensation negotiation with market research
- **Business Deal**: Contract/partnership negotiation template

#### First Day Work Profile (2 templates)
- **Tech Company**: First day at a tech company
- **Generic First Day**: Flexible first-day template

#### Exam Profile (2 templates)
- **Computer Science Exam**: CS-specific exam template
- **Generic Exam**: Flexible exam template

#### Online Test Profile (2 templates)
- **Coding Challenge**: Programming challenge template
- **Certification Exam**: Certification test template

#### Homework Profile (3 templates)
- **Programming Assignment**: Code assignment template
- **Essay/Research**: Writing assignment template
- **Math/Science Problem Set**: Problem set template

### 3. Template Loading
- Click any template button to instantly load it into the textarea
- Templates are starting points - users should customize them
- Loading a template replaces current content (intentional design)

## UI Components

### Template Buttons
```
Quick Templates: [Software Engineer] [Product Manager] [Generic Template]
```
- Displayed above the textarea
- Only shown for profiles that have templates
- Styled with accent color for visibility
- Hover effect for better UX

### Character Counter
```
Custom AI Instructions                    245 / 2000 characters
```
- Displayed in the label, right-aligned
- Updates in real-time as user types
- Helps users stay within limits

### Enhanced Textarea
- Increased from 4 to 6 rows for better visibility
- Monospace font for better readability
- `maxlength="2000"` attribute enforces limit
- Improved placeholder text

## Template Structure

All templates follow a consistent structure:

```
[Context Header]
- Role/situation identification

[Key Details Section]
- Relevant background information
- Skills, experience, or product details

[Specific Context]
- Company/customer/exam information
- Unique circumstances

[Focus Areas]
- What to emphasize
- Goals or concerns
```

## Usage Guidelines

### For Users
1. **Select your profile** first (templates are profile-specific)
2. **Click a template** that matches your situation
3. **Customize the template**:
   - Replace `[placeholders]` with your actual information
   - Remove sections that don't apply
   - Add additional context as needed
4. **Stay within 2000 characters** (counter helps track this)

### Template Customization Examples

**Before (Template)**:
```
I'm interviewing for a [Job Title] role at [Company Name].
My Background:
- [Years] of experience in [field/industry]
```

**After (Customized)**:
```
I'm interviewing for a Senior DevOps Engineer role at Amazon Web Services.
My Background:
- 8 years of experience in cloud infrastructure and automation
```

## Technical Implementation

### Character Limit Enforcement
```javascript
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
```

### Template Data Structure
```javascript
getProfileTemplates() {
    return {
        interview: [
            {
                name: 'Software Engineer',
                template: `...template content...`
            },
            // ... more templates
        ],
        // ... other profiles
    };
}
```

### Template Loading
```javascript
loadTemplate(template) {
    const textarea = this.shadowRoot.querySelector('.custom-prompt-textarea');
    if (textarea) {
        textarea.value = template;
        localStorage.setItem('customPrompt', template);
        this.requestUpdate();
    }
}
```

## Benefits

### 1. Reduced Friction
- Users don't need to figure out what to write
- Templates provide structure and examples
- Faster onboarding for new users

### 2. Better Quality Instructions
- Templates include all relevant sections
- Users less likely to miss important context
- Consistent format improves AI understanding

### 3. Educational
- Templates teach users what information is valuable
- Shows the level of detail expected
- Demonstrates best practices

### 4. Token Management
- 2000 character limit prevents token overflow
- Visual feedback helps users stay within bounds
- Reduces API errors from oversized prompts

## Future Enhancements

Potential improvements:
1. **Template preview**: Hover to see full template before loading
2. **Custom templates**: Allow users to save their own templates
3. **Template categories**: More granular template options
4. **Smart suggestions**: AI-powered template recommendations
5. **Template sharing**: Community-contributed templates
6. **Multi-language templates**: Templates in different languages
7. **Dynamic character limit**: Adjust based on provider token limits

## Files Modified

- `src/components/views/CustomizeView.js`:
  - Added `getProfileTemplates()` method with all templates
  - Added `loadTemplate()` method
  - Updated `handleCustomPromptInput()` with character limit
  - Added template buttons UI
  - Added character counter UI
  - Added CSS styles for templates and counter

## Testing Checklist

- [ ] Character counter updates in real-time
- [ ] Character limit enforced at 2000
- [ ] Template buttons appear for all profiles
- [ ] Clicking template loads content correctly
- [ ] Templates are properly formatted
- [ ] Placeholders are clearly marked with `[brackets]`
- [ ] Textarea expands/contracts appropriately
- [ ] Templates work across all 9 profiles
- [ ] localStorage saves customized content
- [ ] UI is responsive on different screen sizes
