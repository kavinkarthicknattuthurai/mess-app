'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, RefreshCcw, Check, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets-config';

interface DiagnosticStep {
  name: string;
  status: 'attempting' | 'success' | 'error' | 'warning';
}

interface DiagnosticResult {
  success: boolean;
  config: {
    spreadsheetId: string;
    sheetName: string;
    clientEmail: string;
  };
  steps: DiagnosticStep[];
  error: string | null;
  availableSheets: string[];
  data: any;
}

export default function SheetsDiagnosticPage() {
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/test-sheets-connection');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setDiagnosticResult(result);
    } catch (err: any) {
      console.error('Error running diagnostic:', err);
      setError(err.message || 'Failed to run diagnostic');
    } finally {
      setIsLoading(false);
    }
  };

  // Run diagnostic on page load
  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />;
    }
  };

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
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={runDiagnostic}
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Running...' : 'Run Diagnostic'}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Google Sheets Connection Diagnostic</CardTitle>
          <CardDescription>
            Troubleshoot issues with the Google Sheets integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          ) : isLoading && !diagnosticResult ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Running diagnostic checks...</p>
            </div>
          ) : diagnosticResult ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Configuration</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="font-medium">Spreadsheet ID:</span>
                      <span className="font-mono text-sm">{diagnosticResult.config.spreadsheetId}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Sheet Name:</span>
                      <span>{diagnosticResult.config.sheetName}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Service Account:</span>
                      <span className="font-mono text-sm truncate max-w-[200px]" title={diagnosticResult.config.clientEmail}>
                        {diagnosticResult.config.clientEmail}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Connection Status</h3>
                  <div className={`flex items-center justify-center p-4 rounded-lg ${diagnosticResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className={`text-xl font-bold ${diagnosticResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {diagnosticResult.success ? 'Connected Successfully' : 'Connection Failed'}
                    </span>
                  </div>
                  {diagnosticResult.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                      {diagnosticResult.error}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Diagnostic Steps</h3>
                <ul className="space-y-2">
                  {diagnosticResult.steps.map((step, index) => (
                    <li key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="mr-3">
                        {getStatusIcon(step.status)}
                      </span>
                      <span className="flex-grow">{step.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {diagnosticResult.availableSheets.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Available Sheets</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-1">
                      {diagnosticResult.availableSheets.map((sheet, index) => (
                        <li key={index} className={`px-3 py-2 rounded ${sheet === diagnosticResult.config.sheetName ? 'bg-blue-100 font-medium' : ''}`}>
                          {sheet}
                          {sheet === diagnosticResult.config.sheetName && ' (selected)'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {diagnosticResult.data && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Sample Data</h3>
                  <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
                    <p className="mb-2">Found {diagnosticResult.data.rowCount} rows (including headers)</p>
                    
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          {diagnosticResult.data.headers.map((header: string, i: number) => (
                            <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {diagnosticResult.data.sampleRows.map((row: any[], rowIndex: number) => (
                          <tr key={rowIndex} className="bg-white">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>Common issues and how to fix them</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Spreadsheet Not Found (404)</h4>
              <p className="mb-2">This usually means one of the following:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The spreadsheet ID is incorrect</li>
                <li>The spreadsheet has been deleted</li>
                <li>The spreadsheet has not been shared with the service account</li>
              </ul>
              <p className="mt-2">
                <strong>Solution:</strong> Verify the spreadsheet ID and make sure it's shared with the service account email: 
                <span className="font-mono text-xs ml-1">{GOOGLE_SHEETS_CONFIG.credentials.client_email}</span>
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Permission Denied (403)</h4>
              <p className="mb-2">This means the service account doesn't have permission to access the spreadsheet.</p>
              <p className="mt-2">
                <strong>Solution:</strong> Share the spreadsheet with the service account email and give it at least "Editor" access.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Sheet Not Found</h4>
              <p className="mb-2">The spreadsheet exists but the specific sheet name configured was not found.</p>
              <p className="mt-2">
                <strong>Solution:</strong> Check if the sheet name is correct. The current configured sheet name is 
                "<span className="font-medium">{GOOGLE_SHEETS_CONFIG.sheetName}</span>". Rename the sheet in Google Sheets or update the configuration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
