# Quick Reference: Lead Management System

## Google Sheet Columns (A-I)
| Column | Field | Source | When Updated |
|--------|-------|--------|--------------|
| A | Lead ID | Auto-generated | Sign-in or Guest conversion |
| B | Name | User input | Sign-in or Guest conversion |
| C | Email | User input | Sign-in or Guest conversion |
| D | Phone | User input | Sign-in or Guest conversion |
| E | Timestamp | Auto | Sign-in or Guest conversion |
| F | Lead Score | Calculated | BANT completion |
| G | Priority | Calculated | BANT completion |
| H | Feedback | User click | Chatbot close |
| I | Attraction | User text | BANT question 5 |

## Lead Score Calculation
```
Timeline:
- Within 3 months: +20
- 3-6 months: +15
- 6-12 months: +10
- Just researching: +5

Capital:
- Yes, ready now: +25
- Yes, need to arrange: +15
- Not quite there yet: +5

Authority:
- Just me: +20
- Me + partner/spouse: +18
- Family/Business Partners: +15

Attraction (answer provided):
- Any response: +20

Max Score: 100
```

## Priority Logic
```javascript
if (score > 75) → High
else if (score >= 60) → Medium
else → Low
```

## User Flows

### Flow 1: Sign In → Chat
✅ Row created immediately
✅ Lead Score added after BANT
✅ Feedback on close

### Flow 2: Guest → Chat
❌ No row created
✅ Chat enabled immediately
❌ No feedback on close

### Flow 3: Guest → Schedule Call
❌ No initial row
✅ Form shown when clicking "Schedule Discovery Call"
✅ Row created after form submission
✅ Lead Score added after BANT
❌ No feedback on close (guest)

## Key Functions

### Update Lead Score
```javascript
updateLeadScore(leadId, score, priority, attraction)
```
- Called after BANT completion
- Updates columns F, G, I

### Update Feedback
```javascript
updateFeedback(leadId, feedback)
```
- Called on chatbot close
- Updates column H
- Only for signed-in users

### Guest Info Collection
- Triggered when guest clicks "Schedule Discovery Call"
- Shows inline form
- Creates new Google Sheet row
- Converts guest to tracked lead

## WordPress REST API

**Endpoint**: `/wp-json/pgpt/v1/lead`

**Operations**:
- `CREATE` - New lead row
- `UPDATE` - Modify existing row

## Quick Debug

### Lead Score not saving?
1. Check: Is user signed in? (not guest_)
2. Check: Did BANT flow complete?
3. Check: Console errors?

### Feedback not showing?
1. Check: Is user signed in?
2. Check: Has user sent messages?
3. Check: feedbackOverlay element exists?

### Guest form not appearing?
1. Check: User profile starts with "guest_"?
2. Check: Action is "BANT_START"?
3. Check: Console errors?

## Test Commands (Browser Console)

```javascript
// Check user profile
console.log(userProfile);

// Check lead profile
console.log(leadProfile);

// Check flow state
console.log(flowState);

// Check conversation history
console.log(conversationHistory);
```

## Important Notes

⚠️ **Guest users DON'T get feedback prompt** (by design)
⚠️ **Only signed-in users** get lead_id saved immediately
⚠️ **Guests become tracked** when they schedule discovery call
⚠️ **Same row is updated** (no duplicate entries)
⚠️ **Priority auto-calculated** based on score thresholds

## File Locations

- **Chatbot**: `wordpress_ui/chatbot-test-ui.html`
- **Apps Script**: Google Sheet → Extensions → Apps Script
- **WordPress**: `functions.php` or custom plugin
- **Setup Guide**: `wordpress_ui/SETUP_COMPLETE.md`
