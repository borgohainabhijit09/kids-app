'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizRoom, Question, StudentState } from '@/lib/types';
import {
  subscribeToRoom,
  startQuiz,
  revealAnswer,
  nextQuestion,
  endQuiz,
} from '@/lib/firebase';
import { QuestionCard } from './QuestionCard';
import { AnswerButton } from './AnswerButton';
import { Copy, Check, Users, Play, Eye, ArrowRight, Flag, Trophy, Zap } from 'lucide-react';

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

  useEffect(() => {
    if (room?.status === 'finished') {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    }
  }, [room?.status]);

  if (!room) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-amber-300 font-bold">Connecting to Quizora Host Studio ({roomCode})...</p>
      </div>
    );
  }

  const studentsList: StudentState[] = room.students
    ? Object.values(room.students)
    : room.student
    ? [room.student]
    : [];

  const connectedStudents = studentsList.filter((s) => s.connected);
  const answeredStudents = studentsList.filter((s) => s.answered);
  const rankedStudents = [...studentsList].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  const currentQIndex = room.currentQuestion || 0;
  const currentQ: Question | undefined = room.questions[currentQIndex];

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
    await revealAnswer(roomCode);
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

  // 1. Waiting Room / Lobby View
  if (room.status === 'waiting' || room.status === 'ready') {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-8 py-6 text-center">
        <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase px-4 py-1 rounded-full tracking-wider">
              ⚡ Quizora Host Studio
            </span>
            {room.category && (
              <span className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
                {room.category}
              </span>
            )}
          </div>

          <h2 className="text-3xl font-black text-white">{room.title}</h2>

          {/* Large Room Code Box */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">
              Quizora Room Code
            </span>
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-widest text-amber-400 drop-shadow-md">
              {roomCode}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium pt-1">
              Ask participants to open <span className="font-mono text-amber-300 font-bold">/play</span> and enter code <strong className="text-amber-400">{roomCode}</strong>.
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
                <span className="text-emerald-400">Quizora Link Copied! ({window.location.origin}/play?code={roomCode})</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copy Quizora Player Link</span>
              </>
            )}
          </button>

          {/* Joined Students Grid */}
          <div className="space-y-3 pt-2 text-left">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold uppercase text-amber-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Connected Participants ({studentsList.length})</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {connectedStudents.length} Online
              </span>
            </div>

            {studentsList.length === 0 ? (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-sm">
                ⏳ Waiting for participants to join on their devices...
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-2.5 max-h-48 overflow-y-auto">
                {studentsList.map((st) => (
                  <div
                    key={st.id}
                    className={`px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-extrabold flex items-center space-x-2 shadow-md ${
                      st.connected
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${st.connected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                    <span>{st.name || 'Player'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Competition Action Button */}
          <button
            type="button"
            onClick={handleStartQuiz}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Start Quizora Session ({studentsList.length} Players)</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Finished View — Winner Podium Ceremony
  if (room.status === 'finished') {
    const firstPlace = rankedStudents[0];
    const secondPlace = rankedStudents[1];
    const thirdPlace = rankedStudents[2];

    return (
      <div className="w-full max-w-3xl mx-auto space-y-8 py-6 text-center">
        <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">
              Quizora Session Complete
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">🏆 Winner Podium</h2>
          </div>

          {/* 3D Podium Layout */}
          <div className="flex items-end justify-center gap-2 sm:gap-4 pt-8 pb-4 min-h-[220px]">
            {secondPlace && (
              <div className="flex flex-col items-center flex-1 max-w-[120px]">
                <div className="text-xs font-black text-slate-300 mb-1 truncate w-full">
                  {secondPlace.name}
                </div>
                <div className="text-xs text-amber-300 font-bold mb-2">
                  {secondPlace.totalScore.toLocaleString()} pts
                </div>
                <div className="w-full bg-slate-800 border-t-4 border-slate-400 h-28 rounded-t-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-black text-slate-300">🥈 2nd</span>
                </div>
              </div>
            )}

            {firstPlace && (
              <div className="flex flex-col items-center flex-1 max-w-[140px] -mt-6">
                <div className="text-sm font-black text-amber-300 mb-1 truncate w-full animate-bounce">
                  👑 {firstPlace.name}
                </div>
                <div className="text-sm text-yellow-400 font-black mb-2">
                  {firstPlace.totalScore.toLocaleString()} pts
                </div>
                <div className="w-full bg-gradient-to-t from-amber-600 to-yellow-400 border-t-4 border-amber-300 h-36 rounded-t-2xl flex items-center justify-center shadow-2xl kbc-glow-gold">
                  <span className="text-4xl font-black text-slate-950">🥇 1st</span>
                </div>
              </div>
            )}

            {thirdPlace && (
              <div className="flex flex-col items-center flex-1 max-w-[120px]">
                <div className="text-xs font-black text-amber-600 mb-1 truncate w-full">
                  {thirdPlace.name}
                </div>
                <div className="text-xs text-amber-400 font-bold mb-2">
                  {thirdPlace.totalScore.toLocaleString()} pts
                </div>
                <div className="w-full bg-amber-950 border-t-4 border-amber-700 h-20 rounded-t-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-amber-500">🥉 3rd</span>
                </div>
              </div>
            )}
          </div>

          {/* Full Classroom Final Standings Table */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              Quizora Final Standings ({rankedStudents.length} Participants)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {rankedStudents.map((st, idx) => (
                <div
                  key={st.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-sm ${
                    idx === 0
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-black text-amber-400 w-6">#{idx + 1}</span>
                    <span className="font-bold">{st.name}</span>
                  </div>
                  <span className="font-mono font-black text-amber-400">
                    {st.totalScore.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl transition-all"
          >
            Create Another Quizora Session
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Competition Controller View
  if (!currentQ) return null;

  const letterLabels: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  const optionCounts = [0, 0, 0, 0];
  studentsList.forEach((st) => {
    if (st.answered && st.answer !== null && st.answer >= 0 && st.answer < 4) {
      optionCounts[st.answer]++;
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
      {/* Live Classroom Status Bar */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs sm:text-sm font-bold text-slate-300">
            Active Participants: <strong className="text-emerald-400">{connectedStudents.length} / {studentsList.length}</strong>
          </span>
        </div>

        <div className="text-xs sm:text-sm font-extrabold flex items-center space-x-2">
          <span className="text-amber-400 bg-amber-950/80 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
            ⏳ Answers Received: <strong>{answeredStudents.length} / {studentsList.length}</strong>
          </span>
        </div>
      </div>

      {/* Question Display */}
      <QuestionCard
        questionNumber={currentQIndex + 1}
        totalQuestions={room.questions.length}
        questionText={currentQ.question}
        points={(currentQIndex + 1) * 1000}
      />

      {/* 4 Options Grid with Live Distribution Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {currentQ.options.map((optText, idx) => {
          const isCorrectAnswer = idx === currentQ.correctAnswer;
          const count = optionCounts[idx];

          return (
            <div key={idx} className="relative">
              <AnswerButton
                label={letterLabels[idx]}
                text={optText}
                isCorrect={room.revealed && isCorrectAnswer}
                isRevealed={room.revealed}
                readOnly
              />
              <div className="absolute top-3 right-3 flex items-center space-x-1">
                {isCorrectAnswer && !room.revealed && (
                  <span className="text-[10px] uppercase font-black bg-emerald-900/90 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-md mr-1">
                    Correct Option
                  </span>
                )}
                <span className="text-xs font-black bg-slate-950 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg shadow">
                  {count} {count === 1 ? 'answer' : 'answers'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Classroom Leaderboard View */}
      {room.revealed && (
        <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Quizora Leaderboard (Speed & Accuracy)</span>
            </h3>
            <span className="text-xs text-amber-400/90 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" /> Speed Bonus Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {rankedStudents.slice(0, 6).map((st, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
              return (
                <div
                  key={st.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-bold ${
                    idx === 0
                      ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-base">{medal}</span>
                    <span className="truncate max-w-[120px]">{st.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-amber-400">{st.totalScore.toLocaleString()} pts</div>
                    {st.lastPointsGained > 0 && (
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        +{st.lastPointsGained} pts ⚡
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Host Action Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleEndQuiz}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-slate-950 border border-rose-500/30 hover:bg-rose-950/30 flex items-center justify-center gap-1.5"
        >
          <Flag className="w-4 h-4" />
          End Session
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {!room.revealed ? (
            <button
              type="button"
              onClick={handleReveal}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-base rounded-xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              <span>Reveal Answer & Leaderboard</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-base bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>
                {currentQIndex + 1 >= room.questions.length ? 'Finish Session 🎉' : 'Next Question'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
