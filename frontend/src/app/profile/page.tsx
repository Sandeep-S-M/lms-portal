'use client';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/apiClient';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { logoutUser } from '../../lib/auth';
import Link from 'next/link';
import { AuthGuard } from '../../components/Auth/AuthGuard';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data: allSubjects } = await apiClient.get('/subjects');
        const progressPromises = allSubjects.map(async (sub: any) => {
          try {
            const { data: prog } = await apiClient.get(`/progress/subjects/${sub.id}`);
            return { ...sub, progress: prog };
          } catch {
            return { ...sub, progress: { percent_complete: 0, total_videos: 0, completed_videos: 0 } };
          }
        });
        const fullData = await Promise.all(progressPromises);
        setSubjects(fullData.filter(s => s.progress.total_videos > 0)); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) return <div className="h-[80vh] flex justify-center items-center"><Spinner size="lg" /></div>;

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-8 mb-8 gap-4">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 rounded-full flex items-center justify-center text-4xl font-extrabold shadow-sm ring-1 ring-slate-900/5">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.name}</h1>
                <p className="text-slate-500 font-medium">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" className="border-slate-300 text-slate-700 shadow-sm" onClick={logoutUser}>Sign Out</Button>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Your Learning Progress</h2>
          {subjects.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">You haven't engaged with any course material yet.</p>
              <Link href="/subjects" className="text-blue-600 hover:text-blue-700 font-bold mt-2 inline-block">Browse available subjects &rarr;</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {subjects.map(sub => (
                <div key={sub.id} className="border border-slate-200 rounded-2xl p-6 md:p-8 hover:border-slate-300 hover:shadow-sm transition-all bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold text-slate-900">{sub.title}</h3>
                    <Link href={`/subjects/${sub.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors">
                      Continue Learning &rarr;
                    </Link>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4 mb-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out relative" 
                      style={{ width: `${sub.progress.percent_complete}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-600 uppercase tracking-widest">
                    <span className={sub.progress.percent_complete === 100 ? 'text-green-600' : ''}>{sub.progress.percent_complete}% Complete</span>
                    <span>{sub.progress.completed_videos} / {sub.progress.total_videos} Lessons</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
