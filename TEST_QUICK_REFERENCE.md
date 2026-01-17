# Test Quick Reference Guide

Quick reference for testing the Hybrid Chatbot with BANT Qualification Flow.

## 🚀 Quick Test Scenarios

### 1. Normal Chat Test (30 seconds)
```
1. Type: "What is a franchise fee?"
2. ✅ Should get response from PrivateGPT
3. ✅ Bot shows typing indicator
4. ✅ Response is relevant
```

### 2. Qualified Lead Test (2 minutes)
```
1. Type: "schedule a call"
2. Answer: "Actively researching 6+ months" (+10)
3. Answer: "3-6 months" (+15)
4. Answer: "Yes, ready now ($150K+)" (+25)
5. Answer: "Just me" (+20)
6. Type: "Strong ROI" (+10)
7. ✅ Total = 80 → Calendly opens!
```

### 3. Not Qualified Test (2 minutes)
```
1. Type: "schedule a call"
2. Answer: "Just started" (+5)
3. Answer: "Just researching" (+5)
4. Answer: "Under $50K" (+5)
5. Answer: "Researching for someone else" (+5)
6. Type: "Just curious" (+5)
7. ✅ Total = 25 → Soft rejection message
```

### 4. Edge Case - Exactly 60 Points (2 minutes)
```
1. Type: "schedule a call"
2. Answer: "Actively researching 6+ months" (+10)
3. Answer: "3-6 months" (+15)
4. Answer: "Yes, ready now ($150K+)" (+25)
5. Answer: "Researching for someone else" (+5)
6. Type: "General interest" (+5)
7. ✅ Total = 60 → Should qualify (≥60)
```

## 📊 Expected Scores Reference

### High Scores (Qualified Path)
| Question | Answer | Points |
|----------|--------|--------|
| Experience | Actively researching 6+ months | +10 |
| Timeline | Within 3 months | +20 |
| Budget | Ready now ($150K+) | +25 |
| Authority | Decision Maker | +20 |
| Attraction | Specific (ROI/profit) | +10 |
| **TOTAL** | | **85** ✅ |

### Low Scores (Not Qualified Path)
| Question | Answer | Points |
|----------|--------|--------|
| Experience | Just started | +5 |
| Timeline | Just researching | +5 |
| Budget | Under $50K | +5 |
| Authority | Researcher | +5 |
| Attraction | General | +5 |
| **TOTAL** | | **25** ❌ |

### Threshold Test (Exactly 60)
| Question | Answer | Points |
|----------|--------|--------|
| Experience | Actively researching 6+ months | +10 |
| Timeline | 3-6 months | +15 |
| Budget | Ready now ($150K+) | +25 |
| Authority | Researcher | +5 |
| Attraction | General | +5 |
| **TOTAL** | | **60** ✅ |

## 🎯 BANT Scoring Breakdown

### Budget (Max 25 points)
- ✅ Ready / $150K+ = **25**
- ✅ $100K+ = **20**
- ✅ $50K-$100K = **15**
- ❌ Under $50K = **5**

### Authority (Max 20 points)
- ✅ Decision Maker = **20**
- ✅ Influencer = **15**
- ❌ Researcher = **5**

### Timeline (Max 20 points)
- ✅ 3 months = **20**
- ✅ 3-6 months = **15**
- ✅ 6-12 months = **10**
- ❌ Just researching = **5**

### Experience (Max 10 points)
- ✅ 6+ months research = **10**
- ✅ Few weeks/months = **8**
- ❌ Just started = **5**

### Attraction (Max 10 points)
- ✅ Specific interest (ROI/profit) = **10**
- ❌ General exploration = **5**

**Qualification Threshold: ≥ 60 points**

## 🔍 What to Check

### UI Elements
- [ ] Chat messages appear correctly
- [ ] Typing indicator shows/hides
- [ ] Quick reply buttons are clickable
- [ ] Score indicator updates in real-time
- [ ] Status updates correctly

### Functionality
- [ ] Normal chat sends to PrivateGPT
- [ ] Qualification flow triggers correctly
- [ ] Score calculates correctly
- [ ] Calendly opens for qualified leads
- [ ] Soft rejection for not qualified

### Edge Cases
- [ ] Exactly 60 points qualifies
- [ ] 59 points does not qualify
- [ ] Maximum score (85) works
- [ ] Minimum score (25) works
- [ ] Empty messages handled

