# Template UI Guide

## Visual Layout

### Before (Old UI)
```
┌─────────────────────────────────────────────────────┐
│ Custom AI Instructions                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Empty textarea - users must write from scratch]  │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
Personalize the AI's behavior with specific instructions...
```

### After (New UI with Templates)
```
┌─────────────────────────────────────────────────────┐
│ Custom AI Instructions          245 / 2000 chars ◄──┐ Character Counter
├─────────────────────────────────────────────────────┤
│ Quick Templates: [Software Engineer] [Product Mgr] │ ◄── Template Buttons
│                  [Generic Template]                 │
├─────────────────────────────────────────────────────┤
│ I'm interviewing for a Senior Software Engineer... │
│                                                     │
│ Key Details:                                        │
│ - 5+ years experience with React, Node.js...       │
│                                                     │
│ [Larger textarea with monospace font]              │
└─────────────────────────────────────────────────────┘
Personalize the AI's behavior... Use templates above as
a starting point and customize them for your situation.
```

## Interactive Elements

### 1. Template Buttons
```
┌──────────────────┐
│ Software Engineer │ ◄── Hover: Slight lift + color change
└──────────────────┘
     │
     │ Click
     ▼
Template content loads into textarea instantly
```

**States**:
- **Default**: Blue background (rgba(0, 122, 255, 0.15))
- **Hover**: Brighter blue + lift effect
- **Active**: Pressed down effect

### 2. Character Counter
```
245 / 2000 characters
 │      │
 │      └── Maximum allowed
 └── Current count (updates live)
```

**Behavior**:
- Updates on every keystroke
- No color change (stays neutral)
- Helps users self-regulate

### 3. Textarea
```
┌─────────────────────────────────────────┐
│ I'm interviewing for a [Job Title]...   │ ◄── Monospace font
│                                         │
│ My Background:                          │
│ - [Years] of experience in [field]      │ ◄── Structured format
│                                         │
│ [Cursor here - ready to customize]     │
└─────────────────────────────────────────┘
```

**Features**:
- 6 rows (increased from 4)
- Monospace font for better readability
- Hard limit at 2000 characters
- Smooth focus/hover states

## User Flow

### Scenario: User wants to prepare for an interview

```
Step 1: Select Profile
┌─────────────────────────┐
│ Profile Type            │
│ ▼ Job Interview         │ ◄── User selects
└─────────────────────────┘

Step 2: See Templates Appear
┌─────────────────────────────────────────────────┐
│ Quick Templates: [Software Engineer] [Product  │
│                  Manager] [Generic Template]    │
└─────────────────────────────────────────────────┘
                    │
                    │ User clicks "Software Engineer"
                    ▼

Step 3: Template Loads
┌─────────────────────────────────────────────────┐
│ I'm interviewing for a Senior Software          │
│ Engineer role at [Company Name].                │
│                                                 │
│ Key Details:                                    │
│ - 5+ years experience with React, Node.js...   │
│ - Led a team of 3 developers...                │
│ - Built a microservices architecture...        │
│                                                 │
│ Company Info:                                   │
│ - [Company] is a [industry] company...         │
└─────────────────────────────────────────────────┘
                    │
                    │ User customizes
                    ▼

Step 4: Customize Template
┌─────────────────────────────────────────────────┐
│ I'm interviewing for a Senior Software          │
│ Engineer role at Netflix.                       │ ◄── Replaced [Company Name]
│                                                 │
│ Key Details:                                    │
│ - 7 years experience with React, TypeScript... │ ◄── Updated experience
│ - Led a team of 5 developers at Spotify...     │ ◄── Added specifics
│ - Built a microservices architecture handling  │
│   2M+ requests/day...                           │ ◄── Added metrics
│                                                 │
│ Company Info:                                   │
│ - Netflix is a streaming company focused on... │ ◄── Filled in details
└─────────────────────────────────────────────────┘
                    │
                    │ Character counter: 487 / 2000
                    ▼

Step 5: Save & Use
Instructions automatically saved to localStorage
Ready to use in AI session
```

## Profile-Specific Template Examples

