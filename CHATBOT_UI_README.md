# Franchise Chatbot Test UI

A standalone HTML interface to test the hybrid chatbot with BANT qualification flow.

## Features

✅ **Hybrid Flow**: Normal chat goes to PrivateGPT, qualification handled locally  
✅ **BANT Scoring**: Automatic lead scoring based on Budget, Authority, Need, Timeline  
✅ **5-Step Qualification**: Progressive questions with quick reply buttons  
✅ **Calendly Integration**: Opens scheduling widget for qualified leads (60+ score)  
✅ **Real-time Score Display**: See lead score update as user answers  
✅ **Configuration Panel**: Easy setup without editing code  
✅ **Beautiful UI**: Modern, responsive design with animations  

## Quick Start

### 1. Open the UI

Simply open `chatbot-test-ui.html` in your web browser:

```bash
# Option 1: Double-click the file
# Option 2: Right-click → Open with → Browser
# Option 3: Drag and drop into browser
```

### 2. Configure Connection

In the **Configuration Panel** (top-left):

1. **PrivateGPT URL**: 
   - Local: `http://localhost:8001/v1/chat/completions`
   - Remote: `https://your-domain.com/v1/chat/completions`

2. **Auth Token**:
   - Format: `username:password` (will be auto-encoded)
   - Or: `Basic base64encodedstring` (if already encoded)
   - Leave empty if auth is disabled

3. **Calendly URL**:
   - Your Calendly scheduling link
   - Example: `https://calendly.com/your-username/discovery-call`

4. Click **"Update Config"**

### 3. Test the Chatbot

#### Normal Chat Flow:
- Type any question about franchises
- Bot sends to PrivateGPT and returns answer
- Example: "What is a franchise fee?"

#### Qualification Flow:
- Type: **"schedule a call"** or **"I want to schedule a meeting"**
- Bot starts 5-step qualification process
- Answer questions using quick reply buttons
- Score updates in real-time (top-right)
- If score ≥ 60: Calendly opens
- If score < 60: Soft rejection message

## BANT Scoring Rules

### Budget (25 points max)
- Ready / $150K+ = **25 points**
- $100K+ = **20 points**
- $50K-$100K = **15 points**
- Under $50K = **5 points**

### Authority (20 points max)
- Decision Maker = **20 points**
- Influencer = **15 points**
- Researcher = **5 points**

### Timeline (20 points max)
- 3 months = **20 points**
- 3-6 months = **15 points**
- 6-12 months = **10 points**
- Just researching = **5 points**

### Experience (10 points max)
- Actively researching 6+ months = **10 points**
- Few weeks/months = **8 points**
- Just started = **5 points**

### Attraction (10 points max)
- Specific interest (mentions ROI, profit, return) = **10 points**
- General exploration = **5 points**

**Qualification Threshold: 60 points**

## Qualification Flow Steps

1. **Experience Question**: "How long have you been exploring?"
2. **Timeline Question**: "When do you want to open?"
3. **Budget Question**: "What's your liquid capital?"
4. **Authority Question**: "Are you the decision maker?"
5. **Attraction Question**: "What attracted you?" (text input)

## Testing Scenarios

### Scenario 1: Qualified Lead (Score ≥ 60)
```
User: "schedule a call"
→ Step 1: "Actively researching 6+ months" (+10)
→ Step 2: "3-6 months" (+15)
→ Step 3: "Yes, ready now ($150K+)" (+25)
→ Step 4: "Just me" (+20)
→ Step 5: "Strong ROI and proven system" (+10)
Total: 80 points → ✅ Calendly opens
```

### Scenario 2: Not Qualified (Score < 60)
```
User: "schedule a call"
→ Step 1: "Just started" (+5)
→ Step 2: "Just researching" (+5)
→ Step 3: "Under $50K" (+5)
→ Step 4: "Researching for someone else" (+5)
→ Step 5: "Just curious" (+5)
Total: 25 points → ❌ Soft rejection message
```

### Scenario 3: Normal Chat
```
User: "What is a franchise fee?"
→ Sent to PrivateGPT
→ Returns answer from knowledge base
```

## Troubleshooting

### "API Error" Messages

**Problem**: Cannot connect to PrivateGPT

**Solutions**:
1. ✅ Check PrivateGPT is running: `docker compose -f docker-compose.prod.yml ps`
2. ✅ Verify URL is correct (no trailing slash)
3. ✅ Check authentication credentials
4. ✅ Test URL in browser: `http://localhost:8001/health` should return `{"status":"ok"}`

### Calendly Not Opening

**Problem**: Calendly widget doesn't appear

**Solutions**:
1. ✅ Update Calendly URL in config panel
2. ✅ Check browser popup blocker settings
3. ✅ URL should be full: `https://calendly.com/username/event`

### Score Not Updating

**Problem**: Lead score stays at 0

**Solutions**:
1. ✅ Make sure you're in qualification mode (type "schedule a call")
2. ✅ Click quick reply buttons (don't just type)
3. ✅ Check browser console for errors (F12)

### Buttons Not Working

**Problem**: Quick reply buttons don't respond

**Solutions**:
1. ✅ Check browser console for JavaScript errors
2. ✅ Try refreshing the page
3. ✅ Make sure you're not in a text input step

## Browser Compatibility

✅ **Chrome/Edge**: Full support  
✅ **Firefox**: Full support  
✅ **Safari**: Full support  
✅ **Mobile browsers**: Responsive design works

## Integration with WordPress

Once tested, you can:

1. **Extract the JavaScript**: Copy the `<script>` section
2. **Extract the CSS**: Copy the `<style>` section
3. **Add to WPCode**: Create a new snippet with the code
4. **Update DOM selectors**: Match your WordPress HTML structure

## API Endpoints Used

- `POST /v1/chat/completions` - Main chat endpoint
- `GET /health` - Health check (optional)

## Next Steps

1. ✅ Test all qualification flows
2. ✅ Verify PrivateGPT integration
3. ✅ Test with real franchise documents
4. ✅ Customize questions/scoring if needed
5. ✅ Integrate into WordPress/WPCode

## Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Verify PrivateGPT is running and accessible
3. Test API endpoint directly with curl/Postman
4. Check network tab for failed requests

---

**Happy Testing! 🚀**

