<?php
/**
 * PrivateGPT Chatbot - Lead Capture Integration
 * Connects to Google Sheets for lead storage
 * 
 * INSTALLATION INSTRUCTIONS:
 * Add this code to your WordPress theme's functions.php file
 * OR create a custom plugin and activate it
 */

// Register REST API endpoint for lead capture
add_action('rest_api_init', function () {
    register_rest_route('pgpt/v1', '/lead', [
        'methods'  => 'POST',
        'callback' => 'pgpt_store_lead',
        'permission_callback' => '__return_true', // Allow public access
        'args' => [
            'name' => [
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'email' => [
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_email',
                'validate_callback' => function($param) {
                    return is_email($param);
                }
            ],
            'phone' => [
                'required' => false,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ]
        ]
    ]);
});

/**
 * Handle lead submission and send to Google Sheets
 */
function pgpt_store_lead(WP_REST_Request $request) {
    // Get sanitized parameters
    $params = $request->get_json_params();
    
    $name  = sanitize_text_field($params['name']);
    $email = sanitize_email($params['email']);
    $phone = isset($params['phone']) ? sanitize_text_field($params['phone']) : '';
    
    // Validate email
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Invalid email address', ['status' => 400]);
    }
    
    // Generate unique lead ID
    $lead_id = uniqid('lead_', true);
    
    // Get current timestamp in WordPress timezone
    $timestamp = current_time('mysql');
    
    // Prepare data for Google Sheets
    $sheet_data = [
        'lead_id' => $lead_id,
        'name'    => $name,
        'email'   => $email,
        'phone'   => $phone,
        'time'    => $timestamp
    ];
    
    // Send to Google Sheets via Apps Script Web App
    $google_script_url = 'https://script.google.com/macros/s/AKfycby66ePqrWFA5lsE_iDRje49VuhxK1VBwag3w4AsMOFFx2TCJj6HhdczsuOcqYVMIRAV/exec';
    
    $response = wp_remote_post($google_script_url, [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode($sheet_data),
        'timeout' => 15,
        'sslverify' => true
    ]);
    
    // Log the response for debugging (optional)
    if (is_wp_error($response)) {
        error_log('PGPT Google Sheets Error: ' . $response->get_error_message());
    } else {
        $body = wp_remote_retrieve_body($response);
        error_log('PGPT Google Sheets Response: ' . $body);
    }
    
    // Return success response to frontend
    return new WP_REST_Response([
        'success'  => true,
        'lead_id'  => $lead_id,
        'name'     => $name,
        'email'    => $email,
        'phone'    => $phone,
        'message'  => 'Lead information saved successfully'
    ], 200);
}

/**
 * Add CORS headers for chatbot
 * Allows the chatbot to communicate with WordPress from any domain
 */
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        return $value;
    });
}, 15);

/**
 * Optional: Add admin menu to view lead submissions
 * Uncomment the code below if you want to see leads in WordPress admin
 */
/*
add_action('admin_menu', 'pgpt_add_admin_menu');

function pgpt_add_admin_menu() {
    add_menu_page(
        'Chatbot Leads',
        'Chatbot Leads',
        'manage_options',
        'pgpt-leads',
        'pgpt_leads_page',
        'dashicons-format-chat',
        30
    );
}

function pgpt_leads_page() {
    ?>
    <div class="wrap">
        <h1>Chatbot Leads</h1>
        <p>All leads are stored in your Google Sheet:</p>
        <a href="https://docs.google.com/spreadsheets/d/1tteWp6PANsUIuzvNsrDKhovG5HYfWWoBejF6MXqhnlg/edit" 
           target="_blank" 
           class="button button-primary">
            View Google Sheet
        </a>
    </div>
    <?php
}
*/
