'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllPortals, createOrUpdatePortal, closePortal as closeFirestorePortal } from '@/lib/firestore';
import { PortalStatus } from '@/lib/firestore';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// For local state only - extends Firestore PortalStatus
interface LocalPortalStatus extends PortalStatus {
  daysRemaining: number | null;
}

export default function AdminDashboard() {
  const [portals, setPortals] = useState<LocalPortalStatus[]>([
    { month: 'January', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'February', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'March', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'April', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'May', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'June', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'July', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'August', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'September', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'October', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'November', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
    { month: 'December', isOpen: false, closingDate: null, daysRemaining: null, createdAt: null },
  ]);

  const [selectedDays, setSelectedDays] = useState<number>(3);
  const [currentMonth, setCurrentMonth] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add adminEmail state
  const [adminEmail, setAdminEmail] = useState<string>('');
  
  // Add state for quick setup loading
  const [isQuickSetupLoading, setIsQuickSetupLoading] = useState<boolean>(false);
  
  // Function to quickly set up portals (close all except June)
  const quickSetupPortals = async () => {
    if (window.confirm('This will close all portals except June. Continue?')) {
      try {
        setIsQuickSetupLoading(true);
        
        // Call the API to update portals
        const response = await fetch('/api/update-portals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update portals');
        }
        
        // Refresh the page to show updated portals
        window.location.reload();
        
      } catch (err) {
        console.error('Error updating portals:', err);
        alert(`Failed to update portals: ${(err as Error).message}`);
      } finally {
        setIsQuickSetupLoading(false);
      }
    }
  };
  
  // Load portals data from Firestore
  useEffect(() => {
    const fetchPortals = async () => {
      try {
        setIsLoading(true);
        const firestorePortals = await getAllPortals();
        
        // Merge Firestore data with our predefined months
        setPortals(prevPortals => 
          prevPortals.map(portal => {
            // Find matching portal from Firestore
            const firestorePortal = firestorePortals.find(
              p => p.month.toLowerCase() === portal.month.toLowerCase()
            );
            
            if (firestorePortal) {
              // Calculate days remaining for each open portal
              let daysRemaining = null;
              if (firestorePortal.isOpen && firestorePortal.closingDate) {
                const closing = new Date(firestorePortal.closingDate);
                const now = new Date();
                const diffTime = closing.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                daysRemaining = diffDays > 0 ? diffDays : null;
              }
              
              return { 
                ...firestorePortal, 
                daysRemaining,
                // Auto-close if past deadline
                isOpen: daysRemaining !== null ? firestorePortal.isOpen : false
              } as LocalPortalStatus;
            }
            return portal;
          })
        );
        
      } catch (err) {
        console.error('Error loading portals from Firestore:', err);
        setError('Failed to load portal data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortals();
  }, []);

  // Calculate days remaining for each open portal
  useEffect(() => {
    const interval = setInterval(() => {
      setPortals(prevPortals => 
        prevPortals.map(portal => {
          if (portal.isOpen && portal.closingDate) {
            const closing = new Date(portal.closingDate);
            const now = new Date();
            const diffTime = closing.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Auto-close portals that have reached their deadline
            if (diffDays <= 0) {
              return { ...portal, isOpen: false, closingDate: null, daysRemaining: null };
            }
            
            return { ...portal, daysRemaining: diffDays };
          }
          return portal;
        })
      );
    }, 1000 * 60); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const openPortal = async (month: string) => {
    try {
      setCurrentMonth(month);
      setIsLoading(true);
      setError('');
      
      console.log(`[OPEN PORTAL] Opening portal for ${month}`);
      
      // First, check if the portal already exists and has a spreadsheet
      const existingPortal = portals.find(p => p.month.toLowerCase() === month.toLowerCase());
      
      if (existingPortal?.spreadsheetId) {
        console.log('[OPEN PORTAL] Using existing spreadsheet:', existingPortal.spreadsheetId);
        // If portal exists and has a spreadsheet, just open it
        setPortals(prevPortals => 
          prevPortals.map(p => 
            p.month.toLowerCase() === month.toLowerCase() 
              ? { ...p, isOpen: true }
              : p
          )
        );
        setIsLoading(false);
        return;
      }
      
      console.log('[OPEN PORTAL] Creating new spreadsheet...');
      
      // If no existing spreadsheet, create a new one
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          month: month,
          year: new Date().getFullYear(),
          adminEmail: adminEmail || undefined // Only pass if provided
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[OPEN PORTAL] Error creating spreadsheet:', data);
        throw new Error(data.error || 'Failed to create spreadsheet');
      }
      
      console.log('[OPEN PORTAL] Spreadsheet created successfully:', {
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: data.spreadsheetUrl
      });
      
      if (!data.spreadsheetId) {
        throw new Error('No spreadsheet ID returned from server');
      }
      
      // Calculate closing date (30 days from now)
      const closingDate = new Date();
      closingDate.setDate(closingDate.getDate() + 30);
      
      // Create portal object with the new spreadsheet details
      const newPortal: PortalStatus = {
        month: month,
        isOpen: true, 
        closingDate: closingDate.toISOString(), 
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
        createdAt: Timestamp.now()
      };
      
      console.log('[OPEN PORTAL] Saving portal to Firestore:', newPortal);
      
      // Save to Firestore
      await createOrUpdatePortal(newPortal);
      
      // Update local state
      setPortals(prevPortals => 
        prevPortals.map(p => 
          p.month.toLowerCase() === month.toLowerCase() 
            ? { ...newPortal, daysRemaining: 30 }
            : p
        )
      );
      
      console.log('[OPEN PORTAL] Portal updated successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open portal';
      console.error('[OPEN PORTAL] Error:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmOpenPortal = async () => {
    if (!currentMonth) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Create Google Sheet for this month's portal
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          month: currentMonth,
          year: new Date().getFullYear(),
          adminEmail: adminEmail || undefined // Only pass if provided
        }),
      });
      
      const data = await response.json();
      console.log("Portal creation response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create spreadsheet');
      }
      
      // Set closing date
      const closingDate = new Date();
      closingDate.setDate(closingDate.getDate() + selectedDays);
      
      // Ensure we have a valid spreadsheet ID and URL
      if (!data.spreadsheetId) {
        throw new Error('No spreadsheet ID received from the server');
      }
      
      const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`;
      
      // Create portal object with the new spreadsheet details
      const newPortal: PortalStatus = {
        month: currentMonth,
        isOpen: true, 
        closingDate: closingDate.toISOString(), 
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: spreadsheetUrl,
        createdAt: Timestamp.now()
      };
      
      console.log('[DEBUG] New portal data to save:', {
        month: currentMonth,
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: spreadsheetUrl,
        fullObject: newPortal
      });
      
      // Save to Firestore
      console.log('[DEBUG] Saving to Firestore...');
      await createOrUpdatePortal(newPortal);
      console.log('[DEBUG] Portal saved to Firestore');
      
      // Verify the data was saved
      const docRef = doc(db, 'portals', currentMonth.toLowerCase());
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Failed to verify portal was saved to Firestore');
      }
      
      const savedData = docSnap.data();
      console.log('[DEBUG] Document after save:', {
        id: docSnap.id,
        exists: docSnap.exists(),
        data: savedData,
        hasSpreadsheetId: !!savedData.spreadsheetId,
        hasSpreadsheetUrl: !!savedData.spreadsheetUrl
      });
      
      // Update local state with the saved data to ensure consistency
      setPortals(prevPortals => 
        prevPortals.map(portal => 
          portal.month === currentMonth ? 
            { 
              ...portal,
              ...savedData,
              daysRemaining: selectedDays
            } : portal
        )
      );
      
      // Update local state
      setPortals(prevPortals => 
        prevPortals.map(portal => 
          portal.month === currentMonth ? 
            { 
              ...portal,
              ...newPortal,
              daysRemaining: selectedDays
            } : portal
        )
      );
      
      // Success message
      alert(`Portal for ${currentMonth} created successfully!`);
      
    } catch (err) {
      setError((err as Error).message || 'Failed to open portal');
      console.error('Error opening portal:', err);
      alert(`Failed to create portal: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
      setShowModal(false);
      setCurrentMonth(null);
    }
  };

  const closePortal = async (month: string) => {
    try {
      // Update local state first for immediate UI feedback
      setPortals(prevPortals => 
        prevPortals.map(portal => 
          portal.month === month ? 
            { 
              ...portal, 
              isOpen: false, 
              closingDate: null, 
              daysRemaining: null 
            } : portal
        )
      );
      
      // Close portal in Firestore
      await closeFirestorePortal(month);
      
      // Call the API to close the portal
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'closePortal',
          month: month
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to close portal');
      }

    } catch (err) {
      console.error('Error closing portal:', err);
      // Show error toast or notification here
    }
  };

  const downloadData = async (month: string) => {
    const portal = portals.find(p => p.month === month);
    if (!portal?.spreadsheetId) {
      alert('No spreadsheet data available for this month.');
      return;
    }
    
    try {
      // Get data from Google Sheet
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get',
          spreadsheetId: portal.spreadsheetId,
          range: 'Student Selections!A1:Z1000'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get spreadsheet data');
      }
      
      // Convert data to CSV
      const csvContent = data.data.map((row: string[]) => row.join(',')).join('\n');
      
      // Create a download link
      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${month}-menu-selections.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      alert('Error downloading data: ' + (err as Error).message);
      console.error('Error downloading data:', err);
    }
  };

  const viewSpreadsheet = (url?: string, spreadsheetId?: string) => {
    console.log('[VIEW] viewSpreadsheet called with:', { url, spreadsheetId });
    
    // Find the current portal data for additional context
    const currentPortal = portals.find(p => p.spreadsheetId === spreadsheetId || p.spreadsheetUrl === url);
    console.log('[VIEW] Current portal data:', currentPortal);
    
    try {
      // If we have a valid URL, use it directly
      if (url && url.startsWith('http')) {
        console.log('[VIEW] Using provided URL:', url);
        openUrlInNewTab(url);
        return;
      }
      
      // If we have a spreadsheet ID, construct the URL
      if (spreadsheetId) {
        const constructedUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
        console.log('[VIEW] Constructed URL from ID:', constructedUrl);
        openUrlInNewTab(constructedUrl);
        return;
      }
      
      // If we have neither, try to get the ID from the portal data
      if (currentPortal?.spreadsheetId) {
        const portalUrl = `https://docs.google.com/spreadsheets/d/${currentPortal.spreadsheetId}/edit`;
        console.log('[VIEW] Using portal spreadsheet ID:', portalUrl);
        openUrlInNewTab(portalUrl);
        return;
      }
      
      // If we still don't have a valid URL or ID, show an error
      const errorMsg = 'No valid spreadsheet URL or ID available.';
      console.error('[VIEW]', errorMsg, { url, spreadsheetId, currentPortal });
      alert(errorMsg);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('[VIEW] Error opening spreadsheet:', errorMessage, error);
      alert(`Error opening spreadsheet: ${errorMessage}`);
    }
  };
  
  // Helper function to open URL in new tab with error handling
  const openUrlInNewTab = (url: string) => {
    console.log('[VIEW] Opening URL:', url);
    
    // Check if URL is valid
    if (!url || !url.startsWith('http')) {
      throw new Error(`Invalid URL: ${url}`);
    }
    
    // Try to open in a new tab
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    // Fallback if popup is blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.warn('[VIEW] Popup was blocked by browser');
      const shouldOpen = confirm(
        `The spreadsheet couldn't be opened in a new tab. Would you like to be redirected?\n\n${url}`
      );
      if (shouldOpen) {
        console.log('[VIEW] Redirecting to:', url);
        window.location.href = url;
      }
    } else {
      console.log('[VIEW] Successfully opened new window');
    }
  };

  const viewStatistics = (spreadsheetId?: string) => {
    if (!spreadsheetId) {
      alert('No spreadsheet available for this month.');
      return;
    }
    
    // Instead of showing statistics in a modal, direct to Google Sheets
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    console.log('[STATS] Opening Google Sheet:', spreadsheetUrl);
    window.open(spreadsheetUrl, '_blank');
  };



  return (
    <div className="bg-[#f6f1e9] absolute inset-0 overflow-auto">
      <div className="container mx-auto px-2 py-4 pb-16 max-w-3xl">
        <header className="mb-6 pt-2">
          <h1 className="text-4xl text-center font-lobster text-primary">Extrabite</h1>
          <p className="text-center text-accent font-medium mt-1">Admin Dashboard</p>
          
          {/* Quick Setup Button */}
          <div className="flex justify-center">
            <button
              onClick={quickSetupPortals}
              disabled={isQuickSetupLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center"
            >
              Quick Setup: Open June Only
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        <main>
          <h2 className="text-xl font-semibold mb-4 text-accent text-center">Portal Management</h2>
          
          <div className="space-y-6">
            {portals.map((portal) => (
              <div key={portal.month} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="py-3 px-4 bg-gray-100 border-b font-bold text-lg">
                  {portal.month}
                  <span className={`float-right text-xs font-medium px-2 py-1 rounded-full ${
                    portal.isOpen ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>
                    {portal.isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
                
                {portal.isOpen && portal.daysRemaining !== null && (
                  <div className="bg-blue-50 px-4 py-2 text-sm">
                    <span className="font-semibold">Closing in:</span> {portal.daysRemaining} days
                    <span className="text-gray-500 ml-2">({new Date(portal.closingDate!).toLocaleDateString()})</span>
                  </div>
                )}
                
                <div className={`p-4 grid ${portal.spreadsheetUrl ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                  <button 
                    onClick={() => portal.isOpen ? closePortal(portal.month) : openPortal(portal.month)}
                    className={`py-3 px-2 rounded-lg font-medium text-sm text-white 
                      ${portal.isOpen ? 'bg-red-500' : 'bg-primary'}`}
                    disabled={isLoading}
                  >
                    {isLoading && currentMonth === portal.month ? 'Loading...' : portal.isOpen ? 'Close Portal' : 'Open Portal'}
                  </button>
                  
                  {portal.spreadsheetId && (
                    <button 
                      onClick={() => viewStatistics(portal.spreadsheetId)}
                      className="py-3 px-2 rounded-lg font-medium text-sm bg-yellow-500 text-white"
                    >
                      Stats
                    </button>
                  )}
                  
                  {portal.spreadsheetUrl ? (
                    <>
                      {console.log(`[RENDER] View button for ${portal.month}:`, {
                        hasUrl: !!portal.spreadsheetUrl,
                        url: portal.spreadsheetUrl,
                        hasId: !!portal.spreadsheetId,
                        id: portal.spreadsheetId,
                        portalData: portal
                      })}
                      <button 
                        onClick={() => {
                          console.log('[CLICK] View button clicked for:', portal.month, {
                            url: portal.spreadsheetUrl,
                            id: portal.spreadsheetId
                          });
                          viewSpreadsheet(portal.spreadsheetUrl, portal.spreadsheetId);
                        }}
                        className="py-3 px-2 rounded-lg font-medium text-sm bg-blue-600 text-white"
                      >
                        View
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-gray-500 py-3 px-2">
                      No spreadsheet URL available
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-white rounded-xl shadow-md p-5">
            <h2 className="text-lg font-semibold mb-3 text-accent">Data Integration</h2>
            <p className="text-sm mb-4">All student selections are automatically synced with Google Sheets.</p>
            <p className="text-sm text-gray-600 mb-2">View individual month sheets using the "View" button on each month card.</p>
          </div>
        </main>

        <div className="mt-8 text-center">
          <Link href="/" className="text-accent text-sm font-medium">
            Logout
          </Link>
        </div>
      </div>

      {/* Modal for opening portal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs">
            <h3 className="text-lg font-bold mb-4">Open Portal for {currentMonth}</h3>
            <div className="mb-4">
              <label className="block mb-2 text-sm">Portal will remain open for:</label>
              <select 
                className="w-full p-3 border rounded-lg text-sm" 
                value={selectedDays}
                onChange={(e) => setSelectedDays(Number(e.target.value))}
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={4}>4 days</option>
                <option value={5}>5 days</option>
                <option value={7}>1 week</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm">Your email address (for spreadsheet access):</label>
              <input 
                type="email" 
                className="w-full p-3 border rounded-lg text-sm" 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="example@gmail.com"
              />
              <p className="text-xs text-gray-500 mt-1">We'll automatically share the spreadsheet with this email</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                className={`py-3 ${isLoading ? 'bg-gray-400' : 'bg-primary'} text-white rounded-lg text-sm font-medium`}
                onClick={confirmOpenPortal}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Confirm'}
              </button>
              <button 
                className="py-3 bg-gray-300 rounded-lg text-sm font-medium"
                onClick={() => setShowModal(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 