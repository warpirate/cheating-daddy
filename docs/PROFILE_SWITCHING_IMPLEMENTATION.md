# Profile Switching Mid-Session - Implementation Plan

## Overview
Allow users to switch between profiles (Interview, Sales, Meeting, etc.) during an active session without losing conversation history or restarting the application.

## User Stories

1. **As a user**, I want to switch from Interview mode to Sales mode mid-conversation so I can handle different scenarios without restarting.
2. **As a user**, I want my conversation history to be preserved when switching profiles.
3. **As a user**, I want the AI to adapt to the new profile immediately after switching.

## Technical Design

### 1. UI Components

#### Location: AssistantView.js
Add a profile switcher dropdown in the active session view:

```javascript
// In AssistantView.js render method
<div class="profile-switcher">
    <label>Active Profile:</label>
    <select 
        .value=${this.currentProfile} 
        @change=${this.handleProfileSwitch}
        ?disabled=${!this.isSessionActive}
    >
        <option value="interview">💼 Job Interview</option>
        <option value="sales">💰 Sales Call</option>
        <option value="meeting">🤝 Meeting</option>
        <option value="presentation">🎤 Presentation</option>
        <option value="negotiation">🤝 Negotiation</option>
        <option value="firstday">👋 First Day Work</option>
        <option value="exam">📝 Exam</option>
        <option value="test">⚡ Online Test</option>
        <option value="homework">📚 Homework</option>
    </select>
    ${this.isSwitchingProfile ? html`<span class="switching-indicator">Switching...</span>` : ''}
</div>
```

### 2. State Management

#### New Properties in AssistantView.js
```javascript
constructor() {
    super();
    this.currentProfile = 'interview';
    this.isSwitchingProfile = false;
    this.conversationBeforeSwitch = [];
}
```

### 3. Profile Switch Handler

```javascript
async handleProfileSwitch(e) {
    const newProfile = e.target.value;
    
    if (newProfile === this.currentProfile) {
        return;
    }
    
    // Confirm switch if conversation exists
    if (this.conversationHistory.length > 0) {
        const confirmed = confirm(
            `Switch to ${this.getProfileDisplayName(newProfile)}?\n\n` +
            `Your conversation history will be preserved, but the AI will ` +
            `respond according to the new profile.`
        );
        
        if (!confirmed) {
            e.target.value = this.currentProfile; // Revert selection
            return;
        }
    }
    
    this.isSwitchingProfile = true;
    this.requestUpdate();
    
    try {
        // 1. Save current conversation with profile metadata
        await this.saveConversationWithProfile(this.currentProfile);
        
        // 2. Close current LLM session gracefully
        await ipcRenderer.invoke('close-llm-session');
        
        // 3. Update profile
        const oldProfile = this.currentProfile;
        this.currentProfile = newProfile;
        localStorage.setItem('selectedProfile', newProfile);
        
        // 4. Reinitialize LLM with new profile
        const language = localStorage.getItem('selectedLanguage') || 'en-US';
        await cheddar.initializeLLM(newProfile, language);
        
        // 5. Send context message to AI about the switch
        const contextMessage = this.generateProfileSwitchContext(oldProfile, newProfile);
        await cheddar.sendTextMessage(contextMessage);
        
        // 6. Update UI
        this.dispatchEvent(new CustomEvent('profile-switched', {
            detail: { oldProfile, newProfile },
            bubbles: true,
            composed: true
        }));
        
        console.log(`✅ Profile switched: ${oldProfile} → ${newProfile}`);
        
    } catch (error) {
        console.error('Error switching profile:', error);
        alert(`Failed to switch profile: ${error.message}`);
        
        // Revert on error
        e.target.value = this.currentProfile;
        
    } finally {
        this.isSwitchingProfile = false;
        this.requestUpdate();
    }
}

generateProfileSwitchContext(oldProfile, newProfile) {
    return `[System: User has switched from ${oldProfile} mode to ${newProfile} mode. ` +
           `Please adapt your responses to the ${newProfile} profile while maintaining ` +
           `awareness of the previous conversation context.]`;
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

async saveConversationWithProfile(profile) {
    const sessionId = Date.now().toString();
    await cheddar.saveConversationSession(sessionId, {
        profile: profile,
        history: this.conversationHistory,
        timestamp: Date.now()
    });
}
```

