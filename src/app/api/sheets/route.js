import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets-config';

// Function to initialize Google Sheets API
async function initGoogleSheetsAPI() {
  try {
    const credentials = GOOGLE_SHEETS_CONFIG.credentials;
    console.log('Using spreadsheet ID:', GOOGLE_SHEETS_CONFIG.spreadsheetId);
    console.log('Using sheet name:', GOOGLE_SHEETS_CONFIG.sheetName);
    
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await client.authorize();
    console.log('Google API client authorized successfully');
    
    const sheets = google.sheets({ version: 'v4', auth: client });
    return { sheets, spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId };
  } catch (error) {
    console.error('Error initializing Google Sheets API:', error);
    console.error('Error details:', error.message);
    if (error.stack) console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Function to get all data from the June sheet
async function getSheetData() {
  try {
    const { sheets, spreadsheetId } = await initGoogleSheetsAPI();
    const sheetName = GOOGLE_SHEETS_CONFIG.sheetName;
    
    console.log('Attempting to access spreadsheet:', spreadsheetId);

    try {
      // First verify the spreadsheet is accessible
      console.log('Checking if spreadsheet exists and is accessible...');
      const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId,
      });
      
      console.log('Spreadsheet accessed successfully');
      console.log('Available sheets:', sheetInfo.data.sheets.map(s => s.properties.title).join(', '));

      // Find if the named sheet exists
      const sheetExists = sheetInfo.data.sheets.some(
        (sheet) => sheet.properties.title === sheetName
      );

      if (!sheetExists) {
        const availableSheets = sheetInfo.data.sheets.map(s => s.properties.title).join(', ');
        console.error(`Sheet '${sheetName}' does not exist. Available sheets: ${availableSheets}`);
        return { data: [], error: `Sheet '${sheetName}' does not exist. Available sheets: ${availableSheets}` };
      }
      
      console.log(`Sheet '${sheetName}' found, attempting to read data...`);

      // Get the data from the sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`, // Get all columns
      });

      console.log('Data retrieved successfully');
      const rows = response.data.values || [];
      console.log(`Found ${rows.length} rows of data (including headers)`);
      
      if (rows.length === 0) {
        return { data: [], error: null };
      }

      // First row contains headers
      const headers = rows[0];
      console.log('Headers found:', headers.join(', '));
      
      const data = rows.slice(1).map(row => {
        const item = {};
        headers.forEach((header, index) => {
          item[header] = row[index] || '';
        });
        return item;
      });

      console.log(`Processed ${data.length} data rows successfully`);
      return { data, error: null };
    } catch (sheetError) {
      if (sheetError.code === 404) {
        console.error('Spreadsheet not found (404):', spreadsheetId);
        return { data: [], error: `Spreadsheet with ID '${spreadsheetId}' was not found. Please check if the spreadsheet exists and is shared with the service account.` };
      }
      
      if (sheetError.code === 403) {
        console.error('Permission denied (403) for spreadsheet:', spreadsheetId);
        return { data: [], error: `Permission denied for spreadsheet '${spreadsheetId}'. Please ensure the service account has access.` };
      }
      
      throw sheetError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error getting sheet data:', error);
    console.error('Error details:', error.message);
    if (error.stack) console.error('Stack trace:', error.stack);
    
    // Create a more informative error message
    let errorMessage = `Failed to access Google Sheet: ${error.message}`;
    if (error.code) {
      errorMessage += ` (Error code: ${error.code})`;
    }
    
    return { data: [], error: errorMessage };
  }
}

// Function to get sheet statistics
async function getSheetStats() {
  try {
    const { data, error } = await getSheetData();
    
    if (error) {
      return { stats: null, error };
    }

    // Calculate statistics
    const totalSubmissions = data.length;
    
    // Count selections by type
    const selectionCounts = {};
    data.forEach(item => {
      // Assuming selections are in columns like "Monday", "Tuesday", etc.
      // and have values like "Veg", "Non-veg", etc.
      Object.keys(item).forEach(key => {
        if (key !== 'timestamp' && key !== 'studentName' && key !== 'studentId' && key !== 'month' && key !== 'status') {
          const value = item[key];
          selectionCounts[key] = selectionCounts[key] || {};
          selectionCounts[key][value] = (selectionCounts[key][value] || 0) + 1;
        }
      });
    });

    return {
      stats: {
        totalSubmissions,
        selectionCounts,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error getting sheet stats:', error);
    return { stats: null, error: error.message };
  }
}

// GET handler for fetching sheet data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'data';
    
    if (action === 'stats') {
      const { stats, error } = await getSheetStats();
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ stats });
    } else {
      const { data, error } = await getSheetData();
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Function to export sheet data as CSV
export async function generateCSV() {
  try {
    const { data, error } = await getSheetData();
    
    if (error) {
      throw new Error(error);
    }
    
    if (data.length === 0) {
      return '';
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] || '';
        // Escape quotes in CSV values
        return `"${val.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
}
