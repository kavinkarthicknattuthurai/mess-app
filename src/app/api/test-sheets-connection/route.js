import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets-config';

export async function GET() {
  try {
    // Detailed response object to return diagnostic info
    const diagnostics = {
      success: false,
      config: {
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
        clientEmail: GOOGLE_SHEETS_CONFIG.credentials.client_email,
      },
      steps: [],
      error: null,
      availableSheets: [],
      data: null
    };

    // Step 1: Initialize the client
    try {
      diagnostics.steps.push({ name: 'Initialize JWT client', status: 'attempting' });
      
      const credentials = GOOGLE_SHEETS_CONFIG.credentials;
      const client = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      diagnostics.steps[0].status = 'success';
      diagnostics.steps.push({ name: 'Authorize client', status: 'attempting' });
      
      // Step 2: Authorize
      await client.authorize();
      diagnostics.steps[1].status = 'success';
      
      // Step 3: Initialize sheets API
      diagnostics.steps.push({ name: 'Initialize sheets API', status: 'attempting' });
      const sheets = google.sheets({ version: 'v4', auth: client });
      diagnostics.steps[2].status = 'success';
      
      // Step 4: Check if spreadsheet exists
      diagnostics.steps.push({ name: 'Access spreadsheet', status: 'attempting' });
      const spreadsheetId = GOOGLE_SHEETS_CONFIG.spreadsheetId;
      
      try {
        const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
        diagnostics.steps[3].status = 'success';
        
        // Step 5: List available sheets
        diagnostics.steps.push({ name: 'List available sheets', status: 'attempting' });
        if (sheetInfo && sheetInfo.data && sheetInfo.data.sheets) {
          diagnostics.availableSheets = sheetInfo.data.sheets.map(s => s.properties.title);
          diagnostics.steps[4].status = 'success';
          
          // Step 6: Check if our target sheet exists
          const sheetName = GOOGLE_SHEETS_CONFIG.sheetName;
          diagnostics.steps.push({ name: 'Check if target sheet exists', status: 'attempting' });
          const sheetExists = sheetInfo.data.sheets.some(
            (sheet) => sheet.properties.title === sheetName
          );
          
          if (sheetExists) {
            diagnostics.steps[5].status = 'success';
            
            // Step 7: Attempt to read data
            diagnostics.steps.push({ name: 'Read sheet data', status: 'attempting' });
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId,
              range: `${sheetName}!A:Z`,
            });
            
            const rows = response.data.values || [];
            if (rows.length > 0) {
              diagnostics.steps[6].status = 'success';
              diagnostics.data = {
                rowCount: rows.length,
                headers: rows[0],
                sampleRows: rows.slice(1, 3) // Just show first two data rows as a sample
              };
              diagnostics.success = true;
            } else {
              diagnostics.steps[6].status = 'warning';
              diagnostics.error = 'Sheet exists but contains no data';
            }
          } else {
            diagnostics.steps[5].status = 'error';
            diagnostics.error = `Sheet '${sheetName}' does not exist in this spreadsheet. Available sheets: ${diagnostics.availableSheets.join(', ')}`;
          }
        } else {
          diagnostics.steps[4].status = 'error';
          diagnostics.error = 'Could not retrieve sheet information from the spreadsheet';
        }
      } catch (sheetError) {
        diagnostics.steps[3].status = 'error';
        
        if (sheetError.code === 404) {
          diagnostics.error = `Spreadsheet with ID '${spreadsheetId}' was not found. Please check if the spreadsheet exists and is shared with the service account.`;
        } else if (sheetError.code === 403) {
          diagnostics.error = `Permission denied for spreadsheet '${spreadsheetId}'. Please ensure the service account has access.`;
        } else {
          diagnostics.error = `Error accessing spreadsheet: ${sheetError.message}`;
        }
      }
    } catch (authError) {
      // Set the last attempted step as failed
      const lastStep = diagnostics.steps[diagnostics.steps.length - 1];
      if (lastStep) {
        lastStep.status = 'error';
      }
      
      diagnostics.error = `Authentication error: ${authError.message}`;
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Unexpected error: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
