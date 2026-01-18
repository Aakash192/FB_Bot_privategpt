# Security Features Documentation

## Overview
The chatbot lead management system now includes comprehensive security measures to prevent spam attacks and unauthorized data submissions.

## Security Layers Implemented

### 1. WordPress Nonce Verification
**What it does**: Generates a unique token for each session that expires after 5 minutes.

**How it works**:
- Chatbot requests a nonce from `/wp-json/pgpt/v1/nonce` on page load
- Nonce is automatically refreshed every 4 minutes
- Every form submission must include a valid nonce
- WordPress verifies the nonce before processing the request

**Protection**: Prevents CSRF (Cross-Site Request Forgery) attacks

### 2. Honeypot Field
**What it does**: Invisible field that catches bots.

**How it works**:
- A hidden `website` field is included in all submissions
- Field should always be empty (legitimate users never see it)
- Bots typically fill all fields automatically
- If field has a value, request is rejected

**Protection**: Prevents automated bot submissions

### 3. Timestamp Validation
**What it does**: Ensures requests are recent and not replayed.

**How it works**:
- Timestamp is sent with each nonce
- Server checks if request is within 5-minute window
- Prevents replay attacks (reusing old requests)

**Protection**: Stops attackers from reusing captured requests

### 4. Rate Limiting
**What it does**: Limits number of submissions per IP address.

**Rate Limits**:
- **CREATE operations**: 3 submissions per hour per IP
- **UPDATE operations**: 10 updates per hour per IP

**How it works**:
- Uses WordPress transients to track submission counts
- Stores count for each IP address
- Returns 429 error when limit exceeded
- Automatically resets after time window

**Protection**: Prevents spam flooding and DDoS attacks

### 5. Server-Side Validation
**What it does**: Validates all input data before processing.

**Validations**:
- ✅ Name, email, phone required for CREATE
- ✅ Email format validation
- ✅ Data sanitization (removes malicious code)
- ✅ Field length limits
- ✅ Type checking (numbers, strings, etc.)

**Protection**: Prevents injection attacks and invalid data

## Security Flow Diagram

```
User Opens Chatbot
       ↓
Get Security Nonce (/wp-json/pgpt/v1/nonce)
       ↓
User Fills Form
       ↓
Submit with: name, email, phone, nonce, timestamp, honeypot
       ↓
WordPress Endpoint (/wp-json/pgpt/v1/lead)
       ↓
┌─────────────────────────────────┐
│ SECURITY CHECKS (in order):    │
│                                 │
│ 1. ✓ Verify Nonce              │
│ 2. ✓ Check Honeypot (empty?)   │
│ 3. ✓ Validate Timestamp         │
│ 4. ✓ Check Rate Limit          │
│ 5. ✓ Validate Data              │
└─────────────────────────────────┘
       ↓
   All Passed?
       ↓
Send to Google Sheets
       ↓
Return Success
```

## HTTP Status Codes

| Code | Meaning | When It Happens |
|------|---------|----------------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Missing required fields or invalid data |
| 403 | Forbidden | Invalid nonce, honeypot filled, or expired timestamp |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Failed to connect to Google Sheets |

## Configuration

### Adjusting Rate Limits

Edit in `wordpress-functions-updated.php`:

```php
$limits = array(
    'CREATE' => array('max' => 3, 'window' => 3600),  // Change these values
    'UPDATE' => array('max' => 10, 'window' => 3600)  // Change these values
);
```

- `max`: Maximum number of requests
- `window`: Time window in seconds (3600 = 1 hour)

### Adjusting Timestamp Window

```php
if ($time_diff > 300 || $time_diff < 0) { // Change 300 (5 minutes)
```

### Nonce Refresh Interval

In `chatbot-test-ui.html`:

```javascript
setInterval(getSecurityNonce, 240000); // 240000ms = 4 minutes
```

## Testing Security

### Test 1: Valid Submission
```javascript
// Should succeed
fetch('/wp-json/pgpt/v1/lead', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        operation: 'CREATE',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        nonce: securityNonce,
        timestamp: nonceTimestamp,
        website: ''
    })
})
```

### Test 2: Invalid Nonce (Should Fail)
```javascript
// Should return 403
fetch('/wp-json/pgpt/v1/lead', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        operation: 'CREATE',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        nonce: 'invalid_nonce',
        timestamp: Date.now(),
        website: ''
    })
})
```

