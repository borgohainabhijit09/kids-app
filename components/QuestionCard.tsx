import React from 'react';
import { Award } from 'lucide-react';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  points?: number;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  points,
}: QuestionCardProps) {
  const currentPoints = points ?? questionNumber * 1000;

  return (
    <div className="w-full relative">
      {/* Top Meta info bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-400/90 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-black text-amber-300 bg-slate-900/90 border border-amber-500/30 px-3 py-1 rounded-full shadow-lg">
          <Award className="w-4 h-4 text-amber-400" />
          <span>🏆 {currentPoints.toLocaleString()} Points</span>
        </div>
      </div>

      {/* Main Question Display Box */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-slate-900/95 border-2 border-amber-500/50 kbc-glow-gold shadow-2xl text-center flex flex-col justify-center min-h-[140px] sm:min-h-[160px]">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] rounded-2xl pointer-events-none" />

        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-relaxed tracking-wide drop-shadow-md">
          {questionText}
        </h2>
      </div>
    </div>
  );
}
