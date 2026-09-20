import React from 'react';
import Link from 'next/link';
import { Sparkles, Trophy } from 'lucide-react';

interface HeaderProps {
  roomCode?: string;
  role?: 'parent' | 'student';
}

export function Header({ roomCode, role }: HeaderProps) {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-amber-500/20 py-3 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center space-x-2 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
          <Trophy className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            Dad's Quiz <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-amber-400/80 font-medium">Real-Time KBC Remote Quiz</p>
        </div>
      </Link>

      <div className="flex items-center space-x-3">
        {roomCode && (
          <div className="bg-slate-900 border border-amber-500/40 px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">Room:</span>
            <span className="font-mono font-bold tracking-widest text-amber-400 text-sm">{roomCode}</span>
          </div>
        )}

        {role && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
            role === 'parent' 
              ? 'bg-purple-950 text-purple-300 border border-purple-500/30' 
              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
          }`}>
            {role === 'parent' ? '👨 Control' : '👦 Player'}
          </span>
        )}
      </div>
    </header>
  );
}
