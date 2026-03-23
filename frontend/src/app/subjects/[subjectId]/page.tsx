'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '../../../lib/apiClient';
import { Spinner } from '../../../components/common/Spinner';

export default function SubjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = parseInt(params.subjectId as string);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/subjects/${subjectId}/first-video`)
      .then(res => {
        if (res.data.video_id) {
          router.replace(`/subjects/${subjectId}/video/${res.data.video_id}`);
        } else {
          setLoading(false);
        }
      })
      .catch(err => setLoading(false));
  }, [subjectId, router]);

  if (loading) return <div className="h-full flex items-center justify-center p-20"><Spinner size="lg" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center h-full text-center">
      <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Course Overview</h2>
      <p className="text-slate-600 text-lg">No lessons are currently available for this course or you have fully completed the curriculum.</p>
    </div>
  );
}
