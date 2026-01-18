/**
 * Google Apps Script for Lead Management with Updates
 * Deploy as Web App with "Execute as: Me" and "Who has access: Anyone"
 * 
 * Handles both CREATE and UPDATE operations for leads in Google Sheets
 */

// Handle OPTIONS request for CORS
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '86400');
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Lead Management API is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}

// Handle POST requests (for creating/updating leads)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const operation = data.operation || 'CREATE'; // CREATE or UPDATE
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    
    if (!sheet) {
      throw new Error('Sheet1 not found');
    }
    
    let result;
    
    if (operation === 'CREATE') {
      // Create new lead record
      result = createLead(sheet, data);
    } else if (operation === 'UPDATE') {
      // Update existing lead record
      result = updateLead(sheet, data);
    } else {
      throw new Error('Invalid operation. Use CREATE or UPDATE');
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// Create a new lead record
function createLead(sheet, data) {
  const timestamp = data.time || new Date().toISOString();
  
  // Column order: Lead ID | Name | Email | Phone | Timestamp | Lead Score | Priority | Feedback | Attraction
  const row = [
    data.lead_id || '',
    data.name || '',
    data.email || '',
    data.phone || '',
    timestamp,
    data.lead_score || '',
    data.priority || '',
    data.feedback || '',
    data.attraction || ''
  ];
  
  sheet.appendRow(row);
  
  return {
    status: 'success',
    message: 'Lead created successfully',
    operation: 'CREATE',
    lead_id: data.lead_id,
    timestamp: timestamp
  };
}

// Update an existing lead record
function updateLead(sheet, data) {
  const leadId = data.lead_id;
  
  if (!leadId) {
    throw new Error('lead_id is required for UPDATE operation');
  }
  
  // Find the row with matching lead_id (Column A)
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) { // Skip header row
    if (values[i][0] === leadId) {
      rowIndex = i + 1; // +1 because sheet rows are 1-indexed
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error('Lead ID not found: ' + leadId);
  }
  
  // Update specific columns if provided
  // Column F = Lead Score (index 6)
  // Column G = Priority (index 7)
  // Column H = Feedback (index 8)
  // Column I = Attraction (index 9)
  
  if (data.lead_score !== undefined) {
    sheet.getRange(rowIndex, 6).setValue(data.lead_score);
  }
  
  if (data.priority !== undefined) {
    sheet.getRange(rowIndex, 7).setValue(data.priority);
  }
  
  if (data.feedback !== undefined) {
    sheet.getRange(rowIndex, 8).setValue(data.feedback);
  }
  
  if (data.attraction !== undefined) {
    sheet.getRange(rowIndex, 9).setValue(data.attraction);
  }
  
  return {
    status: 'success',
    message: 'Lead updated successfully',
    operation: 'UPDATE',
    lead_id: leadId,
    row: rowIndex,
    timestamp: new Date().toISOString()
  };
}
