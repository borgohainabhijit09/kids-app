'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { QuizCreator } from '@/components/QuizCreator';
import { HostQuiz } from '@/components/HostQuiz';
import { createRoom } from '@/lib/firebase';
import { Question, QuizMode } from '@/lib/types';
import { Sparkles, ArrowRight, School, User } from 'lucide-react';

export default function ParentHomePage() {
  const [activeView, setActiveView] = useState<'home' | 'create' | 'host'>('home');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);

  const handleCreateRoom = async (title: string, questions: Question[], mode: QuizMode) => {
    const code = await createRoom(title, questions, mode);
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
          <div className="py-10 space-y-10 text-center max-w-2xl mx-auto">
            {/* Hero Badge */}
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase px-4 py-2 rounded-full tracking-wider animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Real-Time Quiz & Classroom Competition Platform</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                🎓 Dad's & Teacher's Quiz
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed">
                Play 1-on-1 with your kids or host a multi-student classroom competition with speed bonus scoring!
              </p>
            </div>

            {/* Modes Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-slate-900/80 border border-amber-500/30 p-5 rounded-2xl space-y-2 kbc-glow-gold">
                <div className="flex items-center space-x-2 text-amber-400 font-black text-lg">
                  <School className="w-5 h-5" />
                  <span>Classroom Competition</span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Multiple students enter names, answer on their devices, earn ⚡ Speed Bonus points, and compete on a Live Leaderboard & Winner Podium!
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-black text-lg">
                  <User className="w-5 h-5" />
                  <span>1-on-1 Dad's Quiz</span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Direct remote quiz control for parent and child across any distance. Simple, fun, and fast!
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setActiveView('create')}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-xl rounded-2xl shadow-2xl shadow-amber-500/20 hover:scale-105 transition-all inline-flex items-center justify-center gap-3"
              >
                <span>Create Quiz Competition</span>
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
        Dad's & Teacher's Quiz • Real-Time Classroom & Remote Learning • KBC Inspired
      </footer>
    </div>
  );
}
