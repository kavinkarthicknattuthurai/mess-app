'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets-config';
import Link from 'next/link';

export default function TestSheetsUrl() {
  const [urlInput, setUrlInput] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Get the current spreadsheet ID from configuration
  const configuredId = GOOGLE_SHEETS_CONFIG.spreadsheetId;
  
  // Create the configured URL
  const configuredUrl = `https://docs.google.com/spreadsheets/d/${configuredId}/edit`;
  
  // Function to test a URL
  const testUrl = async (url: string) => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // This won't give us status but will prevent CORS errors
      });
      
      // We can't actually check status with no-cors, but at least we know the request didn't throw an error
      setTestResult('Request completed without errors, but we cannot verify if the URL exists due to CORS restrictions.');
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Google Sheets URL Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>Information from your Google Sheets configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Spreadsheet ID</h3>
              <p className="font-mono text-sm break-all">{configuredId}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Sheet Name</h3>
              <p>{GOOGLE_SHEETS_CONFIG.sheetName}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Generated URL</h3>
              <p className="font-mono text-sm break-all mb-2">{configuredUrl}</p>
              <div className="flex space-x-2 mb-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.open(configuredUrl, '_blank')}
                >
                  Open URL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(configuredUrl)}
                >
                  Copy URL
                </Button>
              </div>
              
              <h3 className="font-medium mb-2">Direct Link (Bypass Router)</h3>
              <p className="text-sm mb-2">Click the link below to directly open your Google Sheet:</p>
              <a 
                href={`https://docs.google.com/spreadsheets/d/10wToXCkzryk-MuKNx7jhxVMtkiCXokTiQiuWizYci38/edit`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                Open Google Sheet Directly
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Custom URL</CardTitle>
          <CardDescription>Test a specific Google Sheets URL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Google Sheets URL
              </label>
              <input
                id="url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md w-full"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>
            
            <Button
              onClick={() => testUrl(urlInput)}
              disabled={isLoading || !urlInput}
            >
              {isLoading ? 'Testing...' : 'Test URL'}
            </Button>
            
            {testResult && (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
                {testResult}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Check Service Account Access</CardTitle>
          <CardDescription>Verify your Google Sheet is shared with the service account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Make sure your Google Sheet is shared with the service account email:
          </p>
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="font-mono text-sm break-all">{GOOGLE_SHEETS_CONFIG.credentials.client_email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm">Steps to share your spreadsheet:</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Open your Google Sheet</li>
              <li>Click the "Share" button in the top-right corner</li>
              <li>Add the service account email address above</li>
              <li>Set permission to "Editor"</li>
              <li>Click "Share"</li>
            </ol>
          </div>
          
          <div className="mt-6">
            <Link href="/admin/sheets-diagnostic">
              <Button>
                Run Full Diagnostic
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
