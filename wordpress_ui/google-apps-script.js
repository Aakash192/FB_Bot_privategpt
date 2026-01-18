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

function doPost(e) {
  try {
    // Open your Google Sheet
    const sheet = SpreadsheetApp
      .openById('1tteWp6PANsUIuzvNsrDKhovG5HYfWWoBejF6MXqhnlg')
      .getSheetByName('Sheet1');  // Change 'Sheet1' if your sheet has a different name
    
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Append new row with lead data
    sheet.appendRow([
      data.lead_id,
      data.name,
      data.email,
      data.phone || '',
      data.time
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'ok', 
        lead_id: data.lead_id,
        message: 'Lead saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
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
