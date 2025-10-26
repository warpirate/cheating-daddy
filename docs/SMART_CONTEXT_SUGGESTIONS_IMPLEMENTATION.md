# Smart Context Suggestions - Implementation Plan

## Overview
Analyze user's custom instructions in real-time and provide intelligent suggestions to improve AI response quality. Help users write better context by identifying missing information, placeholders, and opportunities for enhancement.

## User Stories

1. **As a user**, I want to know if I've left placeholders in my instructions.
2. **As a user**, I want suggestions on what additional context would improve AI responses.
3. **As a user**, I want to know if my instructions are too short or too long.
4. **As a user**, I want profile-specific suggestions based on best practices.

## Technical Design

### 1. UI Components

#### Location: CustomizeView.js
Add suggestions panel below the textarea:

```javascript
// In CustomizeView.js render method
<div class="custom-prompt-section">
    <label>
        Custom AI Instructions
        <span class="char-counter">${currentLength} / 2000 characters</span>
    </label>
    
    <!-- Template buttons -->
    ${this.renderTemplateButtons()}
    
    <!-- Textarea -->
    <textarea
        class="custom-prompt-textarea"
        .value=${customPrompt}
        @input=${this.handleCustomPromptInput}
        @blur=${this.analyzeSuggestions}
        placeholder="..."
        rows="6"
        maxlength="2000"
    ></textarea>
    
    <!-- Smart Suggestions Panel -->
    ${this.renderSmartSuggestions()}
</div>
```

### 2. Suggestions Panel Component

