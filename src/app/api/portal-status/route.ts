import { NextResponse } from 'next/server';
import { getPortalStatus } from '@/lib/firebase-utils';

export async function GET() {
  try {
    const isOpen = await getPortalStatus();
    return NextResponse.json({ isOpen });
  } catch (error) {
    console.error('Error fetching portal status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portal status' },
      { status: 500 }
    );
  }
}
