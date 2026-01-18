# Complete Integration Setup Guide

## Overview
This guide will help you set up the complete lead management system with:
- Lead score tracking with priority (High/Medium/Low)
- Attraction question response tracking
- Feedback collection on chatbot close
- Guest lead capture during discovery call scheduling

## Google Sheets Column Layout
Ensure your Google Sheet (Sheet1) has these columns in order:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Lead ID | Name | Email | Phone | Timestamp | Lead Score | Priority | Feedback | Attraction |

## Setup Steps

### Step 1: Update Google Apps Script

1. Open your Google Sheet
2. Go to Extensions → Apps Script
3. **Replace** the entire script with the code from `google-apps-script-updated.js`
4. **Save** the script
5. Click **Deploy** → **New deployment**
6. Select type: **Web app**
7. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**
9. **Copy the Web App URL** (you'll need this for WordPress)

### Step 2: Update WordPress Functions

1. In your WordPress dashboard, go to Appearance → Theme File Editor
2. Select `functions.php` from the right sidebar
3. **Add** the code from `wordpress-functions-updated.php` to the bottom of the file
4. **Important**: Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the URL you copied in Step 1
5. Click **Update File**

### Step 3: Update Chatbot HTML

1. Replace your existing `chatbot-test-ui.html` with the updated version
2. The new version includes:
   - ✅ Guest/Sign-in choice screen
   - ✅ Lead score tracking with priority calculation
   - ✅ Attraction question tracking
   - ✅ Feedback UI (thumbs up/down)
   - ✅ Guest lead capture during BANT flow

## Features Explained

### 1. Lead Score & Priority
- **Automatic**: When user completes BANT qualification
- **Triggers**: After user answers the attraction question
- **Priority Logic**:
  - Score > 75 → **High**
  - Score 60-75 → **Medium**
  - Score < 60 → **Low**
- **Updates**: Column F (Lead Score) and Column G (Priority)

### 2. Attraction Question
- **Question**: "What attracted you most to Franquicia Boost?"
- **When**: During BANT qualification (5th question)
- **Storage**: Column I (Attraction)
- **Scoring**: +20 points for answering

### 3. Feedback Collection
- **When**: User clicks the X button to close chatbot
- **Who**: Only shown to signed-in users (not guests)
- **Options**: 👍 (stored as "Good") or 👎 (stored as "Bad")
- **Storage**: Column H (Feedback)

### 4. Guest Lead Capture
- **Scenario**: Guest user clicks "Schedule Discovery Call"
- **Process**:
  1. Shows inline form to collect name, email, phone
  2. Saves to Google Sheet with new lead_id
  3. Continues with BANT qualification
  4. Lead score and attraction tracked normally
- **Result**: Guest becomes a tracked lead with full data

## Data Flow

### Signed-in User Flow
```
1. User signs in → Creates row in Google Sheet
2. User completes BANT → Updates same row with:
   - Lead Score (Column F)
   - Priority (Column G)
   - Attraction (Column I)
3. User closes chatbot → Updates same row with:
   - Feedback (Column H)
```

### Guest User Flow
```
1. User chooses "Continue as Guest" → No Google Sheet entry
2. User clicks "Schedule Discovery Call" → Shows form
3. User submits form → Creates row in Google Sheet
4. User completes BANT → Updates same row with:
   - Lead Score (Column F)
   - Priority (Column G)
   - Attraction (Column I)
5. User closes chatbot → Skips feedback (guests don't get feedback prompt)
```

## Testing

### Test 1: Signed-in User with High Score
1. Click "Sign In" button
2. Enter name, email, phone
3. Click "Schedule Discovery Call"
4. Answer BANT questions:
   - Timeline: "Within 3 months" (+20)
   - Capital: "Yes, ready now" (+25)
   - Authority: "Just me" (+20)
   - Attraction: "Any text" (+20)
   - **Total: 85 points**
5. Check Google Sheet:
   - Lead Score: 85
   - Priority: High
   - Attraction: Your text
6. Close chatbot → Click 👍 or 👎
7. Check Google Sheet:
   - Feedback: Good or Bad

### Test 2: Guest User Conversion
1. Click "Continue as Guest"
2. Chat normally (no Google Sheet entry yet)
3. Click "Schedule Discovery Call"
4. Form appears → Enter name, email, phone
5. Complete BANT questions
6. Check Google Sheet:
   - New row created with all data
   - Lead Score calculated
   - Priority set
   - Attraction saved

### Test 3: Medium Priority
1. Sign in as new user
2. Schedule discovery call
3. Answer with medium scores:
   - Timeline: "3-6 months" (+15)
   - Capital: "Yes, but need to arrange" (+15)
   - Authority: "Me + partner/spouse" (+18)
   - Attraction: "Text" (+20)
   - **Total: 68 points**
4. Check: Priority = Medium

### Test 4: Low Priority
1. Sign in as new user
2. Schedule discovery call
3. Answer conservatively:
   - Timeline: "Just researching" (+5)
   - Capital: "Not quite there yet" (+5)
   - Authority: "Family/Business Partners" (+15)
   - Attraction: "Text" (+20)
   - **Total: 45 points**
4. Check: Priority = Low

## Troubleshooting

### Google Sheet not updating
1. Check Apps Script deployment URL in WordPress functions.php
2. Verify Google Sheet has correct column headers (A-I)
3. Check browser console for errors (F12 → Console tab)

### Feedback not saving
1. Ensure user is signed in (not guest)
2. Check that conversationHistory has messages
3. Verify WordPress endpoint is accessible: `/wp-json/pgpt/v1/lead`

### Guest form not showing
1. Confirm user selected "Continue as Guest"
2. Verify userProfile.lead_id starts with "guest_"
3. Check console for JavaScript errors

### Priority calculation wrong
- Verify lead score is calculated correctly
- Check priority logic in `checkQualificationAndSchedule()`:
  - > 75 = High
  - 60-75 = Medium
  - < 60 = Low

## Files Included

1. **chatbot-test-ui.html** - Updated chatbot with all features
2. **google-apps-script-updated.js** - Google Apps Script with UPDATE support
3. **wordpress-functions-updated.php** - WordPress REST API endpoints
4. **SETUP_COMPLETE.md** - This file

## API Reference

### WordPress Endpoint: `/wp-json/pgpt/v1/lead`

#### Create Lead
```json
POST /wp-json/pgpt/v1/lead
{
  "operation": "CREATE",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

#### Update Lead Score
```json
POST /wp-json/pgpt/v1/lead
{
  "operation": "UPDATE",
  "lead_id": "lead_1234567890_abc123",
  "lead_score": 85,
  "priority": "High",
  "attraction": "Great business model"
}
```

#### Update Feedback
```json
POST /wp-json/pgpt/v1/lead
{
  "operation": "UPDATE",
  "lead_id": "lead_1234567890_abc123",
  "feedback": "Good"
}
```

## Support

If you encounter issues:
1. Check browser console (F12 → Console)
2. Check WordPress debug.log
3. Verify Google Apps Script execution log
4. Test each component separately

## Summary of Changes

✅ Google Sheet layout updated (9 columns)
✅ Lead score automatically calculated and saved
✅ Priority based on score (High/Medium/Low)
✅ Attraction question response tracked
✅ Feedback collection on close (thumbs up/down)
✅ Guest lead capture during discovery call
✅ All data updates same row (no duplicates)
✅ Guest mode prevents unnecessary data collection
