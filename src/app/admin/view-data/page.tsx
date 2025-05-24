'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, ArrowLeft } from 'lucide-react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { Submission } from '@/lib/firebase-utils';

export default function ViewDataPage() {
  const [data, setData] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/submissions');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        // Transform the data to match the table columns
        const formattedData = result.data.map((item: any) => ({
          ...item,
          ...item.selections, // Flatten the selections object
          createdAt: new Date(item.createdAt).toLocaleString(),
          updatedAt: new Date(item.updatedAt).toLocaleString()
        }));
        setData(formattedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
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
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={downloadData}
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Selections</CardTitle>
          <CardDescription>View all student menu selections</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
