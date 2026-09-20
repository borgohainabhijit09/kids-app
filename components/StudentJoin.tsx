'use client';

import React, { useState, useEffect } from 'react';
import { joinRoom } from '@/lib/firebase';
import { Sparkles, Play, AlertCircle, ArrowRight } from 'lucide-react';

interface StudentJoinProps {
  initialCode?: string;
  onJoined: (code: string) => void;
}

export function StudentJoin({ initialCode = '', onJoined }: StudentJoinProps) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode.toUpperCase());
    }
  }, [initialCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter your 6-letter room code!');
      return;
    }
    if (cleanCode.length < 4) {
      setError('Room code must be at least 4-6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await joinRoom(cleanCode);
    setLoading(false);

    if (res.success) {
      onJoined(cleanCode);
    } else {
      setError(res.error || 'Could not join quiz. Please double-check the code with Dad!');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 sm:py-16 text-center space-y-8">
      {/* Big Friendly Header Icon */}
      <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-2xl shadow-amber-500/30 scale-105">
        <span className="text-4xl">🎓</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Join Quiz!
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-medium">
          Enter the Room Code from Dad to start playing together.
        </p>
      </div>

      {/* Code Input Form */}
      <form onSubmit={handleJoin} className="bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <label className="block text-xs font-black uppercase text-amber-400 tracking-widest mb-2">
            Enter Quiz Code
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
            className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl py-4 text-center font-mono font-black text-3xl sm:text-4xl tracking-widest text-amber-300 uppercase outline-none transition-colors shadow-inner"
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
              <span>Join Quiz</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
