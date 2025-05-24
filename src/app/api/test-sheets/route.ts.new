import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets-config';

// Function to check Google Sheets configuration
async function checkGoogleSheetsConfig() {
  try {
    // Use the spreadsheet ID from the shared config
    const spreadsheetId = GOOGLE_SHEETS_CONFIG.spreadsheetId;
    
    if (!spreadsheetId) {
      throw new Error('No spreadsheet ID configured');
    }
    
    console.log('Initializing Google Sheets API with config:', {
      clientEmail: GOOGLE_SHEETS_CONFIG.credentials.client_email,
      hasPrivateKey: !!GOOGLE_SHEETS_CONFIG.credentials.private_key,
      spreadsheetId
    });

    // Initialize Google Sheets API using JWT auth
    const auth = new JWT({
      email: GOOGLE_SHEETS_CONFIG.credentials.client_email,
      key: GOOGLE_SHEETS_CONFIG.credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('Attempting to access spreadsheet:', spreadsheetId);
    
    // Try to access the spreadsheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    // Try to read some data from the sheet
    const sheetName = 'June Menu Selections';
    const range = `${sheetName}!A1:E10`; // Read first 10 rows, first 5 columns
    
    const valuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    
    // Try to list sheets to verify access
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });
    
    return {
      success: true,
      spreadsheetTitle: response.data.properties?.title,
      spreadsheetId,
      sheetData: {
        range,
        values: valuesResponse.data.values || [],
        firstFewRows: valuesResponse.data.values?.slice(0, 5) || []
      },
      sheets: sheetsResponse.data.sheets?.map(sheet => ({
        title: sheet.properties?.title,
        sheetId: sheet.properties?.sheetId,
        sheetType: sheet.properties?.sheetType,
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount,
      })) || [],
      serviceAccount: GOOGLE_SHEETS_CONFIG.credentials.client_email,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error in checkGoogleSheetsConfig:', {
      message: error.message,
      code: error.code,
      errors: error.errors,
      stack: error.stack
    });
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      status: error.status,
      details: error.errors || [],
      timestamp: new Date().toISOString(),
      troubleshooting: [
        'Make sure the spreadsheet exists and is accessible',
        'Check that your service account has edit access to the spreadsheet',
        'Verify your environment variables are set correctly',
        'Check the server logs for more detailed error information'
      ]
    };
  }
}

export async function GET() {
  try {
    const result = await checkGoogleSheetsConfig();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in API route:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
