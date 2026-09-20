'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { StudentJoin } from '@/components/StudentJoin';
import { StudentQuiz } from '@/components/StudentQuiz';

function StudentPageContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    const savedName = localStorage.getItem('dads_quiz_student_name');
    const savedId = localStorage.getItem('dads_quiz_student_id');
    if (savedName) setStudentName(savedName);
    if (savedId) setStudentId(savedId);
  }, []);

  const handleJoined = (code: string, id: string, name: string) => {
    setActiveCode(code);
    setStudentId(id);
    setStudentName(name);
  };

  const handleReset = () => {
    setActiveCode(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header roomCode={activeCode || undefined} role="student" />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        {!activeCode || !studentId ? (
          <StudentJoin initialCode={initialCode} onJoined={handleJoined} />
        ) : (
          <StudentQuiz
            roomCode={activeCode}
            studentId={studentId}
            studentName={studentName}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 font-medium">
        Dad's Quiz • Student Competition Room • Class 2 Learning
      </footer>
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-300 font-bold">
          Loading Quiz Room...
        </div>
      }
    >
      <StudentPageContent />
    </Suspense>
  );
}
