import { NextResponse } from 'next/server';
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets-config';

export async function GET() {
  try {
    // Return the configuration with the private key partially masked for security
    const config = {
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
      sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
      credentials: {
        type: GOOGLE_SHEETS_CONFIG.credentials.type,
        project_id: GOOGLE_SHEETS_CONFIG.credentials.project_id,
        private_key_id: GOOGLE_SHEETS_CONFIG.credentials.private_key_id,
        // Only show part of the private key for security
        private_key: GOOGLE_SHEETS_CONFIG.credentials.private_key ? 
          `${GOOGLE_SHEETS_CONFIG.credentials.private_key.substring(0, 20)}...` : 
          'Not available',
        client_email: GOOGLE_SHEETS_CONFIG.credentials.client_email,
        client_id: GOOGLE_SHEETS_CONFIG.credentials.client_id,
      }
    };
    
    return NextResponse.json({ 
      config,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error in test-config API:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve configuration', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
