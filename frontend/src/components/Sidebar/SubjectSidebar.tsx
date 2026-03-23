'use client';
import React from 'react';
import { useSidebarStore } from '../../store/sidebarStore';
import { useVideoStore } from '../../store/videoStore';
import { SectionItem } from './SectionItem';
import { Spinner } from '../common/Spinner';
import { Alert } from '../common/Alert';

interface SubjectSidebarProps {
  subjectId: number;
}

export const SubjectSidebar: React.FC<SubjectSidebarProps> = ({ subjectId }) => {
  const { tree, loading, error } = useSidebarStore();
  const { currentVideoId } = useVideoStore();

  if (loading) return <div className="w-80 h-full border-r border-slate-200 flex justify-center pt-10"><Spinner /></div>;
  if (error) return <div className="w-80 h-full border-r border-slate-200 p-4"><Alert type="error" message={error} /></div>;

  return (
    <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto h-[calc(100vh-4rem)] flex-shrink-0 pt-8 pb-12">
      {tree.length === 0 ? (
        <p className="px-6 text-slate-500 text-sm">No sections available.</p>
      ) : (
        tree.map(sec => (
          <SectionItem key={sec.id} section={sec} currentVideoId={currentVideoId} subjectId={subjectId} />
        ))
      )}
    </aside>
  );
};
