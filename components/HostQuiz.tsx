'use client';

import React, { useEffect, useState } from 'react';
import { QuizRoom, Question } from '@/lib/types';
import {
  subscribeToRoom,
  startQuiz,
  revealAnswer,
  nextQuestion,
  endQuiz,
} from '@/lib/firebase';
import { QuestionCard } from './QuestionCard';
import { AnswerButton } from './AnswerButton';
import { Copy, Check, Users, Play, Eye, ArrowRight, Flag, Award } from 'lucide-react';

interface HostQuizProps {
  roomCode: string;
  onReset: () => void;
}

export function HostQuiz({ roomCode, onReset }: HostQuizProps) {
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);
    });
    return () => unsubscribe();
  }, [roomCode]);

  if (!room) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-amber-300 font-bold">Connecting to Quiz Room {roomCode}...</p>
      </div>
    );
  }

  const currentQIndex = room.currentQuestion || 0;
  const currentQ: Question | undefined = room.questions[currentQIndex];
  const isStudentConnected = room.student?.connected ?? false;
  const studentAnswer = room.student?.answer ?? null;
  const hasStudentAnswered = room.student?.answered ?? false;

  const handleCopyLink = () => {
    const playUrl = `${window.location.origin}/play?code=${roomCode}`;
    navigator.clipboard.writeText(playUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartQuiz = async () => {
    await startQuiz(roomCode);
  };

  const handleReveal = async () => {
    if (!currentQ || studentAnswer === null) return;
    const isCorrect = studentAnswer === currentQ.correctAnswer;
    const currentScore = room.student?.score || 0;
    await revealAnswer(roomCode, isCorrect, currentScore);
  };

  const handleNextQuestion = async () => {
    const nextIndex = currentQIndex + 1;
    if (nextIndex >= room.questions.length) {
      await endQuiz(roomCode);
    } else {
      await nextQuestion(roomCode, nextIndex);
    }
  };

  const handleEndQuiz = async () => {
    await endQuiz(roomCode);
  };

  // 1. Waiting Room View
  if (room.status === 'waiting' || room.status === 'ready') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8 py-6 text-center">
        <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase px-4 py-1.5 rounded-full tracking-wider">
            Quiz Ready!
          </div>

          <h2 className="text-3xl font-black text-white">{room.title}</h2>

          {/* Large Room Code */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">
              Share Room Code
            </span>
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-widest text-amber-400 drop-shadow-md">
              {roomCode}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium pt-1">
              Ask your child to open <span className="font-mono text-amber-300 font-bold">/play</span> and enter this code.
            </p>
          </div>

          {/* Copy Share Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copy Play Link ({window.location.origin}/play?code={roomCode})</span>
              </>
            )}
          </button>

          {/* Player Status Badge */}
          <div className="pt-2">
            <div
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border text-sm font-bold shadow-lg ${
                isStudentConnected
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-amber-400/90'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>
                {isStudentConnected ? '👦 Player connected' : '⏳ Waiting for player to join...'}
              </span>
            </div>
          </div>

          {/* Start Quiz Action Button */}
          <button
            type="button"
            onClick={handleStartQuiz}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Start Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Finished View
  if (room.status === 'finished') {
    const totalQ = room.questions.length;
    const score = room.student?.score || 0;
    const accuracy = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;

    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 py-6 text-center">
        <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-5xl">🎉</div>
          <h2 className="text-3xl font-black text-white">Quiz Completed!</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-bold block uppercase">Total Score</span>
              <span className="text-3xl font-black text-amber-400">{score} / {totalQ}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-bold block uppercase">Accuracy</span>
              <span className="text-3xl font-black text-emerald-400">{accuracy}%</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Correct Answers:</span>
              <span className="font-bold text-emerald-400">{score}</span>
            </div>
            <div className="flex justify-between">
              <span>Wrong Answers:</span>
              <span className="font-bold text-rose-400">{totalQ - score}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg rounded-xl shadow-lg transition-all"
          >
            Create Another Quiz
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Host Quiz Controller View
  if (!currentQ) return null;

  const letterLabels: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 py-4">
      {/* Student Status Bar */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${isStudentConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
          <span className="text-xs sm:text-sm font-bold text-slate-300">
            Student: <span className={isStudentConnected ? 'text-emerald-400 font-extrabold' : 'text-rose-400'}>
              {isStudentConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </span>
        </div>

        {/* Live Answer Status */}
        <div className="text-xs sm:text-sm font-extrabold">
          {hasStudentAnswered && studentAnswer !== null ? (
            <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Answer selected: {letterLabels[studentAnswer]} — {currentQ.options[studentAnswer]}
            </span>
          ) : (
            <span className="text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full animate-pulse">
              ⏳ Waiting for child's answer...
            </span>
          )}
        </div>
      </div>

      {/* Question Card Display */}
      <QuestionCard
        questionNumber={currentQIndex + 1}
        totalQuestions={room.questions.length}
        questionText={currentQ.question}
        points={(currentQIndex + 1) * 1000}
      />

      {/* 4 Options Grid (Host read-only view with correct answer highlighted) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((optText, idx) => {
          const isSelectedByStudent = studentAnswer === idx;
          const isCorrectAnswer = idx === currentQ.correctAnswer;
          const isWrongSelection = room.revealed && isSelectedByStudent && !isCorrectAnswer;

          return (
            <div key={idx} className="relative">
              <AnswerButton
                label={letterLabels[idx]}
                text={optText}
                isSelected={isSelectedByStudent}
                isCorrect={room.revealed && isCorrectAnswer}
                isWrong={isWrongSelection}
                isRevealed={room.revealed}
                readOnly
              />
              {isCorrectAnswer && !room.revealed && (
                <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wider font-black bg-emerald-900/90 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-md">
                  Correct Option
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Controller Buttons Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleEndQuiz}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-slate-950 border border-rose-500/30 hover:bg-rose-950/30 flex items-center justify-center gap-1.5"
        >
          <Flag className="w-4 h-4" />
          End Quiz
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {!room.revealed ? (
            <button
              type="button"
              onClick={handleReveal}
              disabled={!hasStudentAnswered}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
                hasStudentAnswered
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:scale-105 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span>Reveal Answer</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-base bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>
                {currentQIndex + 1 >= room.questions.length ? 'Finish Quiz 🎉' : 'Next Question'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
