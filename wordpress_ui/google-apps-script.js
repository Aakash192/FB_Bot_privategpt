/**
 * Google Apps Script for PrivateGPT Chatbot Lead Capture
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1tteWp6PANsUIuzvNsrDKhovG5HYfWWoBejF6MXqhnlg/edit
 * 2. Go to Extensions → Apps Script
 * 3. Replace all code with this script
 * 4. Click Deploy → New deployment
 * 5. Select "Web app" type
 * 6. Set "Execute as: Me" and "Who has access: Anyone"
 * 7. Click Deploy and authorize the script
 * 
 * SHEET STRUCTURE:
 * Your sheet should have these columns in Row 1:
 * Lead ID | Name | Email | Phone | Timestamp
 */

// Handle OPTIONS request for CORS preflight
function doOptions(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.TEXT);
  output.setContent('');
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.setHeader('Access-Control-Max-Age', '86400');
  return output;
}

// Handle GET requests (optional - for testing)
function doGet(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify({ 
    status: 'ok',
    message: 'Google Apps Script is running. Use POST to submit data.',
    timestamp: new Date().toISOString()
  }));
  output.setHeader('Access-Control-Allow-Origin', '*');
  return output;
}

// Handle POST request to save lead data
function doPost(e) {
  try {
    // Open your Google Sheet
    var sheet = SpreadsheetApp
      .openById('1tteWp6PANsUIuzvNsrDKhovG5HYfWWoBejF6MXqhnlg')
      .getSheetByName('Sheet1');  // Change 'Sheet1' if your sheet has a different name
    
    // Parse incoming data
    var data = JSON.parse(e.postData.contents);
    
    // Append new row with lead data
    sheet.appendRow([
      data.lead_id,
      data.name,
      data.email,
      data.phone || '',
      data.time
    ]);
    
    // Return success response with CORS headers
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify({ 
      status: 'ok', 
      lead_id: data.lead_id,
      message: 'Lead saved successfully'
    }));
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return output;
      
  } catch (error) {
    // Return error response with CORS headers
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    }));
    output.setHeader('Access-Control-Allow-Origin', '*');
    return output;
  }
}

/**
 * Optional: Test function
 * Run this from the Apps Script editor to test if it works
 */
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        lead_id: 'test_' + new Date().getTime(),
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        time: new Date().toISOString()
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result.getContent());
}