### Interview Profile
```
Quick Templates: [Software Engineer] [Product Manager] [Generic Template]
                      ▲                  ▲                    ▲
                      │                  │                    │
                   Tech role      Non-tech role        Any role
```

### Sales Profile
```
Quick Templates: [SaaS Sales] [Generic Sales]
                      ▲              ▲
                      │              │
              Software sales    Any product
```

### Homework Profile
```
Quick Templates: [Programming] [Essay/Research] [Math/Science]
                      ▲              ▲                ▲
                      │              │                │
                  Code work     Writing work    Problem sets
```

## Responsive Behavior

### Desktop (> 600px)
```
┌────────────────────────────────────────────────────────┐
│ Quick Templates: [Btn1] [Btn2] [Btn3]                  │ ◄── All in one row
└────────────────────────────────────────────────────────┘
```

### Mobile (< 600px)
```
┌──────────────────────────┐
│ Quick Templates:         │
│ [Btn1] [Btn2]            │ ◄── Wraps to multiple rows
│ [Btn3]                   │
└──────────────────────────┘
```

## Color Scheme

### Light Mode (if implemented)
- Template buttons: Blue (#007aff)
- Character counter: Gray (#666)
- Textarea border: Light gray (#ddd)

### Dark Mode (current)
- Template buttons: Blue with transparency
- Character counter: Light gray (rgba(255,255,255,0.5))
- Textarea border: White with transparency

## Accessibility

### Keyboard Navigation
```
Tab → Focus on first template button
Tab → Focus on second template button
Tab → Focus on third template button
Tab → Focus on textarea
```

### Screen Readers
- Template buttons: "Load Software Engineer template"
- Character counter: "245 of 2000 characters used"
- Textarea: "Custom AI Instructions, 245 of 2000 characters"

## Edge Cases Handled

### 1. Character Limit Reached
```
User types: "This is my very long instruction..."
Counter shows: 2000 / 2000 characters
User tries to type more: ❌ Blocked by maxlength
```

### 2. Loading Template Over Existing Content
```
Current content: "My custom instructions..."
User clicks template: ✓ Replaces entirely (no confirmation)
Rationale: Templates are starting points, not additions
```

### 3. Profile Without Templates
```
If profile has no templates:
- Template buttons section doesn't render
- Only textarea and counter shown
- No visual gap or empty space
```

### 4. Very Long Template
```
Template length: 1800 characters
Loads successfully: ✓
Counter shows: 1800 / 2000 characters
User has 200 chars to customize: ✓
```

## Performance Considerations

### Real-time Counter Updates
- Uses `requestUpdate()` for efficient re-rendering
- Only updates counter, not entire component
- No noticeable lag even with rapid typing

### Template Loading
- Instant load (no API calls)
- Templates stored in component method
- No network latency

### LocalStorage
- Saves on every keystroke
- Minimal performance impact
- Persists across sessions

## Future UI Enhancements

### Potential Additions
1. **Template Preview Tooltip**
   ```
   [Software Engineer] ◄── Hover shows first 3 lines
   ┌─────────────────────────────────┐
   │ I'm interviewing for a Senior   │
   │ Software Engineer role at...    │
   │ Key Details:                    │
   └─────────────────────────────────┘
   ```

2. **Copy Template Button**
   ```
   [Software Engineer] [📋 Copy]
   ```

3. **Template Search**
   ```
   🔍 Search templates...
   [Matching templates appear]
   ```

4. **Custom Template Save**
   ```
   [Save as Template] ◄── Save user's custom version
   ```

5. **Template Rating**
   ```
   [Software Engineer] ⭐⭐⭐⭐⭐ (4.8)
   ```

## Comparison with Other Apps

### ChatGPT Custom Instructions
- No templates (blank textarea)
- No character counter
- No profile-specific guidance
- **Our advantage**: Templates + profiles

### Claude Projects
- Project-specific instructions
- No templates
- Longer character limit
- **Our advantage**: Quick templates for common scenarios

### Copilot
- No custom instructions UI
- Settings-based configuration
- **Our advantage**: Visual, user-friendly interface
