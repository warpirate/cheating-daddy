/**
 * Conversation Exporter Utility
 * Handles exporting conversations in multiple formats
 */

class ConversationExporter {
    constructor() {
        this.formats = ['markdown', 'json', 'txt', 'html'];
    }

    /**
     * Export conversation to specified format
     * @param {Object} session - Conversation session data
     * @param {string} format - Export format (markdown, json, txt, html)
     * @param {Object} options - Export options
     * @returns {Promise<void>}
     */
    async export(session, format, options = {}) {
        if (!this.formats.includes(format)) {
            throw new Error(`Unsupported format: ${format}`);
        }

        const content = this[`to${this.capitalize(format)}`](session, options);
        const filename = this.generateFilename(session, format);
        
        await this.downloadFile(content, filename, this.getMimeType(format));
    }

    /**
     * Convert to Markdown format
     */
    toMarkdown(session, options = {}) {
        const { includeTimestamps = true, includeMetadata = true } = options;
        
        let markdown = `# Conversation Export\n\n`;
        
        // Metadata
        if (includeMetadata) {
            markdown += `## Session Information\n\n`;
            markdown += `- **Date**: ${new Date(session.timestamp).toLocaleString()}\n`;
            markdown += `- **Profile**: ${this.getProfileDisplayName(session.profile)}\n`;
            markdown += `- **Messages**: ${session.conversationHistory.length} turns\n`;
            markdown += `- **Session ID**: ${session.sessionId}\n\n`;
            markdown += `---\n\n`;
        }
        
        // Conversation
        markdown += `## Conversation\n\n`;
        
        session.conversationHistory.forEach((turn, index) => {
            if (includeTimestamps && turn.timestamp) {
                markdown += `*${new Date(turn.timestamp).toLocaleTimeString()}*\n\n`;
            }
            
            // User message
            markdown += `### 👤 User\n\n`;
            markdown += `${turn.user || turn.transcription || '[No message]'}\n\n`;
            
            // AI response
            markdown += `### 🤖 AI Assistant\n\n`;
            markdown += `${turn.ai || turn.response || '[No response]'}\n\n`;
            
            if (index < session.conversationHistory.length - 1) {
                markdown += `---\n\n`;
            }
        });
        
        // Footer
        markdown += `\n---\n\n`;
        markdown += `*Exported from MeharNolan on ${new Date().toLocaleString()}*\n`;
        
        return markdown;
    }

