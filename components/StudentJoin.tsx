'use client';

import React, { useState, useEffect } from 'react';
import { joinRoom } from '@/lib/firebase';
import { ArrowRight, AlertCircle, User, KeyRound, Zap } from 'lucide-react';

interface StudentJoinProps {
  initialCode?: string;
  onJoined: (code: string, studentId: string, studentName: string) => void;
}

export function StudentJoin({ initialCode = '', onJoined }: StudentJoinProps) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode.toUpperCase());
    }
    const savedName = localStorage.getItem('quizora_student_name');
    if (savedName) {
      setName(savedName);
    }
  }, [initialCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setError('Please enter your 6-letter room code!');
      return;
    }
    if (!cleanName) {
      setError('Please enter your name to join the Quizora Arena!');
      return;
    }

    setLoading(true);
    setError(null);

    let studentId = localStorage.getItem('quizora_student_id') || undefined;

    const res = await joinRoom(cleanCode, cleanName, studentId);
    setLoading(false);

    if (res.success && res.studentId) {
      localStorage.setItem('quizora_student_name', cleanName);
      localStorage.setItem('quizora_student_id', res.studentId);
      onJoined(cleanCode, res.studentId, cleanName);
    } else {
      setError(res.error || 'Could not join room. Please double-check the code!');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-6 sm:py-12 text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-2xl shadow-amber-500/30 scale-105">
        <Zap className="w-10 h-10 text-slate-950 font-black fill-current" />
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Quizora Player Arena
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          Enter your name and room code to compete!
        </p>
      </div>

      <form onSubmit={handleJoin} className="bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="text-left space-y-1.5">
          <label className="block text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Your Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            maxLength={20}
            placeholder="e.g. Ananya or Rohan"
            className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl py-3 px-4 text-white font-bold text-lg outline-none transition-colors"
          />
        </div>

        <div className="text-left space-y-1.5">
          <label className="block text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Enter Quizora Room Code</span>
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            maxLength={8}
            placeholder="K7X4P9"
            className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl py-3.5 text-center font-mono font-black text-3xl tracking-widest text-amber-300 uppercase outline-none transition-colors shadow-inner"
          />
        </div>

        {error && (
          <div className="bg-rose-950/80 border border-rose-500/50 rounded-xl p-3 text-xs sm:text-sm font-bold text-rose-200 flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Enter Arena</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
