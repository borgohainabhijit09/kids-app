'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { QuizCreator } from '@/components/QuizCreator';
import { HostQuiz } from '@/components/HostQuiz';
import { createRoom } from '@/lib/firebase';
import { Question } from '@/lib/types';
import { Sparkles, Trophy, ArrowRight, Play, Laptop } from 'lucide-react';

export default function ParentHomePage() {
  const [activeView, setActiveView] = useState<'home' | 'create' | 'host'>('home');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);

  const handleCreateRoom = async (title: string, questions: Question[]) => {
    const code = await createRoom(title, questions);
    setActiveRoomCode(code);
    setActiveView('host');
  };

  const handleReset = () => {
    setActiveRoomCode(null);
    setActiveView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header roomCode={activeRoomCode || undefined} role="parent" />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8">
        {activeView === 'home' && (
          <div className="py-12 space-y-12 text-center max-w-2xl mx-auto">
            {/* Hero Badge */}
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase px-4 py-2 rounded-full tracking-wider animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Real-Time Parent-Child Remote Quiz</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                🎓 Dad's Quiz
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed">
                Create a quiz and play together in real time — even 3,500 km away!
              </p>
            </div>

            {/* Features preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-amber-400 text-xl font-bold">1. Create</div>
                <p className="text-xs text-slate-400 font-medium">
                  Type questions or load pre-built Class 2 GK/EVS demo quizzes.
                </p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-amber-400 text-xl font-bold">2. Share Code</div>
                <p className="text-xs text-slate-400 font-medium">
                  Share the 6-letter room code (e.g. K7X4P9) for your child to join at /play.
                </p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-amber-400 text-xl font-bold">3. Play & Control</div>
                <p className="text-xs text-slate-400 font-medium">
                  See live student answers instantly, reveal answer, and advance questions!
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={() => setActiveView('create')}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-xl rounded-2xl shadow-2xl shadow-amber-500/20 hover:scale-105 transition-all inline-flex items-center justify-center gap-3"
              >
                <span>Create Quiz Now</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {activeView === 'create' && (
          <QuizCreator onCreateRoom={handleCreateRoom} />
        )}

        {activeView === 'host' && activeRoomCode && (
          <HostQuiz roomCode={activeRoomCode} onReset={handleReset} />
        )}
      </main>

      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 font-medium">
        Dad's Quiz • Class 2 Remote Real-Time Learning • KBC Inspired
      </footer>
    </div>
  );
}
