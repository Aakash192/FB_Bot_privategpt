<?php
/**
 * WordPress functions.php snippet for Lead Management with Security
 * 
 * Add this to your theme's functions.php or a custom plugin
 * Handles both CREATE and UPDATE operations for leads with rate limiting and validation
 */

// Register REST API endpoint for lead management
add_action('rest_api_init', function () {
    // Create/Update lead endpoint
    register_rest_route('pgpt/v1', '/lead', array(
        'methods' => 'POST',
        'callback' => 'pgpt_store_lead',
        'permission_callback' => '__return_true'
    ));
    
    // Nonce generation endpoint
    register_rest_route('pgpt/v1', '/nonce', array(
        'methods' => 'GET',
        'callback' => 'pgpt_get_nonce',
        'permission_callback' => '__return_true'
    ));
});

/**
 * Generate security nonce for form submissions
 */
function pgpt_get_nonce() {
    $nonce = wp_create_nonce('pgpt_lead_form');
    return new WP_REST_Response(array(
        'success' => true,
        'nonce' => $nonce,
        'timestamp' => time()
    ), 200);
}

/**
 * Check rate limiting for IP address
 */
function pgpt_check_rate_limit($ip_address, $operation) {
    $transient_key = 'pgpt_rate_limit_' . md5($ip_address);
    $attempts = get_transient($transient_key);
    
    // Rate limits based on operation
    $limits = array(
        'CREATE' => array('max' => 3, 'window' => 3600), // 3 submissions per hour
        'UPDATE' => array('max' => 10, 'window' => 3600)  // 10 updates per hour
    );
    
    $limit = isset($limits[$operation]) ? $limits[$operation] : $limits['CREATE'];
    
    if ($attempts === false) {
        // First attempt
        set_transient($transient_key, 1, $limit['window']);
        return true;
    }
    
    if ($attempts >= $limit['max']) {
        return false; // Rate limit exceeded
    }
    
    // Increment attempts
    set_transient($transient_key, $attempts + 1, $limit['window']);
    return true;
}

/**
 * Validate honeypot field (spam bot detection)
 */
function pgpt_validate_honeypot($honeypot_value) {
    // Honeypot field should be empty (bots usually fill all fields)
    return empty($honeypot_value);
}

/**
 * Store or update lead information
 * Endpoint: /wp-json/pgpt/v1/lead
 */
function pgpt_store_lead($request) {
    $params = $request->get_json_params();
    
    // Get client IP address
    $ip_address = $_SERVER['REMOTE_ADDR'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip_address = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    }
    
    // Extract parameters
    $operation = isset($params['operation']) ? sanitize_text_field($params['operation']) : 'CREATE';
    $nonce = isset($params['nonce']) ? sanitize_text_field($params['nonce']) : '';
    $honeypot = isset($params['website']) ? sanitize_text_field($params['website']) : '';
    $timestamp = isset($params['timestamp']) ? intval($params['timestamp']) : 0;
    
    // Security Check 1: Verify nonce
    if (!wp_verify_nonce($nonce, 'pgpt_lead_form')) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Invalid security token'
        ), 403);
    }
    
    // Security Check 2: Validate honeypot (anti-bot)
    if (!pgpt_validate_honeypot($honeypot)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Invalid submission'
        ), 403);
    }
    
    // Security Check 3: Check timestamp (prevent replay attacks)
    $time_diff = time() - $timestamp;
    if ($time_diff > 300 || $time_diff < 0) { // 5 minutes window
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Request expired'
        ), 403);
    }
    
    // Security Check 4: Rate limiting
    if (!pgpt_check_rate_limit($ip_address, $operation)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Rate limit exceeded. Please try again later.'
        ), 429);
    }
    
    // Extract and validate lead data
    $lead_id = isset($params['lead_id']) ? sanitize_text_field($params['lead_id']) : '';
    $name = isset($params['name']) ? sanitize_text_field($params['name']) : '';
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';
    $phone = isset($params['phone']) ? sanitize_text_field($params['phone']) : '';
    $lead_score = isset($params['lead_score']) ? intval($params['lead_score']) : null;
    $priority = isset($params['priority']) ? sanitize_text_field($params['priority']) : '';
    $feedback = isset($params['feedback']) ? sanitize_text_field($params['feedback']) : '';
    $attraction = isset($params['attraction']) ? sanitize_textarea_field($params['attraction']) : '';
    
    // Validate required fields for CREATE operation
    if ($operation === 'CREATE') {
        if (empty($name) || empty($email) || empty($phone)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Name, email, and phone are required'
            ), 400);
        }
        
        // Validate email format
        if (!is_email($email)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Invalid email address'
            ), 400);
        }
    }
    
    // Generate lead_id if creating new lead
    if ($operation === 'CREATE' && empty($lead_id)) {
        $lead_id = 'lead_' . time() . '_' . wp_generate_password(8, false);
    }
    
    // Prepare data for Google Sheets
    $data = array(
        'operation' => $operation,
        'lead_id' => $lead_id,
        'time' => current_time('mysql')
    );
    
    // Add fields based on operation
    if ($operation === 'CREATE') {
        $data['name'] = $name;
        $data['email'] = $email;
        $data['phone'] = $phone;
    } else if ($operation === 'UPDATE') {
        // Only include fields that are being updated
        if ($lead_score !== null) {
            $data['lead_score'] = $lead_score;
        }
        if (!empty($priority)) {
            $data['priority'] = $priority;
        }
        if (!empty($feedback)) {
            $data['feedback'] = $feedback;
        }
        if (!empty($attraction)) {
            $data['attraction'] = $attraction;
        }
    }
    
    // Send to Google Apps Script
    $google_script_url = 'https://script.google.com/macros/s/AKfycbx4t8EZmEj4X-2i2NZqwsl9PZsMBONm60tzYt3lRlVkPjFwMVx_jd8ZVCr4tXXgJg9M/exec';
    
    $response = wp_remote_post($google_script_url, array(
        'method' => 'POST',
        'timeout' => 15,
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode($data)
    ));
    
    if (is_wp_error($response)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Failed to connect to Google Sheets',
            'error' => $response->get_error_message()
        ), 500);
    }
    
    $body = wp_remote_retrieve_body($response);
    $result = json_decode($body, true);
    
    // Return response
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    return new WP_REST_Response(array(
        'success' => true,
        'lead_id' => $lead_id,
        'operation' => $operation,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'google_response' => $result
    ), 200);
}
