# Conversation Export - Implementation Plan

## Overview

Allow users to export their conversation history in multiple formats (Markdown, JSON, PDF, TXT) for documentation, review, or sharing purposes.

## User Stories

1. **As a user**, I want to export my interview practice session to review later.
2. **As a user**, I want to share my conversation in a readable format with my team.
3. **As a user**, I want to export in different formats for different use cases.

## Technical Design

### 1. UI Components

#### Location: HistoryView.js

Add export button to each conversation session:

```javascript
// In HistoryView.js render method for each session
<div class="session-actions">
    <button
        class="export-btn"
        @click=${() => this.showExportDialog(session)}
        title="Export conversation"
    >
        📥 Export
    </button>
    <button
        class="delete-btn"
        @click=${() => this.deleteSession(session.sessionId)}
        title="Delete conversation"
    >
        🗑️ Delete
    </button>
</div>
```

#### Export Dialog Component

```javascript
renderExportDialog() {
    if (!this.exportDialogVisible) return '';

    return html`
        <div class="export-dialog-overlay" @click=${this.closeExportDialog}>
            <div class="export-dialog" @click=${(e) => e.stopPropagation()}>
                <h3>Export Conversation</h3>

                <div class="export-info">
                    <p><strong>Session:</strong> ${new Date(this.selectedSession.timestamp).toLocaleString()}</p>
                    <p><strong>Profile:</strong> ${this.getProfileDisplayName(this.selectedSession.profile)}</p>
                    <p><strong>Messages:</strong> ${this.selectedSession.conversationHistory.length} turns</p>
                </div>

                <div class="export-formats">
                    <h4>Select Format:</h4>
                    <button
                        class="format-btn ${this.selectedFormat === 'markdown' ? 'selected' : ''}"
                        @click=${() => this.selectFormat('markdown')}
                    >
                        📝 Markdown (.md)
                        <span class="format-desc">Best for documentation</span>
                    </button>

                    <button
                        class="format-btn ${this.selectedFormat === 'json' ? 'selected' : ''}"
                        @click=${() => this.selectFormat('json')}
                    >
                        📊 JSON (.json)
                        <span class="format-desc">Best for data processing</span>
                    </button>

                    <button
                        class="format-btn ${this.selectedFormat === 'txt' ? 'selected' : ''}"
                        @click=${() => this.selectFormat('txt')}
                    >
                        📄 Plain Text (.txt)
                        <span class="format-desc">Best for simple reading</span>
                    </button>

                    <button
                        class="format-btn ${this.selectedFormat === 'html' ? 'selected' : ''}"
                        @click=${() => this.selectFormat('html')}
                    >
                        🌐 HTML (.html)
                        <span class="format-desc">Best for web viewing</span>
                    </button>
                </div>

                <div class="export-options">
                    <label>
                        <input
                            type="checkbox"
                            .checked=${this.includeTimestamps}
                            @change=${(e) => this.includeTimestamps = e.target.checked}
                        />
                        Include timestamps
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            .checked=${this.includeMetadata}
                            @change=${(e) => this.includeMetadata = e.target.checked}
                        />
                        Include metadata (profile, provider, etc.)
                    </label>
                </div>

                <div class="export-actions">
                    <button class="cancel-btn" @click=${this.closeExportDialog}>
                        Cancel
                    </button>
                    <button class="export-confirm-btn" @click=${this.performExport}>
                        📥 Export
                    </button>
                </div>
            </div>
        </div>
    `;
}
```

### 2. Export Logic

#### Create new file: src/utils/conversationExporter.js

```javascript
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
            markdown += `- **Provider**: ${session.provider || 'Unknown'}\n`;
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
                provider: session.provider || 'unknown',
                messageCount: session.conversationHistory.length,
            },
            conversation: session.conversationHistory.map((turn, index) => ({
                index: index + 1,
                timestamp: turn.timestamp || null,
                user: turn.user || turn.transcription || null,
                ai: turn.ai || turn.response || null,
            })),
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
            text += `- Provider: ${session.provider || 'Unknown'}\n`;
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
                <span class="metadata-label">Provider:</span>
                <span>${session.provider || 'Unknown'}</span>
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

        session.conversationHistory.forEach(turn => {
            const timestamp =
                includeTimestamps && turn.timestamp ? `<span class="timestamp">${new Date(turn.timestamp).toLocaleTimeString()}</span>` : '';

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
            homework: 'Homework',
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
            html: 'text/html',
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

module.exports = { ConversationExporter, conversationExporter };
```

