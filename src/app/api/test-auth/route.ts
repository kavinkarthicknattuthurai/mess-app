import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export async function GET() {
  try {
    // Log environment variables (redacted for security)
    console.log('Checking environment variables...');
    console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL present:', !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('GOOGLE_PRIVATE_KEY present:', !!process.env.GOOGLE_PRIVATE_KEY);
    console.log('GOOGLE_SHEETS_ID present:', !!process.env.GOOGLE_SHEETS_ID);
    console.log('GOOGLE_SHEET_NAME present:', !!process.env.GOOGLE_SHEET_NAME);
    
    // Initialize auth with environment variables directly
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    // Try to authorize
    console.log('Attempting to authorize...');
    const credentials = await auth.authorize();
    
    // Test connection to Google Sheets API
    console.log('Connecting to Google Sheets API...');
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Try to get spreadsheet info
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID || '10wToXCkzryk-MuKNx7jhxVMtkiCXokTiQiuWizYci38';
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    // Return success with spreadsheet info
    return NextResponse.json({
      success: true,
      message: 'Google Sheets API connection successful',
      spreadsheetTitle: response.data.properties?.title,
      sheets: response.data.sheets?.map(sheet => ({
        title: sheet.properties?.title,
        sheetId: sheet.properties?.sheetId,
      })),
    });
  } catch (error) {
    console.error('Google Sheets API error:', error);
    
    // Return detailed error for debugging
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to Google Sheets API',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
