# Testing Scenarios

## Test Scenario 1: High Priority Lead (Signed-in)

### Steps:
1. Open chatbot
2. Click "Sign In" button
3. Fill form:
   - Name: Test User High
   - Email: high@test.com
   - Phone: 1111111111
4. Click "Start Chat"
5. Click "Schedule Discovery Call"
6. Answer BANT questions:
   - Experience: "I've been researching for 6 months"
   - Timeline: Click "Within 3 months" (+20 points)
   - Capital: Click "Yes, ready now" (+25 points)
   - Authority: Click "Just me" (+20 points)
   - Attraction: Type "Love the business model and support" (+20 points)

### Expected Results:
- **Lead Score**: 85
- **Priority**: High
- **Google Sheet Row**:
  - Column A: lead_[timestamp]_[random]
  - Column B: Test User High
  - Column C: high@test.com
  - Column D: 1111111111
  - Column E: Current timestamp
  - Column F: 85
  - Column G: High
  - Column H: (empty until close)
  - Column I: "Love the business model and support"

### Feedback Test:
7. Click X to close chatbot
8. Feedback overlay appears
9. Click 👍 (Good)
10. Check Google Sheet Column H: "Good"

---

## Test Scenario 2: Medium Priority Lead (Signed-in)

### Steps:
1. Open chatbot
2. Click "Sign In"
3. Fill form:
   - Name: Test User Medium
   - Email: medium@test.com
   - Phone: 2222222222
4. Click "Start Chat"
5. Click "Schedule Discovery Call"
6. Answer BANT:
   - Experience: "Just started looking"
   - Timeline: "3-6 months" (+15 points)
   - Capital: "Yes, but need to arrange" (+15 points)
   - Authority: "Me + partner/spouse" (+18 points)
   - Attraction: "Proven track record" (+20 points)

### Expected Results:
- **Lead Score**: 68
- **Priority**: Medium
- **Google Sheet Column F**: 68
- **Google Sheet Column G**: Medium
- **Google Sheet Column I**: "Proven track record"

### Feedback Test:
7. Close chatbot → Click 👎 (Bad)
8. Check Column H: "Bad"

---

## Test Scenario 3: Low Priority Lead (Signed-in)

### Steps:
1. Sign in with:
   - Name: Test User Low
   - Email: low@test.com
   - Phone: 3333333333
2. Schedule discovery call
3. Answer conservatively:
   - Experience: "Brand new to this"
   - Timeline: "Just researching" (+5 points)
   - Capital: "Not quite there yet" (+5 points)
   - Authority: "Family/Business Partners" (+15 points)
   - Attraction: "Exploring options" (+20 points)

### Expected Results:
- **Lead Score**: 45
- **Priority**: Low
- **Message**: Shows "explore our website" (Nurture flow)
- **Google Sheet Columns**:
  - F: 45
  - G: Low
  - I: "Exploring options"

---

## Test Scenario 4: Guest User (Chat Only)

### Steps:
1. Click "Continue as Guest"
2. Chat with AI assistant
3. Ask various questions
4. Close chatbot

### Expected Results:
- **Google Sheet**: No row created
- **Chat**: Works normally
- **Feedback**: No feedback prompt shown
- **User Profile**: lead_id starts with "guest_"

---

## Test Scenario 5: Guest → Discovery Call Conversion

### Steps:
1. Click "Continue as Guest"
2. Chat normally (verify no Google Sheet row)
3. Click "Schedule Discovery Call"
4. **Inline form appears in chat**
5. Fill form:
   - Name: Guest Converted
   - Email: guest@test.com
   - Phone: 4444444444
6. Click "Submit & Continue"
7. Complete BANT:
   - Experience: "Researching options"
   - Timeline: "6-12 months" (+10)
   - Capital: "Yes, but need to arrange" (+15)
   - Authority: "Me + partner/spouse" (+18)
   - Attraction: "Scalability" (+20)

### Expected Results:
- **Before form submission**: No Google Sheet row
- **After form submission**: New row created (Columns A-E filled)
- **After BANT completion**: Same row updated
  - Column F: 63
  - Column G: Medium
  - Column I: "Scalability"
- **On close**: No feedback prompt (still treated as guest for feedback)

---

## Test Scenario 6: Multiple Updates Same Lead

### Steps:
1. Sign in as "Multi Update User" (multi@test.com)
2. Complete BANT once → Check score saved
3. Chat more with AI
4. Click "Schedule Discovery Call" again
5. Complete BANT with different answers
6. Close and give feedback

### Expected Results:
- **Single Google Sheet Row** (not duplicate)
- **Lead Score**: Updated to new score (second BANT)
- **Attraction**: Updated to new answer
- **Priority**: Recalculated based on new score
- **Feedback**: Only one feedback recorded

---

## Test Scenario 7: Edge Case - Empty Attraction

### Steps:
1. Sign in normally
2. Start BANT flow
3. At attraction question: Press Enter without typing anything

### Expected Results:
- **Lead Score**: Still gets +20 points (empty string still counts)
- **Column I**: Empty string
- **Flow**: Continues normally

---

## Test Scenario 8: Rapid Fire - Multiple Users

### Steps:
1. Open 3 browser tabs
2. **Tab 1**: Sign in as User1, complete BANT, score: 85, close with 👍
3. **Tab 2**: Guest mode, schedule call as User2, complete BANT, score: 45
4. **Tab 3**: Sign in as User3, complete BANT, score: 70, close with 👎

### Expected Results:
- **Google Sheet**: 3 separate rows
- **User1**: Score 85, Priority High, Feedback Good
- **User2**: Score 45, Priority Low, Feedback (empty)
- **User3**: Score 70, Priority Medium, Feedback Bad
- **No row mixing**: Each lead_id updates its own row only

