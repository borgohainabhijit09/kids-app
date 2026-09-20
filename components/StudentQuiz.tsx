'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizRoom, Question } from '@/lib/types';
import { subscribeToRoom, submitAnswer } from '@/lib/firebase';
import { QuestionCard } from './QuestionCard';
import { AnswerButton } from './AnswerButton';
import { Sparkles, Trophy, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface StudentQuizProps {
  roomCode: string;
  onReset: () => void;
}

export function StudentQuiz({ roomCode, onReset }: StudentQuizProps) {
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);
    });
    return () => unsubscribe();
  }, [roomCode]);

  // Sync student's selected answer from database
  useEffect(() => {
    if (room?.student?.answer !== undefined && room.student.answer !== null) {
      setSelectedOption(room.student.answer);
    } else if (room?.revealed === false) {
      setSelectedOption(null);
    }
  }, [room?.currentQuestion, room?.student?.answer, room?.revealed]);

  // Trigger celebratory confetti on answer reveal or quiz completion
  useEffect(() => {
    if (!room) return;

    if (room.status === 'finished') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else if (room.revealed && room.questions[room.currentQuestion]) {
      const isCorrect = selectedOption === room.questions[room.currentQuestion].correctAnswer;
      if (isCorrect) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }
  }, [room?.revealed, room?.status]);

  if (!room) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-amber-300 font-bold">Connecting to Quiz Room {roomCode}...</p>
      </div>
    );
  }

  // 1. Student Waiting Screen
  if (room.status === 'waiting' || room.status === 'ready') {
    return (
      <div className="w-full max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-6xl animate-bounce">🎉</div>
          <h2 className="text-3xl font-black text-white">You're in!</h2>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">
              Quiz Title
            </span>
            <p className="text-xl font-extrabold text-white">{room.title}</p>
          </div>

          <div className="bg-amber-950/60 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-center space-x-3 text-amber-300 font-extrabold text-sm sm:text-base animate-pulse">
            <Clock className="w-5 h-5 shrink-0" />
            <span>Waiting for Dad to start the quiz...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Student Finished Screen
  if (room.status === 'finished') {
    const totalQ = room.questions.length;
    const score = room.student?.score || 0;
    const accuracy = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;

    return (
      <div className="w-full max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-6xl">🏆</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Quiz Complete!</h2>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">
              Final Score
            </span>
            <div className="text-5xl font-black text-amber-400">
              {score} <span className="text-2xl text-slate-500">/ {totalQ}</span>
            </div>
            <p className="text-emerald-400 font-extrabold text-lg">
              Accuracy: {accuracy}%
            </p>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-sm font-semibold text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Correct Answers:</span>
              <span className="text-emerald-400 font-bold">{score}</span>
            </div>
            <div className="flex justify-between">
              <span>Wrong Answers:</span>
              <span className="text-rose-400 font-bold">{totalQ - score}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
          >
            Play Another Quiz
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Playing Screen
  const currentQIndex = room.currentQuestion || 0;
  const currentQ: Question | undefined = room.questions[currentQIndex];
  if (!currentQ) return null;

  const letterLabels: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const isAnswered = selectedOption !== null;
  const isRevealed = room.revealed;
  const isCorrect = isRevealed && selectedOption === currentQ.correctAnswer;
  const isWrong = isRevealed && isAnswered && selectedOption !== currentQ.correctAnswer;

  const handleSelectOption = async (index: number) => {
    if (isAnswered || isRevealed) return;
    setSelectedOption(index);
    await submitAnswer(roomCode, index);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-4 px-2 sm:px-0 select-none">
      {/* Question Header Card */}
      <QuestionCard
        questionNumber={currentQIndex + 1}
        totalQuestions={room.questions.length}
        questionText={currentQ.question}
        points={(currentQIndex + 1) * 1000}
      />

      {/* Answer Reveal Feedback Banner */}
      {isRevealed && (
        <div
          className={`p-4 rounded-2xl border-2 text-center font-black text-lg flex items-center justify-center space-x-2 shadow-2xl transition-all ${
            isCorrect
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 kbc-glow-green scale-[1.02]'
              : 'bg-rose-950/90 border-rose-500 text-rose-300 kbc-glow-red'
          }`}
        >
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              <span>🎉 Correct! +1,000 Points</span>
            </>
          ) : (
            <>
              <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
              <div>
                <span>Not quite! </span>
                <span className="text-xs sm:text-sm font-normal block text-rose-200">
                  Correct answer: <strong className="font-bold text-amber-300">{letterLabels[currentQ.correctAnswer]} — {currentQ.options[currentQ.correctAnswer]}</strong>
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Answer Waiting Banner (Selected but not yet revealed by parent) */}
      {isAnswered && !isRevealed && (
        <div className="bg-blue-950/80 border border-blue-400/40 p-3.5 rounded-2xl text-center text-xs sm:text-sm font-bold text-blue-200 flex items-center justify-center space-x-2 animate-pulse">
          <Clock className="w-4 h-4 text-blue-300" />
          <span>Answer selected ✓ Waiting for Dad to reveal...</span>
        </div>
      )}

      {/* 4 Touch-Friendly Answer Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        {currentQ.options.map((optText, idx) => {
          const isThisSelected = selectedOption === idx;
          const isThisCorrect = idx === currentQ.correctAnswer;
          const isThisWrong = isRevealed && isThisSelected && !isThisCorrect;

          return (
            <AnswerButton
              key={idx}
              label={letterLabels[idx]}
              text={optText}
              onClick={() => handleSelectOption(idx)}
              isSelected={isThisSelected}
              isCorrect={isRevealed && isThisCorrect}
              isWrong={isThisWrong}
              isRevealed={isRevealed}
              disabled={isAnswered || isRevealed}
            />
          );
        })}
      </div>
    </div>
  );
}
