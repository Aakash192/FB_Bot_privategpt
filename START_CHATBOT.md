# 🚀 Quick Start: Running the Chatbot

## ⚠️ IMPORTANT: You MUST Use an HTTP Server!

**Do NOT open `chatbot-test-ui.html` directly by double-clicking it!**

Browsers block CORS requests from `file://` protocol for security reasons. You MUST serve the HTML file from an HTTP server.

---

## ✅ Solution 1: Use the Python Server (Recommended)

### Step 1: Start the Server
```powershell
cd "E:\FarnquciaBoost AI-chat-bot\Private_GPT\private-gpt"
python serve-chatbot.py
```

### Step 2: Open in Browser
The script will automatically open your browser, or manually navigate to:
```
http://localhost:8000/chatbot-test-ui.html
```

### Step 3: Test the Chatbot
- Type "hi" in the chat
- You should get a response from PrivateGPT!

---

## ✅ Solution 2: Use PowerShell Script

```powershell
cd "E:\FarnquciaBoost AI-chat-bot\Private_GPT\private-gpt"
.\serve-chatbot.ps1
```

Then open: `http://localhost:8000/chatbot-test-ui.html`

---

## ✅ Solution 3: Use Python's Built-in Server

```powershell
cd "E:\FarnquciaBoost AI-chat-bot\Private_GPT\private-gpt"
python -m http.server 8000
```

Then open: `http://localhost:8000/chatbot-test-ui.html`

---

## ✅ Solution 4: Use PrivateGPT's Built-in UI

PrivateGPT has a built-in UI at:
```
http://localhost:8001/
```

Simply open your browser to this URL!

---

## 🔍 Verify Everything is Working

### 1. Check Docker Containers
```powershell
docker compose -f docker-compose.prod.yml ps
```

Should show:
```
private-gpt-private-gpt-1   Up
private-gpt-postgres-1      Up (healthy)
private-gpt-qdrant-1        Up
```

### 2. Test the API
```powershell
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

Should show: `✅ SUCCESS!` with a response from the API.

### 3. Check Browser Console (F12)
- Open browser DevTools (F12)
- Go to Console tab
- Should see no CORS errors
- Network tab should show successful API calls

---

## ❌ What NOT to Do

❌ **Don't** double-click `chatbot-test-ui.html`  
❌ **Don't** open it with `file:///E:/path/to/chatbot-test-ui.html`  
❌ **Don't** use `file://` protocol

This will cause: `Failed to fetch` errors

---

## ✅ What TO Do

✅ **Do** use an HTTP server (port 8000)  
✅ **Do** open from `http://localhost:8000/chatbot-test-ui.html`  
✅ **Do** use `http://` or `https://` protocol

This will work correctly!

---

## 🐛 Still Having Issues?

1. **Check if PrivateGPT is running:**
   ```powershell
   docker compose -f docker-compose.prod.yml ps
   ```

2. **Check Docker logs:**
   ```powershell
   docker compose -f docker-compose.prod.yml logs private-gpt --tail=50
   ```

3. **Verify CORS settings:**
   - Open `settings-prod.yaml`
   - Should have: `allow_origins: ["*"]`

4. **Restart PrivateGPT:**
   ```powershell
   docker compose -f docker-compose.prod.yml restart private-gpt
   ```

5. **Check browser console (F12):**
   - Look for specific error messages
   - Check Network tab for failed requests

---

## 📝 Quick Checklist

- [ ] Docker containers are running
- [ ] HTML file is served from HTTP server (not `file://`)
- [ ] Browser opens `http://localhost:8000/chatbot-test-ui.html`
- [ ] No errors in browser console (F12)
- [ ] API endpoint is correct: `http://localhost:8001/v1/chat/completions`
- [ ] CORS is enabled in `settings-prod.yaml`

---

## 🎯 One-Command Start (PowerShell)

Create a file `start-chatbot.ps1`:
```powershell
cd "E:\FarnquciaBoost AI-chat-bot\Private_GPT\private-gpt"
Start-Process "http://localhost:8000/chatbot-test-ui.html"
python serve-chatbot.py
```

Then just run:
```powershell
.\start-chatbot.ps1
```

---

**Happy Chatting! 🤖**

