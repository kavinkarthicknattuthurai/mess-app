'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestJuneSheetsPage() {
  const [studentName, setStudentName] = useState('Test Student');
  const [studentId, setStudentId] = useState('TEST123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create selections object for June
      const selections = {
        'Week 1 - Monday': 'Option A',
        'Week 1 - Tuesday': 'Option B',
        'Week 1 - Wednesday': 'Option A',
        'Week 1 - Thursday': 'Option B',
        'Week 1 - Friday': 'Option A',
      };
      
      // Submit the form data specifically for June
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName,
          studentId,
          month: 'June',  // Fixed to June
          selections
        }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test June Menu Submission</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <p>This form will test the submission to the June menu Google Sheet.</p>
        <p>Make sure you've set up your Google Cloud credentials properly.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-6 max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Student Name</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Student ID</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700 mb-2">Month: <span className="font-semibold">June</span></p>
          <p className="text-sm text-gray-500">This test is specifically for June submissions</p>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700 mb-2">Selections (Pre-filled for testing)</p>
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p>Week 1 - Monday: Option A</p>
            <p>Week 1 - Tuesday: Option B</p>
            <p>Week 1 - Wednesday: Option A</p>
            <p>Week 1 - Thursday: Option B</p>
            <p>Week 1 - Friday: Option A</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit to June Sheet'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin-dashboard')}
            className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </form>
      
      {result && (
        <div className={`border ${result.success ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'} p-4 rounded mb-6`}>
          <h2 className="text-xl font-semibold mb-2">
            {result.success ? '✅ Submission Successful!' : '❌ Submission Failed!'}
          </h2>
          
          <p className="mb-4">{result.message || result.error}</p>
          
          {result.success && (
            <div className="bg-white p-3 rounded border border-green-200 mb-4">
              <p className="font-medium">Your data has been saved to the Google Sheet!</p>
              <p className="text-sm">Check your Google Sheet to see the new entry.</p>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold mb-1">API Response:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