### 3. Integration with HistoryView

```javascript
// In HistoryView.js

import { conversationExporter } from '../utils/conversationExporter.js';

class HistoryView extends LitElement {
    constructor() {
        super();
        // ... existing properties
        this.exportDialogVisible = false;
        this.selectedSession = null;
        this.selectedFormat = 'markdown';
        this.includeTimestamps = true;
        this.includeMetadata = true;
    }

    showExportDialog(session) {
        this.selectedSession = session;
        this.exportDialogVisible = true;
        this.requestUpdate();
    }

    closeExportDialog() {
        this.exportDialogVisible = false;
        this.selectedSession = null;
        this.requestUpdate();
    }

    selectFormat(format) {
        this.selectedFormat = format;
        this.requestUpdate();
    }

    async performExport() {
        if (!this.selectedSession) return;

        try {
            await conversationExporter.export(this.selectedSession, this.selectedFormat, {
                includeTimestamps: this.includeTimestamps,
                includeMetadata: this.includeMetadata,
            });

            // Show success message
            this.showNotification('Conversation exported successfully!', 'success');
            this.closeExportDialog();
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification(`Export failed: ${error.message}`, 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}
```

### 4. CSS Styles

```css
/* Export Dialog */
.export-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.export-dialog {
    background: #1e1e1e;
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.export-dialog h3 {
    margin: 0 0 20px 0;
    color: white;
}

.export-info {
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.export-info p {
    margin: 5px 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
}

.export-formats {
    margin-bottom: 20px;
}

.export-formats h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
}

.format-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 12px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
}

.format-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(0, 122, 255, 0.5);
}

.format-btn.selected {
    background: rgba(0, 122, 255, 0.2);
    border-color: #007aff;
}

.format-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 4px;
}

.export-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.export-options label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
}

.export-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.cancel-btn,
.export-confirm-btn {
    padding: 10px 20px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.cancel-btn:hover {
    background: rgba(255, 255, 255, 0.15);
}

.export-confirm-btn {
    background: #007aff;
    color: white;
}

.export-confirm-btn:hover {
    background: #0051d5;
}

/* Notifications */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    z-index: 2000;
    animation: slideIn 0.3s ease-out;
}

.notification-success {
    background: #34c759;
}

.notification-error {
    background: #ff3b30;
}

.notification.fade-out {
    animation: fadeOut 0.3s ease-out;
}

@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}
```

## Implementation Steps

### Phase 1: Core Export (Day 1)

1. ✅ Create conversationExporter.js utility
2. ✅ Implement Markdown export
3. ✅ Implement JSON export
4. ✅ Implement TXT export
5. ✅ Implement HTML export
6. ✅ Test all formats

### Phase 2: UI Integration (Day 2)

7. ✅ Add export button to HistoryView
8. ✅ Create export dialog component
9. ✅ Add format selection
10. ✅ Add export options (timestamps, metadata)
11. ✅ Test UI flow

### Phase 3: Polish (Day 3)

12. ✅ Add notifications
13. ✅ Add error handling
14. ✅ Add loading states
15. ✅ Style improvements
16. ✅ Cross-browser testing

## Testing Checklist

-   [ ] Export empty conversation
-   [ ] Export conversation with 1 message
-   [ ] Export conversation with 100+ messages
-   [ ] Export in all formats (MD, JSON, TXT, HTML)
-   [ ] Test with/without timestamps
-   [ ] Test with/without metadata
-   [ ] Test filename generation
-   [ ] Test special characters in messages
-   [ ] Test very long messages
-   [ ] Test on different browsers
-   [ ] Test file download works correctly

## Success Metrics

-   Export completes in < 1 second for typical conversations
-   All formats are valid and readable
-   Files open correctly in respective applications
-   Zero data loss during export
-   User satisfaction with feature

## Future Enhancements

1. **PDF Export**: Add PDF generation
2. **Batch Export**: Export multiple conversations at once
3. **Cloud Sync**: Export to Google Drive, Dropbox, etc.
4. **Email Export**: Send conversation via email
5. **Custom Templates**: User-defined export templates
6. **Selective Export**: Export specific messages only
