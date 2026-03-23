'use client';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SubjectSidebar } from '../../../components/Sidebar/SubjectSidebar';
import { AuthGuard } from '../../../components/Auth/AuthGuard';
import { useSidebarStore } from '../../../store/sidebarStore';
import { apiClient } from '../../../lib/apiClient';

export default function SubjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string);
  const { setTree, setLoading, setError } = useSidebarStore();

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    apiClient.get(`/subjects/${subjectId}/tree`)
      .then(res => setTree(res.data.sections || []))
      .catch(err => setError('Failed to load curriculum sequence'))
      .finally(() => setLoading(false));
  }, [subjectId, setTree, setLoading, setError]);

  return (
    <AuthGuard>
      <div className="flex flex-1 overflow-hidden">
        <SubjectSidebar subjectId={subjectId} />
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
