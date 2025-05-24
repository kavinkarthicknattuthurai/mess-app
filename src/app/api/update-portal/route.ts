import { NextResponse } from 'next/server';
import { updatePortalStatus } from '@/lib/firebase-utils';

export async function POST(request: Request) {
  try {
    const { isOpen } = await request.json();

    if (typeof isOpen !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    await updatePortalStatus(isOpen);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating portal status:', error);
    return NextResponse.json(
      { error: 'Failed to update portal status' },
      { status: 500 }
    );
  }
}
