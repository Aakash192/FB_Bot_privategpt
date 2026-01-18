# Lead Capture Integration Setup Guide

## 📋 Complete Integration Setup

Your chatbot now captures user information before starting the chat and stores it in Google Sheets.

---

## 🔧 WordPress Setup

### Option 1: Add to functions.php (Quick)

1. Go to WordPress Admin → **Appearance → Theme File Editor**
2. Open **functions.php**
3. Copy ALL code from `wordpress-functions.php` and paste it at the end
4. Click **Update File**

### Option 2: Create Custom Plugin (Recommended)

1. Create folder: `wp-content/plugins/pgpt-lead-capture/`
2. Create file: `pgpt-lead-capture.php` with this content:

```php
<?php
/**
 * Plugin Name: PrivateGPT Lead Capture
 * Description: Captures chatbot leads and sends to Google Sheets
 * Version: 1.0.0
 * Author: Your Name
 */

// Paste the code from wordpress-functions.php here
?>
```

3. Go to **Plugins** and activate "PrivateGPT Lead Capture"

---

## 📊 Google Sheets Setup

### 1. Prepare Your Sheet

Open: https://docs.google.com/spreadsheets/d/1tteWp6PANsUIuzvNsrDKhovG5HYfWWoBejF6MXqhnlg/edit

**Add these column headers in Row 1:**
- Lead ID
- Name
- Email
- Phone
- Timestamp

### 2. Add Apps Script

1. In your Google Sheet: **Extensions → Apps Script**
2. Delete any existing code
3. Copy ALL code from `google-apps-script.js`
4. Paste it into the Apps Script editor
5. Click **Save** (💾 icon)

### 3. Deploy the Script

1. Click **Deploy → New deployment**
2. Click ⚙️ gear icon → Select **Web app**
3. Configure:
   - **Description:** Chatbot Lead Capture
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. Click **Authorize access**
6. Select your Google account
7. Click **Advanced → Go to [Your Project]**
8. Click **Allow**

✅ **Your Web App URL is already configured:**
```
https://script.google.com/macros/s/AKfycby66ePqrWFA5lsE_iDRje49VuhxK1VBwag3w4AsMOFFx2TCJj6HhdczsuOcqYVMIRAV/exec
```

---

## 🧪 Testing

### Test the Full Flow:

1. Open your chatbot page
2. Pre-chat modal should appear
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
4. Click "Start Chat"
5. Check your Google Sheet - new row should appear!

### Test Google Script Directly:

Run this in terminal (PowerShell):

```powershell
$body = @{
    lead_id = "test_123"
    name = "Test User"
    email = "test@example.com"
    phone = "1234567890"
    time = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://script.google.com/macros/s/AKfycby66ePqrWFA5lsE_iDRje49VuhxK1VBwag3w4AsMOFFx2TCJj6HhdczsuOcqYVMIRAV/exec" -Method POST -Body $body -ContentType "application/json"
```

### Test WordPress Endpoint:

```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    phone = "1234567890"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://your-wordpress-site.com/wp-json/pgpt/v1/lead" -Method POST -Body $body -ContentType "application/json"
```

---

## 🔍 Troubleshooting

### Issue: Modal doesn't appear
- Clear browser cache
- Check browser console for errors
- Verify `chatbot-test-ui.html` was updated correctly

### Issue: "Unable to connect to server"
- Check WordPress REST API is enabled
- Verify `wordpress-functions.php` code is added
- Test endpoint: `https://your-site.com/wp-json/pgpt/v1/lead`

### Issue: Data not appearing in Google Sheet
- Verify Apps Script is deployed
- Check deployment has "Who has access: Anyone"
- Run the test function in Apps Script editor
- Check Apps Script execution logs

### Enable WordPress Debug Logging:

Add to `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Check logs in: `wp-content/debug.log`

---

## ✅ What's Working Now

1. ✅ Pre-chat modal appears on page load
2. ✅ User must sign in before chatting
3. ✅ Data validates (email format, required fields)
4. ✅ Lead info sent to WordPress REST API
5. ✅ WordPress forwards to Google Sheets
6. ✅ User gets personalized welcome message
7. ✅ All chat messages include user context for tracking

---

## 📊 Data Flow

```
User fills form → Frontend validates → POST to WordPress REST API
                                              ↓
                        WordPress saves & forwards to Google Sheets
                                              ↓
                            Returns lead_id to frontend
                                              ↓
                        Chat enabled with user context
```

---

## 🔐 Security Notes

✅ **Implemented:**
- Input sanitization (WordPress)
- Email validation
- CORS headers configured
- Unique lead IDs generated
- Privacy consent notice displayed

⚠️ **Recommendations:**
- Add reCAPTCHA for spam protection
- Implement rate limiting
- Consider GDPR compliance (privacy policy link)
- Add data retention policy

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Check WordPress debug log
3. Check Google Apps Script execution logs
4. Verify all URLs are correct
5. Test each component individually

---

**Setup Complete! 🎉**
