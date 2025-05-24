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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action } = data;

    console.log('Sheets API request:', action, data);

    // Handle different actions
    switch (action) {
      case 'get':
        return handleGetRequest(data);
      case 'add':
        return handleAddRequest(data);
      case 'create':
        return handleCreateRequest(data);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error in sheets API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

async function handleGetRequest(data: any) {
  try {
    const { month, checkPortal } = data;
    
    if (checkPortal) {
      // For June, we'll return a success response with the spreadsheet ID
      if (month.toLowerCase() === 'june') {
        // Check if the spreadsheet is accessible
        try {
          const response = await sheets.spreadsheets.get({
            spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
          });
          
          console.log(`Successfully accessed spreadsheet: ${response.data.properties?.title}`);
          
          return NextResponse.json({
            success: true,
            spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
            title: response.data.properties?.title,
            message: 'Portal is open for June'
          });
        } catch (error: any) {
          console.error('Error accessing spreadsheet:', error);
          return NextResponse.json(
            { success: false, error: `Could not access spreadsheet: ${error.message}` },
            { status: 500 }
          );
        }
      } else {
        // For other months, return a failure response
        return NextResponse.json(
          { success: false, error: `Portal for ${month} is not open` },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid get request' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in get request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

async function handleAddRequest(data: any) {
  try {
    const { spreadsheetId, range, values } = data;
    
    if (!spreadsheetId || !range || !values) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // First, ensure the sheet exists
    await ensureSheetExists(spreadsheetId, GOOGLE_SHEETS_CONFIG.sheetName);
    
    // Then append the data
    console.log('Appending data to sheet:', values);
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values,
      },
    });
    
    console.log('Append response:', response.data);
    
    return NextResponse.json({
      success: true,
      updatedRange: response.data.updates?.updatedRange,
      updatedCells: response.data.updates?.updatedCells,
      message: 'Data added successfully'
    });
  } catch (error: any) {
    console.error('Error in add request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

// Handle create request for new spreadsheets
async function handleCreateRequest(data: any) {
  try {
    const { month, year, adminEmail } = data;
    
    if (!month) {
      return NextResponse.json(
        { success: false, error: 'Month is required' },
        { status: 400 }
      );
    }
    
    // Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${month} ${year} Menu Selections`,
        },
        sheets: [
          {
            properties: {
              title: 'Student Selections',
              gridProperties: {
                rowCount: 1,
                columnCount: 6,
                frozenRowCount: 1
              }
            }
          }
        ]
      },
    });
    
    if (!spreadsheet.data.spreadsheetId) {
      throw new Error('Failed to create spreadsheet');
    }
    
    const spreadsheetId = spreadsheet.data.spreadsheetId;
    
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Student Selections!A1:F1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['Timestamp', 'Student Name', 'Student ID', 'Month', 'Selections', 'Status']
        ]
      }
    });
    
    // Share the spreadsheet with the admin if email is provided
    if (adminEmail) {
      const drive = google.drive({ version: 'v3', auth });
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: adminEmail,
        },
        sendNotificationEmail: true,
      });
    }
    
    return NextResponse.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      message: 'Spreadsheet created successfully'
    });
    
  } catch (error: any) {
    console.error('Error creating spreadsheet:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create spreadsheet' },
      { status: 500 }
    );
  }
}

// Helper function to ensure sheet exists
async function ensureSheetExists(spreadsheetId: string, sheetName: string = GOOGLE_SHEETS_CONFIG.sheetName): Promise<void> {
  try {
    // Check if the sheet exists
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title'
    });
    
    const sheetExists = sheetsResponse.data.sheets?.some(
      sheet => sheet.properties?.title === sheetName
    );
    
    if (!sheetExists) {
      // Create the sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName
              }
            }
          }]
        }
      });
      
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${GOOGLE_SHEETS_CONFIG.sheetName}!A1:Z1000`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Student ID', 'Student Name', 'Timestamp', 'Selections', 'Status']]
        }
      });
      
      console.log(`Created new sheet: ${sheetName} with headers`);
    }
  } catch (error: any) {
    console.error('Error ensuring sheet exists:', error);
    throw new Error(`Failed to ensure sheet exists: ${error.message}`);
  }
}
