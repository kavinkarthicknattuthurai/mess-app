'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, ArrowLeft, BarChart2 } from 'lucide-react';
import Link from 'next/link';

// Define the data types
interface SheetRow {
  [key: string]: string;
}

interface StatCount {
  [selection: string]: number;
}

interface SelectionCounts {
  [day: string]: StatCount;
}

interface SheetStats {
  totalSubmissions: number;
  selectionCounts: SelectionCounts;
}

export default function SheetsDataPage() {
  const [data, setData] = useState<SheetRow[]>([]);
  const [stats, setStats] = useState<SheetStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'data' | 'stats'>('data');

  // Fetch sheet data on component mount and check for view param in URL
  useEffect(() => {
    fetchData();
    
    // Check if URL has view=stats parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam === 'stats') {
        setView('stats');
      }
    }
  }, []);

  // Function to fetch data from the sheets API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/sheets');
      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets');
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setData(result.data || []);
      
      // Also fetch stats
      const statsResponse = await fetch('/api/sheets?action=stats');
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        setStats(statsResult.stats);
      }
    } catch (err: any) {
      console.error('Error fetching sheet data:', err);
      setError(err.message || 'Failed to load data from Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to download sheet data as CSV
  const downloadData = async () => {
    try {
      // Redirect to the export API endpoint
      window.location.href = '/api/export-sheets';
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => fetchData()}
        >
          Retry
        </Button>
        <Button 
          variant="ghost" 
          className="mt-4 ml-2"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          className="gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="space-x-2">
          <Button
            variant={view === 'data' ? 'default' : 'outline'}
            onClick={() => setView('data')}
          >
            View Data
          </Button>
          <Button
            variant={view === 'stats' ? 'default' : 'outline'}
            onClick={() => setView('stats')}
            className="gap-2"
          >
            <BarChart2 className="h-4 w-4" />
            Statistics
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={downloadData}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>June Menu Selections</CardTitle>
          <CardDescription>
            {view === 'data' 
              ? 'Student menu selections from Google Sheets' 
              : 'Statistics for June menu selections'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view === 'data' ? (
            <div className="overflow-x-auto">
              {data.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No data found in the Google Sheet.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(data[0]).map((header) => (
                        <th 
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((cell, cellIndex) => (
                          <td 
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div>
              {!stats ? (
                <p className="text-center py-8 text-gray-500">No statistics available.</p>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Total Submissions</h3>
                    <p className="text-3xl font-bold text-primary">{stats.totalSubmissions}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Selection Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(stats.selectionCounts).map(([day, counts]) => (
                        <div key={day} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">{day}</h4>
                          <ul className="space-y-2">
                            {Object.entries(counts).map(([selection, count]) => (
                              <li key={selection} className="flex justify-between">
                                <span>{selection}</span>
                                <span className="font-medium">{count}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
