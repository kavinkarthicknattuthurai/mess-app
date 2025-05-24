import { NextResponse } from 'next/server';
import { generateCSV } from '../sheets/route';

export async function GET() {
  try {
    const csv = await generateCSV();
    
    // Set headers for CSV download
    const headers = {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="june-menu-selections-${new Date().toISOString().split('T')[0]}.csv"`,
    };
    
    return new NextResponse(csv, { headers });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
