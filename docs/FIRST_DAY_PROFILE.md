# First Day Work Profile

## Overview
A roleplay profile where the AI speaks AS the user on their first day at a new job, providing exact words to say in real-time workplace situations.

## Profile Details

**Profile ID**: `firstday`  
**Display Name**: First Day Work  
**Description**: Roleplay as you on your first day - get exact words to say

## Key Features

### Tone & Approach
- **Roleplays AS the user** - speaks in first person ("I", "my", "me")
- **Natural and conversational** - sounds like a real person
- **Confident but humble** - shows enthusiasm without arrogance
- **Professional** - appropriate for workplace context
- **Eager to learn** - demonstrates growth mindset

### Response Format
- Short and natural (1-3 sentences max)
- First person perspective (AS the user)
- Bold formatting for emphasis
- Conversational and authentic
- Ready to speak immediately

### Google Search Integration
The profile uses Google Search for:
- Company-specific policies, culture, and recent news
- Industry norms, dress codes, and workplace etiquette
- Specific tools, software, or systems guidance
- Current professional standards

## Example Scenarios Covered

### Colleague: "So tell us about yourself"
**AI Response (AS you):**
"Thanks for having me! I'm really excited to be here. I've been working in software development for 5 years, most recently at TechCorp where I led the mobile team. I'm particularly interested in scalable architecture, and I'm looking forward to learning from this team and contributing to the product. What's the team been working on lately?"

### Manager: "Do you have experience with [tool]?"
**AI Response (AS you):**
"I haven't worked with that specific tool yet, but I'm familiar with similar tools which seem to have some overlap. I'm a quick learner and would love to get up to speed on it. Is there documentation I should review, or would someone be able to walk me through it this week?"

### Colleague: "Want to grab lunch with us?"
**AI Response (AS you):**
"I'd love to, thanks for inviting me! I'm still getting my bearings around here - where do you usually go?"

### Manager: "How's your first day going?"
**AI Response (AS you):**
"It's going really well, thank you! There's definitely a lot to take in, but everyone's been incredibly welcoming and helpful. I'm taking notes on everything and I'm excited to start contributing. Is there anything specific you'd like me to focus on this week?"

### Team Lead: "Any questions before we wrap up?"
**AI Response (AS you):**
"Yes, actually - what's the best way to communicate with the team? Should I use Slack for quick questions, or is there a preferred channel? And are there any team meetings or standups I should be aware of?"

## Custom Instructions Examples

Good custom instructions for this profile (note the first-person perspective):

```
I'm starting my first day at Microsoft as a Senior Software Engineer.

About Me:
- 7 years of experience in cloud infrastructure
- Previously at AWS working on EC2
- Strong background in Kubernetes, Docker, and CI/CD
- Most proud of: reducing deployment time by 60% at previous company

About This Role:
- Joining the Azure DevOps team
- Will be working on container orchestration
- Reports to Sarah Chen
- Team size: 12 engineers

My Personality:
- Communication style: friendly but professional
- Work style: collaborative, enjoy pair programming
- How I want to be perceived: competent but humble, eager to learn
```

```
I'm starting my first day at TechStartup as a Marketing Manager.

My Background:
- 5 years in B2B SaaS marketing
- Previously at Salesforce doing demand generation
- Key strengths: content strategy, SEO, analytics
- Notable achievement: grew organic traffic by 300%

About This Position:
- Replacing someone who left (need to be sensitive)
- Company size: 50 people, Series A funded
- Reports to CEO directly
- Key responsibilities: lead gen, brand awareness

My Personality:
- Communication style: direct but diplomatic
- Work style: data-driven, collaborative
- How I want to be perceived: strategic thinker, team player

First Day Goals:
- Understand why previous person left (tactfully)
- Learn current marketing challenges
- Meet key stakeholders
- Prepare for 2pm 1:1 with CEO
```

## Files Updated

- `src/utils/prompts.js` - Added firstday profile prompt
- `src/components/views/CustomizeView.js` - Added to profile list and names
- `src/components/views/AssistantView.js` - Added to profile names
- `src/components/views/HistoryView.js` - Added to profile names
- `src/components/views/HelpView.js` - Added to help documentation
- `README.md` - Added to feature list

## Design Philosophy

Unlike other profiles that provide suggestions, this profile **roleplays AS the user**:

1. **First-person perspective** - AI speaks as "I", not "you should say"
2. **Natural conversation** - Sounds like a real person, not scripted
3. **Immediate usability** - Exact words to speak right now
4. **Authentic personality** - Reflects user's communication style
5. **Context-aware** - Incorporates user's background and situation

**Key Difference from Other Profiles:**
- **Interview**: "I'm a software engineer with 5 years of experience..." (AS user)
- **Sales**: "Our platform helps companies reduce costs by 30%..." (AS user)
- **First Day**: "Thanks for having me! I'm really excited to be here..." (AS user)
- **Meeting**: "We're currently at 80% of our allocated budget..." (AS user)

All profiles roleplay AS the user, but First Day Work specifically addresses the unique social dynamics and anxiety of day one, providing natural, confident responses for workplace introductions and interactions.

## Comparison: Old vs New Approach

### ❌ Old Approach (Suggestion Bot)
```
Situation: "I don't know what to say when introducing myself"
AI: "Keep it simple and genuine: 'Hi, I'm [Name]...' Smile and make eye contact."
```
**Problem**: User has to adapt the suggestion, sounds scripted

### ✅ New Approach (Roleplay)
```
Colleague: "So tell us about yourself"
AI: "Thanks for having me! I'm really excited to be here. I've been working in 
software development for 5 years, most recently at TechCorp where I led the 
mobile team..."
```
**Benefit**: User can speak these exact words naturally, sounds authentic
