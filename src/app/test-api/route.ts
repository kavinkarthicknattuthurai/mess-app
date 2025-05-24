import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets-config';

// Initialize Google Sheets API with service account credentials
const auth = new JWT({
  email: GOOGLE_SHEETS_CONFIG.credentials.client_email,
  key: GOOGLE_SHEETS_CONFIG.credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = GOOGLE_SHEETS_CONFIG.spreadsheetId;
const SHEET_NAME = GOOGLE_SHEETS_CONFIG.sheetName;

export async function GET() {
  try {
    // First test if we can access the spreadsheet
    console.log(`Testing access to spreadsheet: ${SPREADSHEET_ID}`);
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    // Get the list of sheets in the spreadsheet
    const sheetsList = spreadsheetResponse.data.sheets?.map(sheet => 
      sheet.properties?.title
    ) || [];
    
    // Check if our target sheet exists
    const sheetExists = sheetsList.includes(SHEET_NAME);
    
    // Add test data to the sheet
    let appendResult = null;
    if (sheetExists) {
      const testData = [
        new Date().toISOString(),
        'Test Student from API',
        'TEST-API-001',
        'June',
        JSON.stringify({
          'Week 1 - Monday': 'Option A',
          'Week 1 - Tuesday': 'Option B',
        }),
        'Submitted via API Test'
      ];
      
      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:F`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [testData],
        },
      });
      
      appendResult = appendResponse.data;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Google Sheets test successful',
      spreadsheetTitle: spreadsheetResponse.data.properties?.title,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
      sheets: sheetsList,
      targetSheetExists: sheetExists,
      appendResult: appendResult
    });
    
  } catch (error: any) {
    console.error('Google Sheets test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      code: error.code
    }, { status: 500 });
  }
}
