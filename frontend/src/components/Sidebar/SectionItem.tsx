import React from 'react';
import Link from 'next/link';

interface SectionItemProps {
  section: any;
  currentVideoId: number | null;
  subjectId: number;
}

export const SectionItem: React.FC<SectionItemProps> = ({ section, currentVideoId, subjectId }) => {
  return (
    <div className="mb-6">
      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-6">{section.title}</h4>
      <div className="space-y-0.5">
        {section.videos.map((vid: any) => {
          const isActive = currentVideoId === vid.id;
          return (
            <Link 
              key={vid.id} 
              href={vid.locked ? '#' : `/subjects/${subjectId}/video/${vid.id}`}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                vid.locked 
                  ? 'text-slate-400 cursor-not-allowed' 
                  : isActive 
                    ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={e => vid.locked && e.preventDefault()}
            >
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                {vid.locked ? (
                  <span className="text-slate-300 text-[10px]">🔒</span>
                ) : vid.is_completed ? (
                  <span className="text-green-500 text-xs">✓</span>
                ) : isActive ? (
                  <span className="text-blue-500 text-[10px]">▶</span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                )}
              </div>
              <span className="truncate leading-none pt-0.5">{vid.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
