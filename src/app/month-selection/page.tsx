'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BarChart2, Download, FileText } from 'lucide-react';
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets-config';

interface PortalStatus {
  month: string;
  isOpen: boolean;
  spreadsheetId?: string;
}

export default function MonthSelection() {
  const [portals, setPortals] = useState<PortalStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const months = [
    "January", "February", "March", "April", 
    "May", "June", "July", "August", 
    "September", "October", "November", "December"
  ];
  
  // In a real app, fetch open portals from the server
  useEffect(() => {
    // Mock API call since we're just using in-memory storage on the server
    // For demo purposes, let's just simulate a few open portals
    setTimeout(() => {
      setPortals([
        { month: 'January', isOpen: false },
        { month: 'February', isOpen: false },
        { month: 'March', isOpen: false },
        { month: 'April', isOpen: false },
        { month: 'May', isOpen: false },
        { month: 'June', isOpen: true, spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId },
        { month: 'July', isOpen: false },
        { month: 'August', isOpen: false },
        { month: 'September', isOpen: false },
        { month: 'October', isOpen: false },
        { month: 'November', isOpen: false },
        { month: 'December', isOpen: false },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#f6f1e9]/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-[95%] max-w-md mx-auto min-h-[600px] flex flex-col"
      >
        <div>
          <h1 className="text-4xl text-center font-lobster text-primary mb-2">Extrabite</h1>
          <p className="text-accent font-medium text-center mb-6">Select Month</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
            <p className="text-sm text-yellow-700">
              <strong>Notice:</strong> This portal will only be available from 24th to 26th May.
            </p>
          </div>
        </div>
        
        <div className="flex-grow flex items-center">
          {isLoading ? (
            <div className="text-center py-8 w-full">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading available months...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 w-full">
              {portals.map((portal) => (
                <div key={portal.month} className="block">
                  {portal.isOpen ? (
                    <div className="space-y-3">
                      <Link href={`/menu/${portal.month.toLowerCase()}`}>
                        <button className="py-4 px-4 bg-gray-100 hover:bg-primary hover:text-white rounded-xl font-medium w-full relative transition-all duration-200">
                          {portal.month}
                          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">OPEN</span>
                        </button>
                      </Link>
                      

                    </div>
                  ) : (
                    <button 
                      className="py-4 px-4 bg-gray-100 rounded-xl font-medium w-full opacity-50 cursor-not-allowed"
                      disabled
                    >
                      {portal.month}
                      <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">CLOSED</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-accent hover:underline font-medium">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 