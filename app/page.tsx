'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { QuizCreator } from '@/components/QuizCreator';
import { HostQuiz } from '@/components/HostQuiz';
import { createRoom } from '@/lib/firebase';
import { Question, QuizMode } from '@/lib/types';
import { Sparkles, ArrowRight, School, User, Zap, Trophy, ShieldCheck } from 'lucide-react';

export default function ParentHomePage() {
  const [activeView, setActiveView] = useState<'home' | 'create' | 'host'>('home');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);

  const handleCreateRoom = async (title: string, questions: Question[], mode: QuizMode, category: string) => {
    const code = await createRoom(title, questions, mode, 'public', 'anonymous', category);
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
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              <span>Multi-Tenant Real-Time Quiz SaaS Platform</span>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                Quizora
              </h1>
              <p className="text-xl sm:text-2xl font-black text-amber-400 tracking-wider">
                Learn. Play. Compete.
              </p>
              <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-xl mx-auto">
                The modern interactive quiz platform for parents, teachers, and schools. Play 1-on-1 remotely or host multi-student classroom competitions!
              </p>
            </div>

            {/* Modes & Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-slate-900/80 border border-amber-500/30 p-5 rounded-2xl space-y-2 kbc-glow-gold">
                <div className="flex items-center space-x-2 text-amber-400 font-black text-lg">
                  <School className="w-5 h-5" />
                  <span>Classroom Competition</span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Multiple students join with names on their devices. Features ⚡ Speed Bonus scoring, live answer distribution, leaderboards, and grand podium ceremonies!
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-black text-lg">
                  <User className="w-5 h-5" />
                  <span>1-on-1 Family Remote Quiz</span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Direct remote quiz control for parents and kids across any distance. Simple, fast, and interactive.
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
                <span>Create Quizora Session</span>
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
        Quizora • Learn. Play. Compete. • Production Multi-Tenant Platform
      </footer>
    </div>
  );
}
