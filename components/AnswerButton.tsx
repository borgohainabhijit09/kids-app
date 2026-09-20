import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AnswerButtonProps {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  onClick?: () => void;
  isSelected?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  isRevealed?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export function AnswerButton({
  label,
  text,
  onClick,
  isSelected = false,
  isCorrect = false,
  isWrong = false,
  isRevealed = false,
  disabled = false,
  readOnly = false,
}: AnswerButtonProps) {
  // Determine color styling based on state
  let containerStyle = 'bg-slate-900/90 border-slate-700/60 text-slate-100 hover:border-amber-400/80 hover:bg-slate-800/90 hover:scale-[1.01]';
  let badgeStyle = 'bg-slate-800 text-amber-400 border-amber-500/40';
  let icon = null;

  if (isRevealed) {
    if (isCorrect) {
      containerStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 kbc-glow-green scale-[1.02]';
      badgeStyle = 'bg-emerald-500 text-slate-950 border-emerald-300 font-extrabold';
      icon = <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 ml-2" />;
    } else if (isWrong) {
      containerStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 kbc-glow-red opacity-90';
      badgeStyle = 'bg-rose-600 text-white border-rose-400 font-extrabold';
      icon = <XCircle className="w-6 h-6 text-rose-400 shrink-0 ml-2" />;
    } else {
      containerStyle = 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-40';
      badgeStyle = 'bg-slate-900 text-slate-600 border-slate-800';
    }
  } else if (isSelected) {
    containerStyle = 'bg-blue-950/90 border-blue-400 text-blue-100 kbc-glow-blue scale-[1.01] animate-pulse';
    badgeStyle = 'bg-blue-500 text-slate-950 border-blue-300 font-extrabold';
  }

  return (
    <button
      type="button"
      onClick={disabled || readOnly ? undefined : onClick}
      disabled={disabled || readOnly}
      className={`w-full min-h-[64px] p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between shadow-xl text-left select-none relative overflow-hidden ${containerStyle} ${
        disabled && !isSelected && !isRevealed ? 'cursor-not-allowed opacity-60' : ''
      }`}
    >
      <div className="flex items-center space-x-3.5 flex-1 pr-2">
        {/* Diamond / Hexagon Badge for Option Letter */}
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-black tracking-wider shrink-0 transition-colors ${badgeStyle}`}>
          {label}
        </div>

        {/* Option Content Text */}
        <span className="text-base sm:text-lg md:text-xl font-bold leading-snug">
          {text}
        </span>
      </div>

      {/* Selected indicator checkmark before reveal */}
      {isSelected && !isRevealed && (
        <span className="text-xs font-bold text-blue-300 bg-blue-900/60 border border-blue-400/40 px-2.5 py-1 rounded-full shrink-0 animate-bounce">
          Selected ✓
        </span>
      )}

      {icon}
    </button>
  );
}