    /**
     * Convert to JSON format
     */
    toJson(session, options = {}) {
        const { includeMetadata = true } = options;
        
        const exportData = {
            exportedAt: new Date().toISOString(),
            session: {
                id: session.sessionId,
                timestamp: session.timestamp,
                date: new Date(session.timestamp).toISOString(),
                profile: session.profile,
                messageCount: session.conversationHistory.length
            },
            conversation: session.conversationHistory.map((turn, index) => ({
                index: index + 1,
                timestamp: turn.timestamp || null,
                user: turn.user || turn.transcription || null,
                ai: turn.ai || turn.response || null
            }))
        };
        
        if (!includeMetadata) {
            delete exportData.session;
        }
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Convert to plain text format
     */
    toTxt(session, options = {}) {
        const { includeTimestamps = true, includeMetadata = true } = options;
        
        let text = `CONVERSATION EXPORT\n`;
        text += `${'='.repeat(50)}\n\n`;
        
        // Metadata
        if (includeMetadata) {
            text += `Session Information:\n`;
            text += `- Date: ${new Date(session.timestamp).toLocaleString()}\n`;
            text += `- Profile: ${this.getProfileDisplayName(session.profile)}\n`;
            text += `- Messages: ${session.conversationHistory.length} turns\n`;
            text += `- Session ID: ${session.sessionId}\n\n`;
            text += `${'-'.repeat(50)}\n\n`;
        }
        
        // Conversation
        session.conversationHistory.forEach((turn, index) => {
            if (includeTimestamps && turn.timestamp) {
                text += `[${new Date(turn.timestamp).toLocaleTimeString()}]\n`;
            }
            
            text += `USER:\n`;
            text += `${turn.user || turn.transcription || '[No message]'}\n\n`;
            
            text += `AI ASSISTANT:\n`;
            text += `${turn.ai || turn.response || '[No response]'}\n\n`;
            
            if (index < session.conversationHistory.length - 1) {
                text += `${'-'.repeat(50)}\n\n`;
            }
        });
        
        // Footer
        text += `\n${'='.repeat(50)}\n`;
        text += `Exported from MeharNolan on ${new Date().toLocaleString()}\n`;
        
        return text;
    }

    /**
     * Convert to HTML format
     */
    toHtml(session, options = {}) {
        const { includeTimestamps = true, includeMetadata = true } = options;
        
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conversation Export - ${new Date(session.timestamp).toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0 0 15px 0;
            color: #007aff;
        }
        .metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            font-size: 14px;
        }
        .metadata-item {
            display: flex;
            gap: 5px;
        }
        .metadata-label {
            font-weight: bold;
            color: #666;
        }
        .conversation {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .message {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .message-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .user-icon { color: #007aff; }
        .ai-icon { color: #34c759; }
        .timestamp {
            font-size: 12px;
            color: #999;
            margin-left: auto;
        }
        .message-content {
            line-height: 1.6;
            white-space: pre-wrap;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📝 Conversation Export</h1>`;
        
        if (includeMetadata) {
            html += `
        <div class="metadata">
            <div class="metadata-item">
                <span class="metadata-label">Date:</span>
                <span>${new Date(session.timestamp).toLocaleString()}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Profile:</span>
                <span>${this.getProfileDisplayName(session.profile)}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Messages:</span>
                <span>${session.conversationHistory.length} turns</span>
            </div>
        </div>`;
        }
        
        html += `
    </div>
    
    <div class="conversation">`;
        
        session.conversationHistory.forEach((turn) => {
            const timestamp = includeTimestamps && turn.timestamp 
                ? `<span class="timestamp">${new Date(turn.timestamp).toLocaleTimeString()}</span>`
                : '';
            
            html += `
        <div class="message">
            <div class="message-header">
                <span class="user-icon">👤</span>
                <span>User</span>
                ${timestamp}
            </div>
            <div class="message-content">${this.escapeHtml(turn.user || turn.transcription || '[No message]')}</div>
        </div>
        
        <div class="message">
            <div class="message-header">
                <span class="ai-icon">🤖</span>
                <span>AI Assistant</span>
            </div>
            <div class="message-content">${this.escapeHtml(turn.ai || turn.response || '[No response]')}</div>
        </div>`;
        });
        
        html += `
    </div>
    
    <div class="footer">
        Exported from MeharNolan on ${new Date().toLocaleString()}
    </div>
</body>
</html>`;
        
        return html;
    }

    /**
     * Helper methods
     */
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getProfileDisplayName(profile) {
        const names = {
            interview: 'Job Interview',
            sales: 'Sales Call',
            meeting: 'Meeting',
            presentation: 'Presentation',
            negotiation: 'Negotiation',
            firstday: 'First Day Work',
            exam: 'Exam',
            test: 'Online Test',
            homework: 'Homework'
        };
        return names[profile] || profile;
    }

    generateFilename(session, format) {
        const date = new Date(session.timestamp);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        const profile = session.profile || 'conversation';
        
        return `${profile}-${dateStr}-${timeStr}.${format}`;
    }

    getMimeType(format) {
        const mimeTypes = {
            markdown: 'text/markdown',
            json: 'application/json',
            txt: 'text/plain',
            html: 'text/html'
        };
        return mimeTypes[format] || 'text/plain';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

// Export singleton instance
const conversationExporter = new ConversationExporter();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConversationExporter, conversationExporter };
}