### Test 3: Honeypot Filled (Should Fail)
```javascript
// Should return 403
fetch('/wp-json/pgpt/v1/lead', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        operation: 'CREATE',
        name: 'Bot',
        email: 'bot@spam.com',
        phone: '0000000000',
        nonce: securityNonce,
        timestamp: nonceTimestamp,
        website: 'http://spam.com' // Filled = bot detected
    })
})
```

### Test 4: Rate Limit (Should Fail After 3 Attempts)
```javascript
// Run this 4 times quickly
for (let i = 0; i < 4; i++) {
    fetch('/wp-json/pgpt/v1/lead', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            operation: 'CREATE',
            name: 'Test ' + i,
            email: 'test' + i + '@example.com',
            phone: '123456789' + i,
            nonce: securityNonce,
            timestamp: nonceTimestamp,
            website: ''
        })
    }).then(r => r.json()).then(console.log);
}
// 4th attempt should return: 429 Rate limit exceeded
```

### Test 5: Expired Timestamp (Should Fail)
```javascript
// Should return 403
fetch('/wp-json/pgpt/v1/lead', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        operation: 'CREATE',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        nonce: securityNonce,
        timestamp: Date.now() - 600000, // 10 minutes ago (expired)
        website: ''
    })
})
```

## Monitoring

### Check Rate Limit Status

In WordPress database, check transients:

```sql
SELECT * FROM wp_options 
WHERE option_name LIKE '_transient_pgpt_rate_limit_%';
```

### Clear Rate Limits

If you need to reset rate limits for testing:

```sql
DELETE FROM wp_options 
WHERE option_name LIKE '_transient_pgpt_rate_limit_%';
```

Or in PHP:

```php
// Clear all rate limits
global $wpdb;
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_pgpt_rate_limit_%'");
```

## Error Messages

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Invalid security token" | Nonce verification failed | Refresh page to get new nonce |
| "Invalid submission" | Honeypot field was filled | Check for bot behavior |
| "Request expired" | Timestamp too old/future | Refresh page or check system time |
| "Rate limit exceeded" | Too many requests | Wait 1 hour or clear transient |
| "Name, email, and phone are required" | Missing fields | Provide all required fields |
| "Invalid email address" | Email format wrong | Check email format |

## Best Practices

### For Production

1. **Enable HTTPS** - Always use SSL/TLS
2. **Monitor logs** - Check for unusual patterns
3. **Backup data** - Regular Google Sheets backups
4. **Update limits** - Adjust based on legitimate traffic
5. **IP whitelist** - Consider whitelisting known IPs for admin actions

### For Development

1. **Increase limits** - Higher limits for testing
2. **Longer timestamp window** - Easier debugging
3. **Log all rejections** - See what's being blocked
4. **Test all scenarios** - Use provided test cases

## Additional Security (Optional)

### Add reCAPTCHA

For even stronger protection, consider adding Google reCAPTCHA v3:

1. Get reCAPTCHA keys from Google
2. Add to HTML form
3. Verify in WordPress endpoint

### IP Blacklist

Block known bad IPs:

```php
$blacklist = ['1.2.3.4', '5.6.7.8'];
if (in_array($ip_address, $blacklist)) {
    return new WP_REST_Response(['success' => false, 'message' => 'Access denied'], 403);
}
```

### Email Verification

Send verification email before storing:

```php
// Generate verification token
$token = wp_generate_password(32, false);
set_transient('pgpt_verify_' . $email, $token, 3600);

// Send email with verification link
wp_mail($email, 'Verify Your Email', 'Click here: ' . site_url('/verify?token=' . $token));
```

## Summary

✅ **4 Layers of Security** active
✅ **Rate limiting** prevents spam
✅ **Nonce verification** prevents CSRF
✅ **Honeypot** catches bots
✅ **Timestamp validation** prevents replay attacks
✅ **Server-side validation** ensures data integrity

Your chatbot is now protected against:
- 🛡️ Spam bots
- 🛡️ DDoS attacks
- 🛡️ CSRF attacks
- 🛡️ Replay attacks
- 🛡️ Injection attacks
- 🛡️ Invalid data submissions

## Support

If you encounter security issues:
1. Check browser console for error messages
2. Verify nonce is being fetched successfully
3. Check rate limit hasn't been exceeded
4. Review WordPress debug.log
5. Test with security checks disabled (for debugging only)
