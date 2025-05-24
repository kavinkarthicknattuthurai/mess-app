'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="card">
        <div>
          <div className="mb-6 text-center">
            <h1 className="text-4xl mb-1">Extrabite</h1>
            <p className="text-accent">from the mess representative jothiragav</p>
          </div>

          <form className="space-y-6 mt-8">
            <div>
              <input
                type="text"
                placeholder="Student Name"
                className="input"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                placeholder="Student ID"
                className="input"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
            
            <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (studentName && studentId) {
                    localStorage.setItem('studentName', studentName);
                    localStorage.setItem('studentId', studentId);
                    router.push('/month-selection');
                  } else {
                    alert('Please enter both Student Name and Student ID');
                  }
                }}
              >
                Submit
              </button>
          </form>
        </div>
        
        <div className="mt-10">
          <Link href="/admin" className="block">
            <button
              type="button"
              className="btn-secondary"
            >
              Admin Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
