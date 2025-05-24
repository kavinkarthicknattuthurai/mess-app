import { NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/firebase-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || undefined;
    
    const submissions = await getSubmissions(month || undefined);
    return NextResponse.json({ data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