### Error Handling
- [ ] Invalid URL shows error
- [ ] Invalid auth shows error
- [ ] Server down shows error
- [ ] Network timeout handled
- [ ] No crashes on errors

## 🐛 Common Issues & Fixes

### Issue: "API Error" when sending message
**Check**:
1. ✅ PrivateGPT Docker is running: `docker compose -f docker-compose.prod.yml ps`
2. ✅ URL is correct: `http://localhost:8001/v1/chat/completions`
3. ✅ Auth token is correct (if enabled)
4. ✅ Test health endpoint: `http://localhost:8001/health`

**Fix**: Update config panel with correct values

---

### Issue: Score not updating
**Check**:
1. ✅ In qualification mode (type "schedule a call" first)
2. ✅ Clicking buttons, not just typing
3. ✅ Browser console for errors (F12)

**Fix**: Start qualification flow properly

---

### Issue: Calendly not opening
**Check**:
1. ✅ Score is ≥ 60
2. ✅ Calendly URL is configured
3. ✅ Browser popup blocker not blocking
4. ✅ URL is correct format

**Fix**: Update Calendly URL in config panel

---

### Issue: Qualification flow not starting
**Check**:
1. ✅ Using trigger words: "schedule", "call", "meeting"
2. ✅ Not already in qualification mode
3. ✅ Browser console for errors

**Fix**: Type "schedule a call" to start

---

### Issue: Buttons not clickable
**Check**:
1. ✅ JavaScript is loaded (check console)
2. ✅ Not in text input step
3. ✅ Buttons are visible

**Fix**: Refresh page, check browser console

## 📋 Test Checklist

### Pre-Testing Setup
- [ ] PrivateGPT is running
- [ ] Docker containers are up
- [ ] Config panel settings correct
- [ ] Browser console open (F12)

### Basic Functionality
- [ ] Can send messages
- [ ] Bot responds
- [ ] Typing indicator works
- [ ] Messages scroll correctly

### Qualification Flow
- [ ] Flow starts with "schedule a call"
- [ ] All 5 steps work
- [ ] Score updates after each answer
- [ ] Qualified leads open Calendly
- [ ] Not qualified shows rejection

### BANT Scoring
- [ ] Budget scores correctly
- [ ] Authority scores correctly
- [ ] Timeline scores correctly
- [ ] Experience scores correctly
- [ ] Attraction scores correctly
- [ ] Total score is accurate

### Error Handling
- [ ] Invalid URL handled
- [ ] Invalid auth handled
- [ ] Server down handled
- [ ] Network errors handled
- [ ] No crashes

### Edge Cases
- [ ] Exactly 60 points
- [ ] 59 points
- [ ] Maximum score
- [ ] Minimum score
- [ ] Empty messages
- [ ] Special characters

## 🎬 Quick Test Scripts

### Script 1: Full Qualified Lead Flow
```
1. "schedule a call"
2. Click: "Actively researching 6+ months"
3. Click: "3-6 months"
4. Click: "Yes, ready now ($150K+)"
5. Click: "Just me"
6. Type: "Strong ROI and proven system"
7. ✅ Expected: Score = 80, Calendly opens
```

### Script 2: Full Not Qualified Flow
```
1. "schedule a call"
2. Click: "Just started"
3. Click: "Just researching"
4. Click: "Under $50K"
5. Click: "Researching for someone else"
6. Type: "Just curious"
7. ✅ Expected: Score = 25, Soft rejection
```

### Script 3: Edge Case Test
```
1. "schedule a call"
2. Click: "Actively researching 6+ months" (+10)
3. Click: "3-6 months" (+15)
4. Click: "Yes, ready now ($150K+)" (+25)
5. Click: "Researching for someone else" (+5)
6. Type: "General interest" (+5)
7. ✅ Expected: Score = 60, Should qualify
```

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Browser: ___________
Environment: Local / Staging / Production

Results:
- Total Tests: ___
- Passed: ___
- Failed: ___
- Pass Rate: ___%

Critical Issues:
1. 
2. 

Notes:
```

---

**Quick Tips**:
- 💡 Always check browser console (F12) for errors
- 💡 Verify PrivateGPT is running before testing
- 💡 Use config panel to update settings easily
- 💡 Test both qualified and not qualified paths
- 💡 Test edge cases (60, 59 points)

**Happy Testing! 🧪**

