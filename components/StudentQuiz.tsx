'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizRoom, Question, StudentState } from '@/lib/types';
import { subscribeToRoom, submitAnswer } from '@/lib/firebase';
import { QuestionCard } from './QuestionCard';
import { AnswerButton } from './AnswerButton';
import { Trophy, CheckCircle2, XCircle, Clock, Zap, Users } from 'lucide-react';

interface StudentQuizProps {
  roomCode: string;
  studentId: string;
  studentName: string;
  onReset: () => void;
}

export function StudentQuiz({
  roomCode,
  studentId,
  studentName,
  onReset,
}: StudentQuizProps) {
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);
    });
    return () => unsubscribe();
  }, [roomCode]);

  const myStudentState: StudentState | undefined = room?.students?.[studentId] || room?.student;
  const totalStudentsCount = room?.students ? Object.keys(room.students).length : 1;

  let myRank = 1;
  if (room?.students && myStudentState) {
    const sorted = Object.values(room.students).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    const foundIdx = sorted.findIndex((s) => s.id === studentId);
    if (foundIdx !== -1) myRank = foundIdx + 1;
  }

  useEffect(() => {
    if (myStudentState?.answer !== undefined && myStudentState.answer !== null) {
      setSelectedOption(myStudentState.answer);
    } else if (room?.revealed === false) {
      setSelectedOption(null);
    }
  }, [room?.currentQuestion, myStudentState?.answer, room?.revealed]);

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
        <p className="text-amber-300 font-bold">Connecting to Quizora Room {roomCode}...</p>
      </div>
    );
  }

  // 1. Student Waiting Screen
  if (room.status === 'waiting' || room.status === 'ready') {
    return (
      <div className="w-full max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-6xl animate-bounce">🎉</div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white">Welcome to Quizora, {studentName}!</h2>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {room.mode === 'multiplayer' ? 'Classroom Competition' : '1-on-1 Remote Quiz'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Session Title
            </span>
            <p className="text-xl font-extrabold text-white">{room.title}</p>

            {room.mode === 'multiplayer' && (
              <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-amber-300 font-bold">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{totalStudentsCount} Players in Arena</span>
              </div>
            )}
          </div>

          <div className="bg-amber-950/60 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-center space-x-3 text-amber-300 font-extrabold text-sm sm:text-base animate-pulse">
            <Clock className="w-5 h-5 shrink-0" />
            <span>Waiting for Host to start...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Student Finished Screen
  if (room.status === 'finished') {
    const score = myStudentState?.totalScore || 0;
    const rankMedal = myRank === 1 ? '🥇 1st Place Champion!' : myRank === 2 ? '🥈 2nd Place!' : myRank === 3 ? '🥉 3rd Place!' : `#${myRank} in Arena`;

    return (
      <div className="w-full max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-6xl">🏆</div>
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Quizora Complete!</h2>
            <p className="text-lg font-black text-amber-400">{studentName}</p>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="inline-block bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-base px-4 py-1.5 rounded-full">
              {rankMedal}
            </div>

            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">
                Final Score
              </span>
              <div className="text-4xl font-black text-amber-400 pt-1">
                {score.toLocaleString()} <span className="text-lg text-slate-500">pts</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
          >
            Play Another Quizora Challenge
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
  const ptsGained = myStudentState?.lastPointsGained || 0;

  const handleSelectOption = async (index: number) => {
    if (isAnswered || isRevealed) return;
    setSelectedOption(index);
    await submitAnswer(roomCode, studentId, index);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 py-4 px-2 sm:px-0 select-none">
      {/* Student Rank & Score Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-300">
          <span>Player:</span>
          <strong className="text-amber-300">{studentName}</strong>
        </div>

        {room.mode === 'multiplayer' && (
          <div className="flex items-center space-x-1.5 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-black text-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Rank #{myRank}</span>
          </div>
        )}
      </div>

      {/* Question Header Card */}
      <QuestionCard
        questionNumber={currentQIndex + 1}
        totalQuestions={room.questions.length}
        questionText={currentQ.question}
        points={myStudentState?.totalScore || (currentQIndex + 1) * 1000}
      />

      {/* Answer Reveal Feedback Banner with Speed Bonus */}
      {isRevealed && (
        <div
          className={`p-4 rounded-2xl border-2 text-center font-black text-base sm:text-lg flex flex-col items-center justify-center space-y-1 shadow-2xl transition-all ${
            isCorrect
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 kbc-glow-green scale-[1.01]'
              : 'bg-rose-950/90 border-rose-500 text-rose-300 kbc-glow-red'
          }`}
        >
          {isCorrect ? (
            <>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <span>🎉 Correct! +{ptsGained.toLocaleString()} Points</span>
              </div>
              {ptsGained > 1000 && (
                <span className="text-xs font-extrabold text-yellow-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Includes +{ptsGained - 1000} Speed Bonus!
                </span>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                <span>Not quite!</span>
              </div>
              <span className="text-xs font-medium text-rose-200">
                Correct answer: <strong className="font-bold text-amber-300">{letterLabels[currentQ.correctAnswer]} — {currentQ.options[currentQ.correctAnswer]}</strong>
              </span>
            </>
          )}
        </div>
      )}

      {/* Answer Waiting Banner */}
      {isAnswered && !isRevealed && (
        <div className="bg-blue-950/80 border border-blue-400/40 p-3.5 rounded-2xl text-center text-xs sm:text-sm font-bold text-blue-200 flex items-center justify-center space-x-2 animate-pulse">
          <Clock className="w-4 h-4 text-blue-300" />
          <span>Answer submitted ✓ Waiting for Host...</span>
        </div>
      )}

      {/* 4 Touch-Friendly Answer Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
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
