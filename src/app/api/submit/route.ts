import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets-config';
import { addSubmission } from '@/lib/firebase-utils';

interface SubmissionData {
  studentName: string;
  studentId: string;
  month: string;
  selections: {
    [key: string]: boolean | string;
  };
}

// Google Sheets configuration from environment variables
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '10wToXCkzryk-MuKNx7jhxVMtkiCXokTiQiuWizYci38';
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'June Menu Selections';

// Initialize Google Sheets API with service account credentials from environment variables
const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || GOOGLE_SHEETS_CONFIG.credentials.client_email,
  key: process.env.GOOGLE_PRIVATE_KEY || GOOGLE_SHEETS_CONFIG.credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Create sheets client
const sheets = google.sheets({ version: 'v4', auth });

// Helper function to validate submission data
function validateSubmissionData(data: SubmissionData): void {
  if (!data.studentName || typeof data.studentName !== 'string') {
    throw new Error('Invalid student name');
  }
  if (!data.studentId || typeof data.studentId !== 'string') {
    throw new Error('Invalid student ID');
  }
  if (!data.month || typeof data.month !== 'string') {
    throw new Error('Invalid month');
  }
  if (!data.selections || typeof data.selections !== 'object') {
    throw new Error('Invalid selections');
  }
}

// Helper function to check if sheet exists and add headers if needed
async function ensureSheetExists(): Promise<void> {
  try {
    console.log('Checking if sheet exists in spreadsheet...');
    
    // Check if the sheet exists
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets.properties.title'
    });
    
    console.log('Available sheets:', JSON.stringify(sheetsResponse.data.sheets?.map(s => s.properties?.title)));
    
    const sheetExists = sheetsResponse.data.sheets?.some(
      sheet => sheet.properties?.title === SHEET_NAME
    );
    
    console.log(`Sheet '${SHEET_NAME}' exists: ${sheetExists}`);
    
    if (!sheetExists) {
      console.log(`Creating new sheet: ${SHEET_NAME}`);
      try {
        // Create the sheet if it doesn't exist
        const createResponse = await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: SHEET_NAME
                }
              }
            }]
          }
        });
        
        console.log(`Created new sheet response:`, JSON.stringify(createResponse.data));
        console.log(`Created new sheet: ${SHEET_NAME}`);
      } catch (createError: any) {
        console.error(`Error creating sheet: ${createError.message}`);
        console.error('Full error:', JSON.stringify(createError));
        throw createError;
      }
    }
    
    // Check if headers exist
    console.log(`Checking if headers exist in sheet: ${SHEET_NAME}`);
    try {
      const headerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:F1`
      });
      
      // Only add headers if they don't exist
      if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
        console.log('No headers found, adding headers...');
        try {
          // Define the headers for the sheet with specific meal types
          const headers = [
            'Student Name',
            'ID Number',
            'Monday Chicken',
            'Wednesday Chicken',
            'Thursday Omelette',
            'Friday Mushroom',
            'Saturday Fish',
            'Sunday Bread Omelette',
            'Sunday Chicken',
            'Monday Boiled Egg',
            'Tuesday Boiled Egg',
            'Saturday Boiled Egg',
            'Status',
            'Timestamp'
          ];
          
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [headers],
            },
          });
          console.log('Headers added to sheet');
        } catch (headerError) {
          console.error('Error adding headers:', headerError);
          throw new Error(`Failed to add headers: ${headerError}`);
        }
      } else {
        console.log('Headers already exist in sheet');
      }
    } catch (headerError: any) {
      console.error(`Error checking headers: ${headerError.message}`);
      console.error('Full error:', JSON.stringify(headerError));
      throw headerError;
    }
    
    console.log('Sheet setup complete');
  } catch (error: any) {
    console.error('Error setting up Google Sheet:', error.message);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to set up Google Sheet: ${error.message}`);
  }
}

