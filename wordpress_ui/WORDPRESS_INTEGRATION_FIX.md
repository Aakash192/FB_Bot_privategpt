# WordPress Chatbot Integration Guide

## Problem
If you're seeing PHP code when clicking "Sign In", it means the chatbot HTML file is being opened directly (file://) instead of being integrated into WordPress.

## Solution: Two Methods

### Method 1: Simple - Use WPCode Plugin (RECOMMENDED)

1. **Install WPCode Plugin**:
   - Go to WordPress Admin → Plugins → Add New
   - Search for "WPCode"
   - Install and activate

2. **Add Chatbot Code**:
   - Go to WPCode → Add Snippet
   - Choose "Add Your Custom Code"
   - Select "HTML Snippet"
   - Paste the ENTIRE content from `chatbot-test-ui.html` (everything from `<style>` to `</script>`)
   - Location: "Site Wide Footer" (so it appears on all pages)
   - Activate the snippet

3. **Done!** The chatbot will now appear on all pages with full WordPress integration.

### Method 2: Manual - Add to Theme

1. **Edit Theme Footer**:
   - Go to Appearance → Theme File Editor
   - Select `footer.php`
   - Before the closing `</body>` tag, paste the chatbot code

2. **What to Paste**:
   ```html
   <!-- Chatbot Integration -->
   <?php
   // Include chatbot HTML
   include(get_template_directory() . '/chatbot-embed.html');
   ?>
   ```

3. **Create chatbot-embed.html**:
   - In your theme folder, create `chatbot-embed.html`
   - Copy ENTIRE content from `chatbot-test-ui.html`

### Method 3: Use Plugin (Custom)

Create a custom WordPress plugin:

1. **Create Plugin File**:
   - Create folder: `wp-content/plugins/pgpt-chatbot/`
   - Create file: `pgpt-chatbot.php`

2. **Plugin Code**:
```php
<?php
/**
 * Plugin Name: Private GPT Chatbot
 * Description: AI Chatbot with Lead Management
 * Version: 1.0
 */

// Add chatbot to footer
function pgpt_add_chatbot_to_footer() {
    include(plugin_dir_path(__FILE__) . 'chatbot.html');
}
add_action('wp_footer', 'pgpt_add_chatbot_to_footer');
```

3. **Add Chatbot File**:
   - In same folder, create `chatbot.html`
   - Copy content from `chatbot-test-ui.html`

4. **Activate**:
   - Go to Plugins → Activate "Private GPT Chatbot"

## Verification

After integration, verify:
- ✅ Chatbot bubble appears on website
- ✅ Clicking "Sign In" shows form (not PHP code)
- ✅ Browser console shows no errors
- ✅ REST API endpoint accessible: `yoursite.com/wp-json/pgpt/v1/lead`

## Current Setup Status

Based on your screenshot, you need to:

1. **Add Lead Management Functions** (ALREADY DONE ✅):
   - The code from `wordpress-functions-updated.php` is already in your functions.php
   - Google Script URL is set

2. **Integrate Chatbot** (TO DO ⚠️):
   - Choose one of the methods above
   - **Recommended**: Use WPCode plugin method (easiest)

## Quick Test

After integration, test the API endpoint:

1. Open browser console (F12)
2. Run this command:
```javascript
fetch('/wp-json/pgpt/v1/lead', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        operation: 'CREATE',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890'
    })
})
.then(r => r.json())
.then(console.log);
```

3. Expected response:
```json
{
    "success": true,
    "lead_id": "lead_1234567890_abc123",
    "operation": "CREATE",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890"
}
```

## Troubleshooting

### Issue: Still seeing PHP code
**Solution**: Clear browser cache and WordPress cache

### Issue: Chatbot not appearing
**Solution**: Check browser console for JavaScript errors

### Issue: REST API 404 error
**Solution**: 
- Go to Settings → Permalinks
- Click "Save Changes" (flushes rewrite rules)
- Test endpoint again

### Issue: CORS errors
**Solution**: Functions.php already includes CORS headers, should work fine

## Next Steps

1. Choose integration method (WPCode recommended)
2. Implement integration
3. Test sign-in functionality
4. Test BANT flow
5. Verify Google Sheet updates

## Files You Need

- ✅ `wordpress-functions-updated.php` - Already added to functions.php
- ⚠️ `chatbot-test-ui.html` - Needs to be integrated (not opened directly)
- ✅ `google-apps-script-updated.js` - Already deployed

## Important Notes

⚠️ **DO NOT** open `chatbot-test-ui.html` directly in browser
✅ **DO** integrate it into WordPress using one of the methods above

The chatbot MUST be loaded through WordPress to access the REST API endpoints.