---

## Debugging Checklist

### Issue: Lead Score Not Saving

**Check:**
- [ ] User is signed in (not guest_)
- [ ] BANT flow completed (answered all 5 questions)
- [ ] Browser console shows no errors
- [ ] WordPress endpoint accessible: `/wp-json/pgpt/v1/lead`
- [ ] Google Apps Script URL correct in functions.php
- [ ] Apps Script deployed as Web App
- [ ] Apps Script has "Anyone" access

**Console Commands:**
```javascript
// Check user profile
console.log(userProfile);
// Should show: {lead_id: "lead_...", name: "...", ...}

// Check lead profile
console.log(leadProfile);
// Should show: {leadScore: 85, attraction: "...", ...}

// Check flow state
console.log(flowState);
// After BANT: Should be "QUALIFIED" or "NURTURE"
```

### Issue: Feedback Not Showing

**Check:**
- [ ] User is signed in (userProfile.lead_id doesn't start with "guest_")
- [ ] User has sent at least one message (conversationHistory.length > 0)
- [ ] Feedback overlay element exists in DOM
- [ ] No JavaScript errors in console

**Console Commands:**
```javascript
// Check if feedback should show
console.log(userProfile && !userProfile.lead_id.startsWith('guest_'));
// Should return: true

// Check conversation history
console.log(conversationHistory.length);
// Should be > 0

// Manually trigger feedback
document.getElementById('pgpt-feedback-overlay').classList.remove('pgpt-hidden');
```

### Issue: Guest Form Not Showing

**Check:**
- [ ] User selected "Continue as Guest"
- [ ] userProfile.lead_id starts with "guest_"
- [ ] Action triggered is "BANT_START"
- [ ] No previous lead_id exists

**Console Commands:**
```javascript
// Check user profile
console.log(userProfile);
// Should show: {lead_id: "guest_...", name: "Guest", ...}

// Check flow state
console.log(flowState);
// Should be: "GUEST_INFO_COLLECTION"
```

### Issue: Priority Calculation Wrong

**Verify:**
```javascript
// Check score
console.log(leadProfile.leadScore);

// Manually calculate priority
let score = leadProfile.leadScore;
let priority = score > 75 ? 'High' : score >= 60 ? 'Medium' : 'Low';
console.log('Expected Priority:', priority);
```

---

## Browser Console Testing Commands

### View Current State
```javascript
// All user info
console.table(userProfile);

// All lead qualification data
console.table(leadProfile);

// Current flow state
console.log('Flow State:', flowState);

// Chat history length
console.log('Messages:', conversationHistory.length);
```

### Manual API Testing
```javascript
// Test CREATE operation
fetch('/wp-json/pgpt/v1/lead', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    operation: 'CREATE',
    name: 'Test API User',
    email: 'api@test.com',
    phone: '9999999999'
  })
})
.then(r => r.json())
.then(console.log);

// Test UPDATE operation (use lead_id from above)
fetch('/wp-json/pgpt/v1/lead', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    operation: 'UPDATE',
    lead_id: 'lead_1234567890_abc123', // Replace with actual lead_id
    lead_score: 75,
    priority: 'High',
    attraction: 'API Test',
    feedback: 'Good'
  })
})
.then(r => r.json())
.then(console.log);
```

### Force Feedback Popup
```javascript
// Show feedback overlay manually
document.getElementById('pgpt-feedback-overlay').classList.remove('pgpt-hidden');

// Hide it
document.getElementById('pgpt-feedback-overlay').classList.add('pgpt-hidden');
```

---

## Google Sheet Verification

After each test, verify Google Sheet:

1. **Check column order**: A-I match expected fields
2. **Check data types**: 
   - Lead Score (F): Number
   - Priority (G): Text (High/Medium/Low)
   - Feedback (H): Text (Good/Bad)
   - Attraction (I): Text
3. **Check timestamps**: Format correct
4. **Check no duplicates**: Each lead_id appears only once
5. **Check updates**: Same row updated, not new rows

---

## Success Criteria

✅ **Signed-in users**: Create immediate Google Sheet row
✅ **Guest users**: No row until scheduling call
✅ **Lead scores**: Calculated correctly
✅ **Priority**: Matches score thresholds
✅ **Attraction**: Saved to Column I
✅ **Feedback**: Only for signed-in users
✅ **Guest conversion**: Single row, no duplicates
✅ **Multiple updates**: Same row updated
✅ **No errors**: Console clean

---

## Common Error Messages

### Error: "Lead ID not found"
**Cause**: Trying to UPDATE a lead_id that doesn't exist in Google Sheet
**Solution**: Verify CREATE was called first, check Apps Script logs

### Error: "Failed to update lead score"
**Cause**: WordPress endpoint returned error
**Solution**: Check functions.php code, verify Google Script URL

### Error: "Sheet1 not found"
**Cause**: Google Sheet doesn't have sheet named "Sheet1"
**Solution**: Rename sheet to "Sheet1" or update Apps Script

### Error: "Access denied"
**Cause**: Apps Script not deployed with "Anyone" access
**Solution**: Redeploy with correct permissions

---

## Performance Testing

### Load Test: 10 Concurrent Users
1. Open 10 browser tabs
2. Sign in simultaneously
3. Complete BANT flows
4. Verify all 10 rows in Google Sheet
5. Check no data mixing between users

### Stress Test: Rapid Updates
1. Complete BANT flow
2. Immediately close and give feedback
3. Reopen and complete BANT again
4. Close and give different feedback
5. Verify only 1 row exists with latest data