// Helper function to save submission to Google Sheets
async function saveToGoogleSheets(data: SubmissionData): Promise<void> {
  try {
    console.log('Saving to Google Sheets...');
    console.log('Student:', data.studentName, 'ID:', data.studentId);
    console.log('Selections:', JSON.stringify(data.selections, null, 2));
    console.log('Starting Google Sheets data saving process...');
    console.log(`Using spreadsheet ID: ${SPREADSHEET_ID}`);
    console.log(`Using sheet name: ${SHEET_NAME}`);
    
    // Check if the spreadsheet is accessible first
    console.log('Checking if spreadsheet is accessible...');
    try {
      const spreadsheetResponse = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      console.log('Spreadsheet accessed successfully!');
      console.log(`Spreadsheet title: ${spreadsheetResponse.data.properties?.title}`);
      console.log(`Spreadsheet URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
    } catch (accessError: any) {
      console.error('Error accessing spreadsheet:', accessError.message);
      console.error('Full error:', JSON.stringify(accessError));
      if (accessError.code === 404) {
        throw new Error(`Spreadsheet not found. Please check the ID: ${SPREADSHEET_ID}`);
      } else if (accessError.code === 403) {
        throw new Error(`Permission denied. Make sure ${GOOGLE_SHEETS_CONFIG.credentials.client_email} has access to the spreadsheet.`);
      }
      throw accessError;
    }
    
    // Ensure the sheet exists and has headers
    console.log('Ensuring sheet exists with headers...');
    await ensureSheetExists();
    
    // Format the data for the sheet
    const timestamp = new Date().toISOString();
    
    // Initialize row data with empty values for all columns
    const rowData = new Array(14).fill(''); // 14 columns in total, initially empty
    
    // Set the basic student information
    rowData[0] = data.studentName;  // Student Name (Column A)
    rowData[1] = data.studentId;    // ID Number (Column B)
    
    // Map the form field names to their respective columns
    const selectionMap: Record<string, number> = {
      // Exact field names from the form
      'Monday Night - Chicken Curry': 2,       // Monday Chicken (Column C)
      'Wednesday Night - Chicken Curry': 3,    // Wednesday Chicken (Column D)
      'Thursday Afternoon - Omelette': 4,      // Thursday Omelette (Column E)
      'Friday Night - Mushroom Curry': 5,      // Friday Mushroom (Column F)
      'Saturday Afternoon - Fish Fry': 6,      // Saturday Fish (Column G)
      'Sunday Morning - Bread Omelette': 7,    // Sunday Bread Omelette (Column H)
      'Sunday Afternoon - Chicken Curry': 8,   // Sunday Chicken (Column I)
      'M - Afternoon - Boiled Egg': 9,         // Monday Boiled Egg (Column J)
      'T - Night - Boiled Egg': 10,            // Tuesday Boiled Egg (Column K)
      'S - Night - Boiled Egg': 11             // Saturday Boiled Egg (Column L)
    };
    
    console.log('Processing selections:');
    // Fill in the meal selections
    Object.entries(data.selections).forEach(([key, value]) => {
      const columnIndex = selectionMap[key];
      
      console.log(`- Processing selection: ${key} = ${value} (mapped to column ${columnIndex})`);
      
      if (columnIndex !== undefined) {
        // Handle both boolean and string 'Yes'/'No' values
        const isSelected = typeof value === 'string' 
          ? value.toLowerCase() === 'yes' 
          : Boolean(value);
        
        rowData[columnIndex] = isSelected ? 'YES' : 'NO';
        console.log(`  - Set column ${columnIndex} to ${rowData[columnIndex]}`);
      } else {
        console.log(`  - No column mapping found for key: ${key}`);
      }
    });
    
    console.log('Final row data:', rowData);
    
    // Set status and timestamp
    rowData[12] = 'Submitted';  // Status (Column M)
    rowData[13] = timestamp;    // Timestamp (Column N)
    
    console.log('Appending data to Google Sheets...');
    
    // Append the data to the sheet (A1:N covers all 14 columns)
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:N1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });
    
    console.log('Google Sheets API response:', response.status, response.statusText);
    
    if (response.status !== 200) {
      throw new Error(`Failed to save to Google Sheets: ${response.statusText}`);
    }
    
    console.log('Successfully saved to Google Sheets');
  } catch (error: unknown) {
    console.error('Error saving to Google Sheets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to save to Google Sheets: ${errorMessage}`);
  }
}

export async function POST(request: Request) {
  try {
    console.log('Received submission request');
    const requestData = await request.json();
    console.log('Raw request data:', JSON.stringify(requestData, null, 2));
    
    const data = requestData as SubmissionData;
    console.log('Parsed submission data:', JSON.stringify(data, null, 2));
    
    if (!data.selections) {
      console.error('No selections found in submission data');
      throw new Error('No selections provided');
    }
    
    // Only accept submissions for June
    if (data.month.toLowerCase() !== 'june') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Only June submissions are currently accepted',
        },
        { status: 400 }
      );
    }
    
    // Validate the submission data
    validateSubmissionData(data);
    console.log('Validated request data:', data);
    
    // Save to Google Sheets
    await saveToGoogleSheets(data);
    
    console.log('Saving submission to Firebase...');
    await addSubmission({
      studentName: data.studentName,
      studentId: data.studentId,
      month: data.month,
      selections: data.selections,
    });
    
    console.log('Successfully saved submission to both Google Sheets and Firebase');
    return NextResponse.json({ 
      success: true,
      message: 'Submission successful! Your menu selections have been saved.'
    });
    
  } catch (error: any) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process submission',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
