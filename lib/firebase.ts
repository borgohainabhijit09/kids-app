import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  update,
  get,
  onValue,
  onDisconnect,
  Database
} from 'firebase/database';
import { QuizRoom, Question, StudentState } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let db: Database | null = null;

try {
  db = getDatabase(app);
} catch (error) {
  console.warn('Firebase Realtime Database initialization error:', error);
}

// Generate random 6-character Room Code (e.g. K7X4P9)
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters like O, 0, I, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Fallback in-memory store if database is offline or not configured
const memoryRooms: Record<string, QuizRoom> = {};
const memoryListeners: Record<string, Set<(room: QuizRoom | null) => void>> = {};

function notifyMemoryListeners(code: string) {
  const room = memoryRooms[code] || null;
  if (memoryListeners[code]) {
    memoryListeners[code].forEach((cb) => cb(room ? { ...room } : null));
  }
}

// Create a new quiz room
export async function createRoom(title: string, questions: Question[]): Promise<string> {
  const code = generateRoomCode();
  const newRoom: QuizRoom = {
    id: code,
    title,
    status: 'waiting',
    currentQuestion: 0,
    revealed: false,
    createdAt: Date.now(),
    questions,
    student: {
      connected: false,
      answer: null,
      answered: false,
      score: 0,
    },
  };

  memoryRooms[code] = newRoom;
  notifyMemoryListeners(code);

  if (db) {
    try {
      const roomRef = ref(db, `rooms/${code}`);
      await set(roomRef, newRoom);
    } catch (e) {
      console.warn('Using memory fallback for room creation:', e);
    }
  }

  return code;
}

// Subscribe to real-time room changes
export function subscribeToRoom(
  code: string,
  callback: (room: QuizRoom | null) => void
): () => void {
  const cleanCode = code.trim().toUpperCase();

  if (db) {
    const roomRef = ref(db, `rooms/${cleanCode}`);
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          callback(val as QuizRoom);
        } else {
          // Fall back to memory if snapshot is null
          callback(memoryRooms[cleanCode] || null);
        }
      },
      (error) => {
        console.warn('Realtime database listener error:', error);
        callback(memoryRooms[cleanCode] || null);
      }
    );

    return () => unsubscribe();
  }

  // Memory fallback subscription
  if (!memoryListeners[cleanCode]) {
    memoryListeners[cleanCode] = new Set();
  }
  memoryListeners[cleanCode].add(callback);
  callback(memoryRooms[cleanCode] || null);

  return () => {
    memoryListeners[cleanCode]?.delete(callback);
  };
}

// Student joins room
export async function joinRoom(code: string): Promise<{ success: boolean; error?: string }> {
  const cleanCode = code.trim().toUpperCase();

  if (db) {
    try {
      const roomRef = ref(db, `rooms/${cleanCode}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        return { success: false, error: 'Quiz room not found. Please double-check the code!' };
      }

      const roomData = snapshot.val() as QuizRoom;
      if (roomData.status === 'finished') {
        return { success: false, error: 'This quiz has already finished.' };
      }

      const studentRef = ref(db, `rooms/${cleanCode}/student`);
      await update(studentRef, { connected: true });
      onDisconnect(studentRef).update({ connected: false });

      if (roomData.status === 'waiting') {
        await update(roomRef, { status: 'ready' });
      }

      return { success: true };
    } catch (e) {
      console.warn('Firebase join error, checking memory fallback:', e);
    }
  }

  if (memoryRooms[cleanCode]) {
    memoryRooms[cleanCode].student = {
      ...(memoryRooms[cleanCode].student || { answer: null, answered: false, score: 0 }),
      connected: true,
    };
    if (memoryRooms[cleanCode].status === 'waiting') {
      memoryRooms[cleanCode].status = 'ready';
    }
    notifyMemoryListeners(cleanCode);
    return { success: true };
  }

  return { success: false, error: 'Quiz room not found. Please check code with Dad!' };
}

// Host starts quiz
export async function startQuiz(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();

  const updates = {
    status: 'playing',
    currentQuestion: 0,
    revealed: false,
    'student/answer': null,
    'student/answered': false,
  };

  if (memoryRooms[cleanCode]) {
    memoryRooms[cleanCode].status = 'playing';
    memoryRooms[cleanCode].currentQuestion = 0;
    memoryRooms[cleanCode].revealed = false;
    if (memoryRooms[cleanCode].student) {
      memoryRooms[cleanCode].student.answer = null;
      memoryRooms[cleanCode].student.answered = false;
    }
    notifyMemoryListeners(cleanCode);
  }

  if (db) {
    try {
      const roomRef = ref(db, `rooms/${cleanCode}`);
      await update(roomRef, updates);
    } catch (e) {
      console.warn('Error starting quiz in Firebase:', e);
    }
  }
}

// Student submits answer
export async function submitAnswer(code: string, answerIndex: number): Promise<void> {
  const cleanCode = code.trim().toUpperCase();

  if (memoryRooms[cleanCode] && memoryRooms[cleanCode].student) {
    memoryRooms[cleanCode].student.answer = answerIndex;
    memoryRooms[cleanCode].student.answered = true;
    notifyMemoryListeners(cleanCode);
  }

  if (db) {
    try {
      const studentRef = ref(db, `rooms/${cleanCode}/student`);
      await update(studentRef, {
        answer: answerIndex,
        answered: true,
      });
    } catch (e) {
      console.warn('Error submitting answer to Firebase:', e);
    }
  }
}

// Host reveals answer
export async function revealAnswer(code: string, isCorrect: boolean, currentScore: number): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const newScore = isCorrect ? currentScore + 1 : currentScore;

  if (memoryRooms[cleanCode]) {
    memoryRooms[cleanCode].revealed = true;
    if (memoryRooms[cleanCode].student) {
      memoryRooms[cleanCode].student.score = newScore;
    }
    notifyMemoryListeners(cleanCode);
  }

  if (db) {
    try {
      const roomRef = ref(db, `rooms/${cleanCode}`);
      await update(roomRef, {
        revealed: true,
        'student/score': newScore,
      });
    } catch (e) {
      console.warn('Error revealing answer in Firebase:', e);
    }
  }
}

// Host advances to next question
export async function nextQuestion(code: string, nextIndex: number): Promise<void> {
  const cleanCode = code.trim().toUpperCase();

  if (memoryRooms[cleanCode]) {
    memoryRooms[cleanCode].currentQuestion = nextIndex;
    memoryRooms[cleanCode].revealed = false;
    if (memoryRooms[cleanCode].student) {
      memoryRooms[cleanCode].student.answer = null;
      memoryRooms[cleanCode].student.answered = false;
    }
    notifyMemoryListeners(cleanCode);
  }

  if (db) {
    try {
      const roomRef = ref(db, `rooms/${cleanCode}`);
      await update(roomRef, {
        currentQuestion: nextIndex,
        revealed: false,
        'student/answer': null,
        'student/answered': false,
      });
    } catch (e) {
      console.warn('Error advancing question in Firebase:', e);
    }
  }
}

// Host finishes quiz
export async function endQuiz(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();

  if (memoryRooms[cleanCode]) {
    memoryRooms[cleanCode].status = 'finished';
    notifyMemoryListeners(cleanCode);
  }

  if (db) {
    try {
      const roomRef = ref(db, `rooms/${cleanCode}`);
      await update(roomRef, { status: 'finished' });
    } catch (e) {
      console.warn('Error ending quiz in Firebase:', e);
    }
  }
}
