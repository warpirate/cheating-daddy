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
        
        return suggestions;
    }

    /**
     * Check instruction quality
     */
    checkQuality(text) {
        const suggestions = [];
        
        // Check for vague terms
        const vagueTerms = ['some', 'few', 'many', 'several', 'various'];
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
        
        return suggestions;
    }

    /**
     * Initialize profile-specific rules
     */
    initializeProfileRules() {
        return {
            interview: {
                requiredKeywords: ['experience', 'role'],
                keywordReasons: {
                    'experience': 'Helps AI understand your background level',
                    'role': 'Clarifies what position you\'re interviewing for'
                },
                keywordExamples: {
                    'experience': '"5 years of experience in software development"',
                    'role': '"Senior Software Engineer role"'
                }
            },
            sales: {
                requiredKeywords: ['product', 'customer'],
                keywordReasons: {
                    'product': 'What you\'re selling',
                    'customer': 'Who you\'re selling to'
                },
                keywordExamples: {
                    'product': '"SaaS platform for project management"',
                    'customer': '"B2B customers in healthcare"'
                }
            },
            firstday: {
                requiredKeywords: ['company', 'role'],
                keywordReasons: {
                    'company': 'Where you\'re starting',
                    'role': 'Your new position'
                },
                keywordExamples: {
                    'company': '"starting at Google"',
                    'role': '"as a Senior Engineer"'
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
                }
            }
        };
    }
}

// Export singleton instance
const contextAnalyzer = new ContextAnalyzer();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContextAnalyzer, contextAnalyzer };
}
