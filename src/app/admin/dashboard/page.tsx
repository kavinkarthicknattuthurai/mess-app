'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Eye, Lock, Unlock, FileSpreadsheet, Wrench, ExternalLink } from 'lucide-react';
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets-config';
import Link from 'next/link';

export default function AdminDashboard() {
  const [portalStatus, setPortalStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check portal status on load
  useEffect(() => {
    checkPortalStatus();
  }, []);

  const checkPortalStatus = async () => {
    try {
      const response = await fetch('/api/portal-status');
      const data = await response.json();
      setPortalStatus(data.isOpen);
    } catch (error) {
      console.error('Error checking portal status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePortal = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/update-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOpen: !portalStatus }),
      });
      
      if (response.ok) {
        setPortalStatus(!portalStatus);
      }
    } catch (error) {
      console.error('Error toggling portal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadData = async () => {
    try {
      const response = await fetch('/api/export-data');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-selections-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-6">
        {/* Portal Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Portal Status</CardTitle>
            <CardDescription>
              {portalStatus ? 'The portal is currently open for submissions.' : 'The portal is currently closed.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={togglePortal} 
              variant={portalStatus ? 'destructive' : 'default'}
              disabled={isLoading}
              className="gap-2"
            >
              {portalStatus ? (
                <>
                  <Lock className="h-4 w-4" />
                  Close Portal
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Open Portal
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Data Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>View and export submission data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => window.location.href = '/admin/view-data'}
              >
                <Eye className="h-4 w-4" />
                View Submissions
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={downloadData}
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Google Sheets Data Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Google Sheets Data</CardTitle>
            <CardDescription>Access June menu selections from Google Sheets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/admin/sheets-data">
                <Button 
                  variant="outline" 
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  View Sheet Data
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => window.open('https://docs.google.com/spreadsheets/d/10wToXCkzryk-MuKNx7jhxVMtkiCXokTiQiuWizYci38/edit', '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Open in Google Sheets
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => window.location.href = '/api/export-sheets'}
              >
                <Download className="h-4 w-4" />
                Export Sheet CSV
              </Button>
              <Link href="/admin/sheets-diagnostic">
                <Button 
                  variant="outline" 
                  className="gap-2"
                >
                  <Wrench className="h-4 w-4" />
                  Diagnostic Tool
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