```javascript
renderSmartSuggestions() {
    if (!this.suggestions || this.suggestions.length === 0) {
        return '';
    }
    
    return html`
        <div class="suggestions-panel">
            <div class="suggestions-header">
                <span class="suggestions-icon">💡</span>
                <span class="suggestions-title">Smart Suggestions</span>
                <button 
                    class="dismiss-btn" 
                    @click=${this.dismissSuggestions}
                    title="Dismiss suggestions"
                >
                    ✕
                </button>
            </div>
            
            <div class="suggestions-list">
                ${this.suggestions.map(suggestion => this.renderSuggestion(suggestion))}
            </div>
            
            ${this.suggestions.some(s => s.autoFix) ? html`
                <div class="suggestions-actions">
                    <button 
                        class="apply-all-btn"
                        @click=${this.applyAllFixes}
                    >
                        ✨ Apply All Fixes
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

renderSuggestion(suggestion) {
    const iconMap = {
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        tip: '💡',
        success: '✅'
    };
    
    return html`
        <div class="suggestion-item suggestion-${suggestion.type}">
            <div class="suggestion-icon">${iconMap[suggestion.type]}</div>
            <div class="suggestion-content">
                <div class="suggestion-message">${suggestion.message}</div>
                ${suggestion.details ? html`
                    <div class="suggestion-details">${suggestion.details}</div>
                ` : ''}
                ${suggestion.example ? html`
                    <div class="suggestion-example">
                        <strong>Example:</strong> ${suggestion.example}
                    </div>
                ` : ''}
                ${suggestion.autoFix ? html`
                    <button 
                        class="fix-btn"
                        @click=${() => this.applyFix(suggestion)}
                    >
                        🔧 Fix This
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}
```

### 3. Analysis Engine

#### Create new file: src/utils/contextAnalyzer.js

```javascript
/**
 * Smart Context Analyzer
 * Analyzes custom instructions and provides intelligent suggestions
 */

class ContextAnalyzer {
    constructor() {
        this.profileRules = this.initializeProfileRules();
    }

    /**
     * Analyze custom instructions and return suggestions
     * @param {string} text - Custom instructions text
     * @param {string} profile - Current profile
     * @returns {Array} Array of suggestion objects
     */
    analyze(text, profile) {
        const suggestions = [];
        
        // Run all analysis checks
        suggestions.push(...this.checkPlaceholders(text));
        suggestions.push(...this.checkLength(text));
        suggestions.push(...this.checkProfileSpecific(text, profile));
        suggestions.push(...this.checkStructure(text));
        suggestions.push(...this.checkQuality(text));
        suggestions.push(...this.checkCommonMistakes(text));
        
        // Sort by priority (error > warning > info > tip)
        const priorityOrder = { error: 0, warning: 1, info: 2, tip: 3, success: 4 };
        suggestions.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
        
        return suggestions;
    }

    /**
     * Check for unreplaced placeholders
     */
    checkPlaceholders(text) {
        const suggestions = [];
        const placeholderRegex = /\[([^\]]+)\]/g;
        const placeholders = [];
        let match;
        
        while ((match = placeholderRegex.exec(text)) !== null) {
            placeholders.push(match[1]);
        }
        
        if (placeholders.length > 0) {
            suggestions.push({
                type: 'warning',
                message: `Found ${placeholders.length} placeholder${placeholders.length > 1 ? 's' : ''} that should be replaced`,
                details: `Placeholders: ${placeholders.slice(0, 5).join(', ')}${placeholders.length > 5 ? '...' : ''}`,
                example: `Replace [Company Name] with "Netflix", [Years] with "7", etc.`,
                autoFix: false,
                placeholders: placeholders
            });
        }
        
        return suggestions;
    }

    /**
     * Check instruction length
     */
    checkLength(text) {
        const suggestions = [];
        const length = text.trim().length;
        
        if (length === 0) {
            suggestions.push({
                type: 'error',
                message: 'Custom instructions are empty',
                details: 'Add context about your situation to get better AI responses',
                example: 'Try using a template as a starting point',
                autoFix: false
            });
        } else if (length < 100) {
            suggestions.push({
                type: 'info',
                message: 'Instructions are quite short',
                details: 'Consider adding more context for better AI responses',
                example: 'Add details about your background, goals, or specific situation',
                autoFix: false
            });
        } else if (length > 1800) {
            suggestions.push({
                type: 'warning',
                message: 'Instructions are very long',
                details: 'Consider focusing on the most important information',
                example: 'Remove redundant details and keep it concise',
                autoFix: false
            });
        } else if (length >= 100 && length <= 1500) {
            suggestions.push({
                type: 'success',
                message: 'Good length! Your instructions are detailed but concise',
                autoFix: false
            });
        }
        
        return suggestions;
    }

    /**
     * Check profile-specific requirements
     */
    checkProfileSpecific(text, profile) {
        const suggestions = [];
        const rules = this.profileRules[profile];
        
        if (!rules) return suggestions;
        
        const lowerText = text.toLowerCase();
        
        // Check required keywords
        rules.requiredKeywords?.forEach(keyword => {
            if (!lowerText.includes(keyword.toLowerCase())) {
                suggestions.push({
                    type: 'tip',
                    message: `Consider adding "${keyword}" information`,
                    details: rules.keywordReasons[keyword],
                    example: rules.keywordExamples[keyword],
                    autoFix: false
                });
            }
        });
        
        // Check recommended sections
        rules.recommendedSections?.forEach(section => {
            if (!lowerText.includes(section.toLowerCase())) {
                suggestions.push({
                    type: 'info',
                    message: `Consider adding a "${section}" section`,
                    details: rules.sectionReasons[section],
                    autoFix: false
                });
            }
        });
        
        return suggestions;
    }

    /**
     * Check instruction structure
     */
    checkStructure(text) {
        const suggestions = [];
        
        // Check for bullet points or structure
        const hasBullets = /[-•*]\s/.test(text);
        const hasNumbers = /\d+\.\s/.test(text);
        const hasStructure = hasBullets || hasNumbers;
        
        if (text.length > 200 && !hasStructure) {
            suggestions.push({
                type: 'tip',
                message: 'Consider using bullet points or numbered lists',
                details: 'Structured information is easier for AI to parse',
                example: 'Use "- " or "1. " to create lists',
                autoFix: false
            });
        }
        
        // Check for sections
        const hasSections = /^[A-Z][^:]+:/m.test(text);
        if (text.length > 300 && !hasSections) {
            suggestions.push({
                type: 'tip',
                message: 'Consider organizing with section headers',
                details: 'Sections like "Background:", "Goals:", etc. improve clarity',
                example: 'Background:\n- Your experience\n\nGoals:\n- What you want to achieve',
                autoFix: false
            });
        }
        
        return suggestions;
    }

    /**
     * Check instruction quality
     */
    checkQuality(text) {
        const suggestions = [];
        
        // Check for vague terms
        const vagueTerms = ['some', 'few', 'many', 'several', 'various', 'stuff', 'things'];
        const foundVague = vagueTerms.filter(term => 
            new RegExp(`\\b${term}\\b`, 'i').test(text)
        );
        
        if (foundVague.length > 0) {
            suggestions.push({
                type: 'tip',
                message: 'Consider being more specific',
                details: `Found vague terms: ${foundVague.join(', ')}`,
                example: 'Replace "several years" with "7 years", "many projects" with "15+ projects"',
                autoFix: false
            });
        }
        
        // Check for specific numbers/metrics
        const hasNumbers = /\d+/.test(text);
        if (text.length > 200 && !hasNumbers) {
            suggestions.push({
                type: 'tip',
                message: 'Consider adding specific numbers or metrics',
                details: 'Quantifiable information helps AI provide more relevant responses',
                example: 'Add years of experience, team sizes, project counts, etc.',
                autoFix: false
            });
        }
        
        return suggestions;
    }

    /**
     * Check for common mistakes
     */
    checkCommonMistakes(text) {
        const suggestions = [];
        
        // Check for second person (should be first person)
        if (/\byou\b/i.test(text) && !/\byour\b/i.test(text)) {
            suggestions.push({
                type: 'warning',
                message: 'Instructions should be in first person',
                details: 'Write as "I" not "you" - these are YOUR instructions',
                example: 'Change "You are a developer" to "I am a developer"',
                autoFix: false
            });
        }
        
        // Check for instruction-like language
        const instructionWords = ['tell the ai', 'make the ai', 'ai should', 'assistant should'];
        const hasInstructions = instructionWords.some(word => 
            text.toLowerCase().includes(word)
        );
        
        if (hasInstructions) {
            suggestions.push({
                type: 'info',
                message: 'Write context, not instructions',
                details: 'Describe your situation rather than telling the AI what to do',
                example: 'Instead of "Tell the AI I\'m a developer", write "I\'m a developer with..."',
                autoFix: false
            });
        }
        
        // Check for excessive capitalization
        const capsWords = text.match(/\b[A-Z]{3,}\b/g);
        if (capsWords && capsWords.length > 3) {
            suggestions.push({
                type: 'tip',
                message: 'Avoid excessive capitalization',
                details: 'Use normal capitalization for better readability',
                autoFix: false
            });
        }
        
        return suggestions;
    }

    /**
     * Initialize profile-specific rules
     */
    initializeProfileRules() {
        return {
            interview: {
                requiredKeywords: ['experience', 'role', 'company'],
                keywordReasons: {
                    'experience': 'Helps AI understand your background level',
                    'role': 'Clarifies what position you\'re interviewing for',
                    'company': 'Provides context about the organization'
                },
                keywordExamples: {
                    'experience': '"5 years of experience in software development"',
                    'role': '"Senior Software Engineer role"',
                    'company': '"at Netflix" or "at a fintech startup"'
                },
                recommendedSections: ['Background', 'Skills', 'Goals'],
                sectionReasons: {
                    'Background': 'Your professional history and experience',
                    'Skills': 'Technical and soft skills relevant to the role',
                    'Goals': 'What you want to achieve or emphasize'
                }
            },
            sales: {
                requiredKeywords: ['product', 'customer', 'value'],
                keywordReasons: {
                    'product': 'What you\'re selling',
                    'customer': 'Who you\'re selling to',
                    'value': 'Why they should buy'
                },
                keywordExamples: {
                    'product': '"SaaS platform for project management"',
                    'customer': '"B2B customers in healthcare"',
                    'value': '"reduces costs by 30%"'
                },
                recommendedSections: ['Product', 'Target Customer', 'Value Proposition'],
                sectionReasons: {
                    'Product': 'What you\'re selling and its features',
                    'Target Customer': 'Who your ideal customer is',
                    'Value Proposition': 'Why customers should choose you'
                }
            },
            firstday: {
                requiredKeywords: ['company', 'role', 'background'],
                keywordReasons: {
                    'company': 'Where you\'re starting',
                    'role': 'Your new position',
                    'background': 'Your relevant experience'
                },
                keywordExamples: {
                    'company': '"starting at Google"',
                    'role': '"as a Senior Engineer"',
                    'background': '"7 years in cloud infrastructure"'
                },
                recommendedSections: ['About Me', 'About This Role', 'My Personality'],
                sectionReasons: {
                    'About Me': 'Your background and experience',
                    'About This Role': 'Details about your new position',
                    'My Personality': 'How you want to come across'
                }
            },
            exam: {
                requiredKeywords: ['subject', 'topics'],
                keywordReasons: {
                    'subject': 'What exam you\'re taking',
                    'topics': 'What will be covered'
                },
                keywordExamples: {
                    'subject': '"Computer Science exam"',
                    'topics': '"data structures, algorithms, databases"'
                },
                recommendedSections: ['Subject', 'Topics', 'Format'],
                sectionReasons: {
                    'Subject': 'The exam subject or course',
                    'Topics': 'Specific topics that will be tested',
                    'Format': 'Multiple choice, essay, coding, etc.'
                }
            },
            homework: {
                requiredKeywords: ['assignment', 'subject'],
                keywordReasons: {
                    'assignment': 'What you need to complete',
                    'subject': 'The course or topic'
                },
                keywordExamples: {
                    'assignment': '"programming assignment on binary trees"',
                    'subject': '"Data Structures course"'
                },
                recommendedSections: ['Assignment', 'Requirements', 'Context'],
                sectionReasons: {
                    'Assignment': 'What you need to complete',
                    'Requirements': 'Specific requirements or constraints',
                    'Context': 'Course context or learning objectives'
                }
            }
        };
    }

    /**
     * Generate auto-fix for a suggestion
     */
    generateAutoFix(suggestion, text) {
        // This would contain logic to automatically fix issues
        // For now, most suggestions don't have auto-fix
        return null;
    }
}

// Export singleton instance
const contextAnalyzer = new ContextAnalyzer();

module.exports = { ContextAnalyzer, contextAnalyzer };
```

### 4. Integration with CustomizeView

```javascript
// In CustomizeView.js

import { contextAnalyzer } from '../utils/contextAnalyzer.js';

class CustomizeView extends LitElement {
    constructor() {
        super();
        // ... existing properties
        this.suggestions = [];
        this.showSuggestions = true;
        this.analysisDebounceTimer = null;
    }

    handleCustomPromptInput(e) {
        const maxLength = 2000;
        let value = e.target.value;
        
        if (value.length > maxLength) {
            value = value.substring(0, maxLength);
            e.target.value = value;
        }
        
        localStorage.setItem('customPrompt', value);
        
        // Debounce analysis
        if (this.analysisDebounceTimer) {
            clearTimeout(this.analysisDebounceTimer);
        }
        
        this.analysisDebounceTimer = setTimeout(() => {
            this.analyzeSuggestions();
        }, 1000); // Analyze 1 second after user stops typing
        
        this.requestUpdate();
    }

    analyzeSuggestions() {
        const customPrompt = localStorage.getItem('customPrompt') || '';
        const profile = localStorage.getItem('selectedProfile') || 'interview';
        
        if (!this.showSuggestions) {
            this.suggestions = [];
            return;
        }
        
        // Run analysis
        this.suggestions = contextAnalyzer.analyze(customPrompt, profile);
        this.requestUpdate();
        
        console.log('📊 Context analysis complete:', this.suggestions.length, 'suggestions');
    }

    dismissSuggestions() {
        this.showSuggestions = false;
        this.suggestions = [];
        this.requestUpdate();
    }

    applyFix(suggestion) {
        // Apply individual fix
        if (suggestion.autoFix) {
            const customPrompt = localStorage.getItem('customPrompt') || '';
            const fixed = contextAnalyzer.generateAutoFix(suggestion, customPrompt);
            
            if (fixed) {
                localStorage.setItem('customPrompt', fixed);
                this.analyzeSuggestions();
                this.requestUpdate();
            }
        }
    }

    applyAllFixes() {
        // Apply all auto-fixable suggestions
        const fixableSuggestions = this.suggestions.filter(s => s.autoFix);
        
        if (fixableSuggestions.length === 0) return;
        
        let customPrompt = localStorage.getItem('customPrompt') || '';
        
        fixableSuggestions.forEach(suggestion => {
            const fixed = contextAnalyzer.generateAutoFix(suggestion, customPrompt);
            if (fixed) {
                customPrompt = fixed;
            }
        });
        
        localStorage.setItem('customPrompt', customPrompt);
        this.analyzeSuggestions();
        this.requestUpdate();
    }
}
```

### 5. CSS Styles

```css
/* Suggestions Panel */
.suggestions-panel {
    margin-top: 15px;
    background: rgba(0, 122, 255, 0.1);
    border: 1px solid rgba(0, 122, 255, 0.3);
    border-radius: 8px;
    padding: 15px;
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.suggestions-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.suggestions-icon {
    font-size: 18px;
}

.suggestions-title {
    flex: 1;
    font-weight: 600;
    color: white;
    font-size: 14px;
}

.dismiss-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.dismiss-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.suggestion-item {
    display: flex;
    gap: 10px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    border-left: 3px solid;
}

.suggestion-error {
    border-left-color: #ff3b30;
}

.suggestion-warning {
    border-left-color: #ff9500;
}

.suggestion-info {
    border-left-color: #007aff;
}

.suggestion-tip {
    border-left-color: #34c759;
}

.suggestion-success {
    border-left-color: #34c759;
}

.suggestion-icon {
    font-size: 16px;
    flex-shrink: 0;
}

.suggestion-content {
    flex: 1;
    font-size: 13px;
}

.suggestion-message {
    color: white;
    font-weight: 500;
    margin-bottom: 4px;
}

.suggestion-details {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4px;
}

.suggestion-example {
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    font-size: 12px;
    margin-top: 6px;
}

.fix-btn {
    margin-top: 8px;
    padding: 6px 12px;
    background: rgba(0, 122, 255, 0.2);
    border: 1px solid rgba(0, 122, 255, 0.4);
    border-radius: 4px;
    color: white;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.fix-btn:hover {
    background: rgba(0, 122, 255, 0.3);
    border-color: rgba(0, 122, 255, 0.6);
}

.suggestions-actions {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: flex-end;
}

.apply-all-btn {
    padding: 8px 16px;
    background: #007aff;
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.apply-all-btn:hover {
    background: #0051d5;
}
```

## Implementation Steps

### Phase 1: Core Analysis (Day 1-2)
1. ✅ Create contextAnalyzer.js utility
2. ✅ Implement placeholder detection
3. ✅ Implement length checking
4. ✅ Implement structure analysis
5. ✅ Implement quality checks
6. ✅ Test analysis engine

### Phase 2: Profile Rules (Day 2-3)
7. ✅ Define rules for all profiles
8. ✅ Implement profile-specific checks
9. ✅ Add keyword detection
10. ✅ Add section recommendations
11. ✅ Test profile rules

### Phase 3: UI Integration (Day 3-4)
12. ✅ Add suggestions panel to CustomizeView
13. ✅ Implement real-time analysis
14. ✅ Add debouncing
15. ✅ Style suggestions panel
16. ✅ Test UI integration

### Phase 4: Polish (Day 4-5)
17. ✅ Add animations
18. ✅ Improve suggestion messages
19. ✅ Add examples to suggestions
20. ✅ Test edge cases
21. ✅ Performance optimization

## Testing Checklist

- [ ] Empty instructions
- [ ] Very short instructions (< 100 chars)
- [ ] Very long instructions (> 1800 chars)
- [ ] Instructions with placeholders
- [ ] Instructions without structure
- [ ] Instructions with vague terms
- [ ] Instructions in second person
- [ ] Test all profiles
- [ ] Test debouncing
- [ ] Test dismiss functionality
- [ ] Test performance with rapid typing

## Success Metrics

- Analysis completes in < 100ms
- Suggestions are relevant and helpful
- Users act on at least 30% of suggestions
- Improved custom instruction quality
- Reduced placeholder usage
- User satisfaction with feature

## Future Enhancements

1. **Auto-fix**: Implement automatic fixes for common issues
2. **Learning**: Learn from user behavior to improve suggestions
3. **AI-powered**: Use AI to generate context suggestions
4. **Templates**: Suggest relevant templates based on content
5. **Comparison**: Compare with successful examples
6. **Scoring**: Give overall quality score
7. **History**: Track improvement over time
