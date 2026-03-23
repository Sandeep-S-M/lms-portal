'use client';
import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { logoutUser } from '../../lib/auth';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">L</div>
            <span className="font-semibold text-lg tracking-tight">LMS Portal</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/subjects" className="hover:text-slate-900 transition-colors">Courses</Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
                <Link href="/profile" className="hover:text-slate-900 transition-colors font-semibold text-slate-800">{user?.name?.split(' ')[0]}</Link>
                <button onClick={logoutUser} className="hover:text-slate-900 transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
                <Link href="/auth/register" className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};
