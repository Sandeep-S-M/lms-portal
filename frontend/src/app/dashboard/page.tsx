'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../../components/common/Spinner';
import { AuthGuard } from '../../components/Auth/AuthGuard';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  ongoing:   { label: 'In Progress', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  enrolled:  { label: 'Not Started', color: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200' },
};

const COLORS = [
  'from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600', 'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600', 'from-cyan-500 to-blue-500',
];

export default function DashboardPage() {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-fetch whenever the accessToken changes (i.e. when auth is confirmed)
  // This also handles returning to the page after enrolling
  useEffect(() => {
    if (!accessToken) return;

    // Ensure the header is always set before this fetch
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    setLoading(true);
    apiClient.get('/enrollments/my')
      .then(res => setEnrollments(Array.isArray(res.data) ? res.data : []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const handleUnenroll = async (e: React.MouseEvent, subjectId: number) => {
    e.preventDefault();
    e.stopPropagation();
    await apiClient.delete(`/enrollments/${subjectId}`).catch(() => {});
    setEnrollments(prev => prev.filter(c => c.id !== subjectId));
  };

  // Compute summary stats
  const total     = enrollments.length;
  const completed = enrollments.filter(c => c.status === 'completed').length;
  const ongoing   = enrollments.filter(c => c.status === 'ongoing').length;
  const notStarted= enrollments.filter(c => c.status === 'enrolled').length;

  const stats = [
    { label: 'Enrolled',    value: total,      icon: '📚', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'In Progress', value: ongoing,     icon: '▶️', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { label: 'Completed',   value: completed,   icon: '✅', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { label: 'Not Started', value: notStarted,  icon: '🔒', color: 'bg-slate-50 border-slate-200 text-slate-600' },
  ];

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            My Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>! Here's your learning overview.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map(stat => (
            <div key={stat.label} className={`border rounded-2xl p-5 flex flex-col items-center text-center ${stat.color}`}>
              <span className="text-3xl mb-2">{stat.icon}</span>
              <span className="text-4xl font-extrabold">{stat.value}</span>
              <span className="text-sm font-medium mt-1">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Course list */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-5xl mb-4">🎓</p>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No courses yet</h2>
            <p className="text-slate-500 mb-6">Browse the catalogue and enroll to start learning.</p>
            <Link
              href="/subjects"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-5">My Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {enrollments.map((course, i) => {
                const cfg = STATUS_CONFIG[course.status] || STATUS_CONFIG.enrolled;
                const colorClass = COLORS[i % COLORS.length];
                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Colour bar */}
                    <div className={`h-2 w-full bg-gradient-to-r ${colorClass}`} />

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{course.title}</h3>
                        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                        {course.description || 'Master the curriculum sequentially.'}
                      </p>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>{course.percent_complete}% complete</span>
                          <span>{course.completed_videos} / {course.total_videos} lessons</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${course.percent_complete}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          href={`/subjects/${course.id}`}
                          className="flex-1 text-center py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          {course.status === 'ongoing' ? 'Continue' : course.status === 'completed' ? 'Review' : 'Start'}
                        </Link>
                        <button
                          onClick={e => handleUnenroll(e, course.id)}
                          className="py-2 px-3 rounded-lg border border-slate-200 text-slate-500 text-sm hover:border-red-300 hover:text-red-500 transition-colors"
                          title="Unenroll"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
