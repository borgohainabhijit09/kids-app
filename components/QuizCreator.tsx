'use client';

import React, { useState } from 'react';
import { Question, QuizMode } from '@/lib/types';
import { QUIZORA_PRESETS } from '@/lib/demoData';
import { saveQuizTemplate } from '@/lib/firebase';
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, School, User, BookmarkCheck, Check } from 'lucide-react';

interface QuizCreatorProps {
  onCreateRoom: (title: string, questions: Question[], mode: QuizMode, category: string) => void;
}

export function QuizCreator({ onCreateRoom }: QuizCreatorProps) {
  const [title, setTitle] = useState(QUIZORA_PRESETS[0].title);
  const [category, setCategory] = useState(QUIZORA_PRESETS[0].category);
  const [mode, setMode] = useState<QuizMode>('multiplayer');
  const [questions, setQuestions] = useState<Question[]>(QUIZORA_PRESETS[0].questions);
  const [templateSaved, setTemplateSaved] = useState(false);

  // Active edit state for a single question
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadPreset = (presetId: string) => {
    const preset = QUIZORA_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setTitle(preset.title);
      setCategory(preset.category);
      setQuestions(preset.questions);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!title.trim() || questions.length === 0) return;
    await saveQuizTemplate({
      title: title.trim(),
      category: category.trim() || 'General',
      tenantId: 'public',
      createdBy: 'anonymous',
      isPublic: true,
      questions,
    });
    setTemplateSaved(true);
    setTimeout(() => setTemplateSaved(false), 3000);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      alert('Please fill out the question text and all 4 options!');
      return;
    }

    const newQuestion: Question = {
      id: editingId || `q_${Date.now()}`,
      question: qText.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctAnswer,
    };

    if (editingId) {
      setQuestions(questions.map((q) => (q.id === editingId ? newQuestion : q)));
      setEditingId(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectAnswer(1);
  };

  const handleEditClick = (q: Question) => {
    setEditingId(q.id);
    setQText(q.question);
    setOptA(q.options[0]);
    setOptB(q.options[1]);
    setOptC(q.options[2]);
    setOptD(q.options[3]);
    setCorrectAnswer(q.correctAnswer);
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newQuestions.length) {
      const temp = newQuestions[index];
      newQuestions[index] = newQuestions[targetIndex];
      newQuestions[targetIndex] = temp;
      setQuestions(newQuestions);
    }
  };

  const handleFinalSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a Quiz Title!');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least 1 question to your quiz!');
      return;
    }
    onCreateRoom(title.trim(), questions, mode, category);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
      {/* Header & Presets Library */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              ⚡ Quizora Creator Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Build custom quizzes or choose from our Quizora Template Library.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAsTemplate}
            className="text-xs font-extrabold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
          >
            {templateSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Template Saved!</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4 text-amber-400" />
                <span>Save to Template Library</span>
              </>
            )}
          </button>
        </div>

        {/* Quizora Template Library Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase text-amber-400 tracking-wider">
            Quizora Template Library
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUIZORA_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset.id)}
                className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                  title === preset.title
                    ? 'bg-amber-950/80 border-amber-400 text-white kbc-glow-gold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-950 border border-amber-500/30 px-2 py-0.5 rounded-md">
                    {preset.category}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h4 className="font-extrabold text-sm text-white">{preset.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-extrabold uppercase text-amber-400 tracking-wider">
            Select Game Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMode('multiplayer')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mode === 'multiplayer'
                  ? 'bg-amber-950/80 border-amber-400 text-amber-100 kbc-glow-gold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 font-black text-lg text-white mb-1">
                <School className="w-5 h-5 text-amber-400" />
                <span>🏫 Classroom Competition Mode</span>
              </div>
              <p className="text-xs text-slate-300">
                Multiple students join with names. Includes ⚡ Speed-Based Scoring, Live Leaderboard, and Winner Podium!
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('1on1')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mode === '1on1'
                  ? 'bg-amber-950/80 border-amber-400 text-amber-100 kbc-glow-gold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 font-black text-lg text-white mb-1">
                <User className="w-5 h-5 text-amber-400" />
                <span>👨‍👦 1-on-1 Dad's Quiz Mode</span>
              </div>
              <p className="text-xs text-slate-300">
                Single student remote quiz with parent. Simple direct control without leaderboard distractions.
              </p>
            </button>
          </div>
        </div>

        {/* Title & Category Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold uppercase text-amber-400 tracking-wider mb-1.5">
              Quiz Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Class 2 EVS Competition"
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-base font-bold text-white outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-amber-400 tracking-wider mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Science"
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-base font-bold text-white outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Add / Edit Question Form */}
      <form onSubmit={handleSaveQuestion} className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-extrabold text-amber-300 flex items-center gap-2">
          {editingId ? '✏️ Edit Question' : '➕ Add Question'}
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Question Text</label>
          <input
            type="text"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Which part of a plant absorbs water from soil?"
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-medium outline-none"
          />
        </div>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {[
            { label: 'A', val: optA, set: setOptA, index: 0 },
            { label: 'B', val: optB, set: setOptB, index: 1 },
            { label: 'C', val: optC, set: setOptC, index: 2 },
            { label: 'D', val: optD, set: setOptD, index: 3 },
          ].map(({ label, val, set, index }) => (
            <div key={label} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400">Option {label}</span>
                <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctAnswer === index}
                    onChange={() => setCorrectAnswer(index)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className={correctAnswer === index ? 'font-bold text-emerald-400' : ''}>
                    Correct
                  </span>
                </label>
              </div>
              <input
                type="text"
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={`Option ${label}`}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setQText('');
                setOptA('');
                setOptB('');
                setOptC('');
                setOptD('');
              }}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {editingId ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </form>

      {/* Question List Preview */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            📋 Questions List ({questions.length})
          </h3>
          <span className="text-xs text-amber-400 font-medium">Reorder or edit anytime</span>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No questions added yet. Click "Add Question" above or choose a template preset.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 text-xs font-extrabold flex items-center justify-center border border-amber-500/30">
                      {idx + 1}
                    </span>
                    <span className="text-base font-bold text-white">{q.question}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pl-8 text-xs text-slate-400">
                    {q.options.map((opt, oIdx) => (
                      <span
                        key={oIdx}
                        className={`px-2 py-0.5 rounded border ${
                          oIdx === q.correctAnswer
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {['A', 'B', 'C', 'D'][oIdx]}: {opt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === questions.length - 1}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditClick(q)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Quiz CTA Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 p-6 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-950">Launch Quizora Session</h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-900">
            Generate your Quizora Room Code for real-time play & live ranking!
          </p>
        </div>
        <button
          type="button"
          onClick={handleFinalSubmit}
          className="px-8 py-3.5 bg-slate-950 text-amber-400 hover:bg-slate-900 font-black text-lg rounded-xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <span>Launch Quizora Room 🚀</span>
        </button>
      </div>
    </div>
  );
}
