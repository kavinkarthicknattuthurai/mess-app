'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check hardcoded credentials
    if (username === 'jothiragav51' && password === '2023002051') {
      // Redirect to admin dashboard on successful login
      router.push('/admin-dashboard');
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="card">
        <div>
          <div className="mb-6 text-center">
            <h1 className="text-4xl mb-1">Extrabite</h1>
            <p className="text-accent font-medium">Admin Login</p>
          </div>
          
          <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <input
                type="text"
                placeholder="Username"
                className="input"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Password"
                className="input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              className="btn-primary mt-4"
            >
              Login
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-accent hover:underline">
            Back to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
} 