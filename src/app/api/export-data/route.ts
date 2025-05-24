import { NextResponse } from 'next/server';
import { getSubmissions, Submission } from '@/lib/firebase-utils';

// Extended Submission type with dynamic fields for menu selections
interface SubmissionWithSelections extends Omit<Submission, 'selections'> {
  [key: string]: any;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || undefined;
    
    // Get submissions from Firebase
    const submissions = await getSubmissions(month || undefined) as SubmissionWithSelections[];

    // Define CSV headers
    const headers = [
      'Student Name', 'ID Number', 
      'Monday Chicken', 'Wednesday Chicken', 'Thursday Omelette',
      'Friday Mushroom', 'Saturday Fish', 'Sunday Bread Omelette',
      'Sunday Chicken', 'Monday Boiled Egg', 'Tuesday Boiled Egg',
      'Saturday Boiled Egg', 'Submitted At'
    ];

    // Convert data to CSV rows
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    for (const sub of submissions) {
      const row = [
        `"${(sub.studentName || '').replace(/"/g, '""')}"`,
        `"${(sub.studentId || '').replace(/"/g, '""')}"`,
        sub['Monday Night - Chicken Curry'] ? 'Yes' : 'No',
        sub['Wednesday Night - Chicken Curry'] ? 'Yes' : 'No',
        sub['Thursday Afternoon - Omelette'] ? 'Yes' : 'No',
        sub['Friday Night - Mushroom Curry'] ? 'Yes' : 'No',
        sub['Saturday Afternoon - Fish Fry'] ? 'Yes' : 'No',
        sub['Sunday Morning - Bread Omelette'] ? 'Yes' : 'No',
        sub['Sunday Afternoon - Chicken Curry'] ? 'Yes' : 'No',
        sub['M - Afternoon - Boiled Egg'] ? 'Yes' : 'No',
        sub['T - Night - Boiled Egg'] ? 'Yes' : 'No',
        sub['S - Night - Boiled Egg'] ? 'Yes' : 'No',
        `"${new Date(sub.createdAt).toLocaleString()}"`
      ];
      csvRows.push(row.join(','));
    }

    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Return as file download
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="menu-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
