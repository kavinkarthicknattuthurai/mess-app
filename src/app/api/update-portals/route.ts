import { NextResponse } from 'next/server';
import { createOrUpdatePortal, closePortal as closeFirestorePortal, getAllPortals } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    // Get all portals first
    const allPortals = await getAllPortals();
    
    // Close all portals except June
    for (const portal of allPortals) {
      if (portal.month.toLowerCase() !== 'june' && portal.isOpen) {
        await closeFirestorePortal(portal.month);
        console.log(`Closed portal for ${portal.month}`);
      }
    }
    
    // Open June portal if not already open
    const junePortal = allPortals.find(p => p.month.toLowerCase() === 'june');
    
    if (!junePortal || !junePortal.isOpen) {
      // Calculate closing date (3 days from now)
      const closingDate = new Date();
      closingDate.setDate(closingDate.getDate() + 3);
      
      await createOrUpdatePortal({
        month: 'June',
        isOpen: true,
        closingDate: closingDate.toISOString(),
        spreadsheetId: '10wToXCkzryk-MuKNx7jhxVMtkiCXokTiQiuWizYci38',
        createdAt: junePortal?.createdAt || Timestamp.now()
      });
      
      console.log('Opened portal for June');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully updated portals. June is now open, all others are closed.'
    });
    
  } catch (error: any) {
    console.error('Error updating portals:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
