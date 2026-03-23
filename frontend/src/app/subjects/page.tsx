'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/apiClient';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import { useAuthStore } from '../../store/authStore';

const COLORS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-500',
  'from-yellow-500 to-orange-500',
  'from-green-500 to-emerald-600',
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [progressMap, setProgressMap] = useState<Record<number, any>>({});
  const [enrolledMap, setEnrolledMap] = useState<Record<number, boolean>>({});
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const { isAuthenticated, accessToken } = useAuthStore();

  // Ensure auth header is always current
  useEffect(() => {
    if (accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
  }, [accessToken]);

  // Fetch courses with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      apiClient.get(`/subjects${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)
        .then(res => {
          setCourses(res.data);
          // After loading courses, fetch progress and enrollment status for each if logged in
          if (isAuthenticated && accessToken) {
            res.data.forEach((course: any) => {
              apiClient.get(`/progress/subjects/${course.id}`)
                .then(pr => setProgressMap(prev => ({ ...prev, [course.id]: pr.data })))
                .catch(() => {});
              apiClient.get(`/enrollments/${course.id}`)
                .then(er => setEnrolledMap(prev => ({ ...prev, [course.id]: er.data.enrolled })))
                .catch(() => {});
            });
          }
        })
        .catch(() => setError('Failed to load courses'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isAuthenticated, accessToken]);

  const handleEnroll = async (e: React.MouseEvent, courseId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setEnrollingId(courseId);
    try {
      await apiClient.post(`/enrollments/${courseId}`);
      setEnrolledMap(prev => ({ ...prev, [courseId]: true }));
    } catch (err) {
      // enrollment may not block navigation; still allow
    } finally {
      setEnrollingId(null);
    }
  };

  if (error) return <div className="p-8 max-w-2xl mx-auto"><Alert type="error" message={error} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Browse Courses</h1>
          <p className="text-slate-500 mt-1">Expand your skills with our curated curriculum.</p>
        </div>
        <div className="relative w-full md:w-96">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg">No courses found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => {
            const prog = progressMap[course.id];
            const percent = prog ? Math.round((prog.completed_videos / Math.max(prog.total_videos, 1)) * 100) : 0;
            const isEnrolled = enrolledMap[course.id] || false;
            const colorClass = COLORS[i % COLORS.length];

            return (
              <div
                key={course.id}
                className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col"
              >
                {/* Gradient banner */}
                <div className={`h-36 bg-gradient-to-br ${colorClass} flex items-center justify-center relative`}>
                  <span className="text-6xl font-black text-white/30 select-none">{course.title[0]}</span>
                  {isAuthenticated && prog && prog.total_videos > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-2">
                      <div className="flex justify-between text-xs text-white/80 mb-1">
                        <span>{percent}% complete</span>
                        <span>{prog.completed_videos}/{prog.total_videos} lessons</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div
                          className="bg-white rounded-full h-1.5 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">
                    {course.description || 'Master the curriculum sequentially and collaboratively.'}
                  </p>

                  {/* Footer actions — enrollment gate */}
                  <div className="mt-4 flex items-center gap-3">
                    {!isAuthenticated ? (
                      <Link
                        href="/auth/login"
                        className="flex-1 text-center py-2 px-4 rounded-lg border border-blue-400 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
                      >
                        Sign in to Enroll
                      </Link>
                    ) : isEnrolled ? (
                      <Link
                        href={`/subjects/${course.id}`}
                        className="flex-1 text-center py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        {percent > 0 ? 'Continue Learning →' : 'Start Course →'}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={e => handleEnroll(e, course.id)}
                          disabled={enrollingId === course.id}
                          className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {enrollingId === course.id ? 'Enrolling…' : '🎓 Enroll Now'}
                        </button>
                      </>
                    )}
                    {isEnrolled && (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg whitespace-nowrap">
                        ✓ Enrolled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