### 4. Backend Support

#### In src/utils/llmProvider.js

Add handler for closing session:
```javascript
ipcMain.handle('close-llm-session', async (event) => {
    try {
        if (llmProviderRef.current) {
            await llmProviderRef.current.closeSession();
            console.log('LLM session closed successfully');
        }
        return { success: true };
    } catch (error) {
        console.error('Error closing LLM session:', error);
        return { success: false, error: error.message };
    }
});
```

### 5. Conversation History Preservation

#### Update conversation storage to include profile metadata

```javascript
// In renderer.js
async function saveConversationSession(sessionId, conversationData) {
    if (!conversationDB) {
        await initConversationStorage();
    }

    const transaction = conversationDB.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');

    const sessionData = {
        sessionId: sessionId,
        timestamp: parseInt(sessionId),
        profile: conversationData.profile || localStorage.getItem('selectedProfile'),
        conversationHistory: conversationData.history || conversationData,
        lastUpdated: Date.now(),
        profileSwitches: conversationData.profileSwitches || []
    };

    return new Promise((resolve, reject) => {
        const request = store.put(sessionData);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}
```

### 6. Visual Feedback

#### CSS for profile switcher
```css
.profile-switcher {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 15px;
}

.profile-switcher label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
}

.profile-switcher select {
    flex: 1;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 14px;
    cursor: pointer;
}

.profile-switcher select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.switching-indicator {
    font-size: 12px;
    color: #007aff;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

## Implementation Steps

### Phase 1: Basic Switching (Day 1)
1. ✅ Add profile switcher UI to AssistantView
2. ✅ Implement handleProfileSwitch method
3. ✅ Add close-llm-session IPC handler
4. ✅ Test basic profile switching

### Phase 2: History Preservation (Day 2)
5. ✅ Update conversation storage schema
6. ✅ Implement profile metadata tracking
7. ✅ Add profile switch context messages
8. ✅ Test history preservation

### Phase 3: Polish & Edge Cases (Day 3)
9. ✅ Add confirmation dialog
10. ✅ Add loading states
11. ✅ Handle errors gracefully
12. ✅ Add visual feedback
13. ✅ Test edge cases

## Testing Checklist

- [ ] Switch profile with empty conversation
- [ ] Switch profile with active conversation
- [ ] Confirm history is preserved after switch
- [ ] Confirm AI adapts to new profile
- [ ] Test switching between all profile combinations
- [ ] Test error handling (network failure, etc.)
- [ ] Test UI states (loading, disabled, etc.)
- [ ] Test with different providers (Gemini, Groq, OpenRouter)
- [ ] Test rapid profile switching
- [ ] Test profile switch during active capture

## Edge Cases

1. **Switch during active capture**: Disable switching or stop capture first
2. **Switch with pending images**: Clear or preserve image queue
3. **Switch during AI response**: Wait for response to complete
4. **Network failure during switch**: Rollback to previous profile
5. **Multiple rapid switches**: Debounce or queue switches

## Success Metrics

- Profile switch completes in < 2 seconds
- Zero conversation history loss
- AI responds appropriately to new profile
- No memory leaks or resource issues
- User satisfaction with feature

## Future Enhancements

1. **Profile history**: Show which profiles were used in a session
2. **Smart suggestions**: Suggest profile based on conversation content
3. **Quick switch**: Keyboard shortcut for common profile switches
4. **Profile presets**: Save custom profile configurations
5. **Multi-profile mode**: Use multiple profiles simultaneously
