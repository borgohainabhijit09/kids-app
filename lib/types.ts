export type RoomStatus =
  | 'waiting'   // Waiting for child to join
  | 'ready'     // Child connected, parent ready to start
  | 'playing'   // Quiz in progress, question active
  | 'answering' // Child selected an answer, waiting for parent reveal
  | 'revealed'  // Parent revealed answer result
  | 'finished'; // Quiz complete

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string]; // [Option A, Option B, Option C, Option D]
  correctAnswer: number; // 0 for A, 1 for B, 2 for C, 3 for D
}

export interface StudentState {
  connected: boolean;
  answer: number | null; // Selected option index (0-3) or null
  answered: boolean;
  score: number;
}

export interface QuizRoom {
  id?: string;
  title: string;
  status: RoomStatus;
  currentQuestion: number;
  revealed: boolean;
  createdAt: number;
  questions: Question[];
  student?: StudentState;
}
