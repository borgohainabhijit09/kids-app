export type RoomStatus =
  | 'waiting'   // Waiting for students to join
  | 'ready'     // Students connected, host ready to start
  | 'playing'   // Quiz in progress, question active
  | 'revealed'  // Host revealed answer result & leaderboard
  | 'finished'; // Quiz complete

export type QuizMode = '1on1' | 'multiplayer';

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string]; // [Option A, Option B, Option C, Option D]
  correctAnswer: number; // 0 for A, 1 for B, 2 for C, 3 for D
}

export interface StudentState {
  id: string;
  name: string;
  connected: boolean;
  answer: number | null; // Selected option index (0-3) or null
  answered: boolean;
  answerTime: number | null; // Timestamp when answer was submitted
  lastPointsGained: number; // Points gained on current question (including speed bonus)
  totalScore: number; // Cumulative points across all questions
}

export interface QuizTemplate {
  id: string;
  title: string;
  category: string;
  tenantId: string;
  createdBy: string;
  isPublic: boolean;
  questions: Question[];
  createdAt: number;
}

export interface QuizRoom {
  id?: string;
  title: string;
  mode: QuizMode;
  status: RoomStatus;
  tenantId?: string; // Multi-tenant organization / tenant identifier
  createdBy?: string; // Creator user or 'anonymous'
  category?: string; // e.g. EVS, Math, GK, Science
  isPublic?: boolean;
  currentQuestion: number;
  questionStartTime: number | null; // Timestamp when active question started
  revealed: boolean;
  createdAt: number;
  questions: Question[];
  students?: Record<string, StudentState>;
  student?: StudentState;
}
