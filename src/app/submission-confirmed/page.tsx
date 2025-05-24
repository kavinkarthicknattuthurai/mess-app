'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmissionConfirmed() {
  const router = useRouter();

  // Redirect to home after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-[#f6f1e9] min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md text-center">
        <h1 className="text-4xl text-center font-lobster text-primary mb-6">Extrabite</h1>
        
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-green-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Submission Successful!</h2>
        <p className="text-gray-600 mb-8">
          Your menu selections have been saved successfully. Thank you!
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/" 
            className="block w-full py-3 bg-primary text-white rounded-lg font-medium"
          >
            Back to Home
          </Link>
          
          <p className="text-sm text-gray-500">
            You will be automatically redirected in 10 seconds.
          </p>
        </div>
      </div>
    </div>
  );
} 