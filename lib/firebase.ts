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
import { QuizRoom, Question, StudentState, QuizMode, QuizTemplate } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let db: Database | null = null;

try {
  db = getDatabase(app);
} catch (error) {
  console.warn('Firebase Realtime Database initialization error:', error);
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Speed Scoring Formula: Base 1000 pts + Up to 500 Speed Bonus pts (Max 30s window)
export function calculateQuestionScore(
  isCorrect: boolean,
  questionStartTime: number | null,
  answerTimestamp: number | null
): number {
  if (!isCorrect) return 0;
  if (!questionStartTime || !answerTimestamp) return 1000;

  const elapsedSeconds = Math.max(0, (answerTimestamp - questionStartTime) / 1000);
  const maxTimeSeconds = 30; // 30-second window for speed bonus
  const speedRatio = Math.max(0, 1 - Math.min(elapsedSeconds, maxTimeSeconds) / maxTimeSeconds);
  const speedBonus = Math.round(500 * speedRatio);
  return 1000 + speedBonus; // 1,000 to 1,500 points
}

// Fallback memory store
const memoryRooms: Record<string, QuizRoom> = {};
const memoryTemplates: Record<string, QuizTemplate> = {};
const memoryListeners: Record<string, Set<(room: QuizRoom | null) => void>> = {};

function notifyMemoryListeners(code: string) {
  const room = memoryRooms[code] || null;
  if (memoryListeners[code]) {
    memoryListeners[code].forEach((cb) => cb(room ? JSON.parse(JSON.stringify(room)) : null));
  }
}

// Create a new quiz room
export async function createRoom(
  title: string,
  questions: Question[],
  mode: QuizMode = 'multiplayer',
  tenantId: string = 'public',
  createdBy: string = 'anonymous',
  category: string = 'General'
): Promise<string> {
  const code = generateRoomCode();
  const newRoom: QuizRoom = {
    id: code,
    title,
    mode,
    status: 'waiting',
    tenantId,
    createdBy,
    category,
    isPublic: tenantId === 'public',
    currentQuestion: 0,
    questionStartTime: null,
    revealed: false,
    createdAt: Date.now(),
    questions,
    students: {},
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

// Save a reusable Quiz Template
export async function saveQuizTemplate(
  template: Omit<QuizTemplate, 'id' | 'createdAt'>
): Promise<string> {
  const templateId = `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const newTemplate: QuizTemplate = {
    ...template,
    id: templateId,
    createdAt: Date.now(),
  };

  memoryTemplates[templateId] = newTemplate;

  if (db) {
    try {
      const tplRef = ref(db, `templates/${templateId}`);
      await set(tplRef, newTemplate);
    } catch (e) {
      console.warn('Using memory fallback for saving template:', e);
    }
  }

  return templateId;
}

// Fetch saved templates by tenant
export async function getQuizTemplates(tenantId: string = 'public'): Promise<QuizTemplate[]> {
  if (db) {
    try {
      const tplsRef = ref(db, 'templates');
      const snapshot = await get(tplsRef);
      if (snapshot.exists()) {
        const val = snapshot.val() as Record<string, QuizTemplate>;
        return Object.values(val).filter((t) => t.isPublic || t.tenantId === tenantId);
      }
    } catch (e) {
      console.warn('Error fetching templates from Firebase:', e);
    }
  }

  return Object.values(memoryTemplates).filter((t) => t.isPublic || t.tenantId === tenantId);
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
          const val = snapshot.val() as QuizRoom;
          callback(val);
        } else {
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

  if (!memoryListeners[cleanCode]) {
    memoryListeners[cleanCode] = new Set();
  }
  memoryListeners[cleanCode].add(callback);
  callback(memoryRooms[cleanCode] || null);

  return () => {
    memoryListeners[cleanCode]?.delete(callback);
  };
}

// Student joins room with name
export async function joinRoom(
  code: string,
  studentName: string,
  existingStudentId?: string
): Promise<{ success: boolean; studentId?: string; error?: string }> {
  const cleanCode = code.trim().toUpperCase();
  const studentId = existingStudentId || `student_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const cleanName = studentName.trim() || 'Player';

  const newStudentState: StudentState = {
    id: studentId,
    name: cleanName,
    connected: true,
    answer: null,
    answered: false,
    answerTime: null,
    lastPointsGained: 0,
    totalScore: 0,
  };

  if (db) {
    try {
      const roomRef = ref(db, `rooms/${cleanCode}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        return { success: false, error: 'Quiz room not found. Please check code!' };
      }

      const roomData = snapshot.val() as QuizRoom;
      if (roomData.status === 'finished') {
        return { success: false, error: 'This quiz competition has already finished.' };
      }

      const existingStudent = roomData.students?.[studentId];
      if (existingStudent) {
        newStudentState.totalScore = existingStudent.totalScore || 0;
        newStudentState.answer = existingStudent.answer ?? null;
        newStudentState.answered = existingStudent.answered ?? false;
        newStudentState.answerTime = existingStudent.answerTime ?? null;
        newStudentState.lastPointsGained = existingStudent.lastPointsGained || 0;
      }

      const studentRef = ref(db, `rooms/${cleanCode}/students/${studentId}`);
      await set(studentRef, newStudentState);
      onDisconnect(studentRef).update({ connected: false });

      if (roomData.status === 'waiting') {
        await update(roomRef, { status: 'ready' });
      }

      return { success: true, studentId };
    } catch (e) {
      console.warn('Firebase join error, using memory fallback:', e);
    }
  }

  if (memoryRooms[cleanCode]) {
    if (!memoryRooms[cleanCode].students) {
      memoryRooms[cleanCode].students = {};
    }
    const existing = memoryRooms[cleanCode].students![studentId];
    if (existing) {
      newStudentState.totalScore = existing.totalScore || 0;
      newStudentState.answer = existing.answer ?? null;
      newStudentState.answered = existing.answered ?? false;
      newStudentState.answerTime = existing.answerTime ?? null;
    }
    memoryRooms[cleanCode].students![studentId] = newStudentState;
    if (memoryRooms[cleanCode].status === 'waiting') {
      memoryRooms[cleanCode].status = 'ready';
    }
    notifyMemoryListeners(cleanCode);
    return { success: true, studentId };
  }

  return { success: false, error: 'Quiz room not found. Please check code with Host!' };
}

// Host starts quiz
export async function startQuiz(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const startTime = Date.now();

  if (memoryRooms[cleanCode]) {
    memoryRooms[cleanCode].status = 'playing';
    memoryRooms[cleanCode].currentQuestion = 0;
    memoryRooms[cleanCode].questionStartTime = startTime;
    memoryRooms[cleanCode].revealed = false;
    if (memoryRooms[cleanCode].students) {
      Object.keys(memoryRooms[cleanCode].students!).forEach((id) => {
        memoryRooms[cleanCode].students![id].answer = null;
        memoryRooms[cleanCode].students![id].answered = false;
        memoryRooms[cleanCode].students![id].answerTime = null;
        memoryRooms[cleanCode].students![id].lastPointsGained = 0;
      });
    }
    notifyMemoryListeners(cleanCode);
  }

  if (db) {
    try {
      const roomRef = ref(db, `rooms/${cleanCode}`);
      const snapshot = await get(roomRef);
      const roomData = snapshot.val() as QuizRoom;

      const studentUpdates: Record<string, any> = {};
      if (roomData.students) {
        Object.keys(roomData.students).forEach((sId) => {
          studentUpdates[`students/${sId}/answer`] = null;
          studentUpdates[`students/${sId}/answered`] = false;
          studentUpdates[`students/${sId}/answerTime`] = null;
          studentUpdates[`students/${sId}/lastPointsGained`] = 0;
        });
      }

      await update(roomRef, {
        status: 'playing',
        currentQuestion: 0,
        questionStartTime: startTime,
        revealed: false,
        ...studentUpdates,
      });
    } catch (e) {
      console.warn('Error starting quiz in Firebase:', e);
    }
  }
}

// Student submits answer
export async function submitAnswer(
  code: string,
  studentId: string,
  answerIndex: number
): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const submitTime = Date.now();

  if (memoryRooms[cleanCode]?.students?.[studentId]) {
    const s = memoryRooms[cleanCode].students![studentId];
    s.answer = answerIndex;
    s.answered = true;
    s.answerTime = submitTime;
    notifyMemoryListeners(cleanCode);
  }

  if (db) {
    try {
      const studentRef = ref(db, `rooms/${cleanCode}/students/${studentId}`);
      await update(studentRef, {
        answer: answerIndex,
        answered: true,
        answerTime: submitTime,
      });
    } catch (e) {
      console.warn('Error submitting answer to Firebase:', e);
    }
  }
}

// Host reveals answer & calculates speed-based scores
export async function revealAnswer(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();

  if (memoryRooms[cleanCode]) {
    const room = memoryRooms[cleanCode];
    room.revealed = true;
    const currentQ = room.questions[room.currentQuestion];
    if (currentQ && room.students) {
      Object.values(room.students).forEach((st) => {
        const isCorrect = st.answer === currentQ.correctAnswer;
        const ptsGained = calculateQuestionScore(isCorrect, room.questionStartTime, st.answerTime);
        st.lastPointsGained = ptsGained;
        st.totalScore = (st.totalScore || 0) + ptsGained;
      });
    }
    notifyMemoryListeners(cleanCode);
  }

  if (db) {
    try {
      const roomRef = ref(db, `rooms/${cleanCode}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const roomData = snapshot.val() as QuizRoom;
        const currentQ = roomData.questions[roomData.currentQuestion];

        const updates: Record<string, any> = { revealed: true };

        if (currentQ && roomData.students) {
          Object.values(roomData.students).forEach((st) => {
            const isCorrect = st.answer === currentQ.correctAnswer;
            const ptsGained = calculateQuestionScore(
              isCorrect,
              roomData.questionStartTime,
              st.answerTime
            );
            const newTotal = (st.totalScore || 0) + ptsGained;
            updates[`students/${st.id}/lastPointsGained`] = ptsGained;
            updates[`students/${st.id}/totalScore`] = newTotal;
          });
        }

        await update(roomRef, updates);
      }
    } catch (e) {
      console.warn('Error revealing answer in Firebase:', e);
    }
  }
}

// Host advances to next question
export async function nextQuestion(code: string, nextIndex: number): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const startTime = Date.now();

  if (memoryRooms[cleanCode]) {
    const room = memoryRooms[cleanCode];
    room.currentQuestion = nextIndex;
    room.questionStartTime = startTime;
    room.revealed = false;
    if (room.students) {
      Object.values(room.students).forEach((st) => {
        st.answer = null;
        st.answered = false;
        st.answerTime = null;
        st.lastPointsGained = 0;
      });
    }
    notifyMemoryListeners(cleanCode);
  }

  if (db) {
    try {
      const roomRef = ref(db, `rooms/${cleanCode}`);
      const snapshot = await get(roomRef);
      const roomData = snapshot.val() as QuizRoom;

      const studentUpdates: Record<string, any> = {};
      if (roomData.students) {
        Object.keys(roomData.students).forEach((sId) => {
          studentUpdates[`students/${sId}/answer`] = null;
          studentUpdates[`students/${sId}/answered`] = false;
          studentUpdates[`students/${sId}/answerTime`] = null;
          studentUpdates[`students/${sId}/lastPointsGained`] = 0;
        });
      }

      await update(roomRef, {
        currentQuestion: nextIndex,
        questionStartTime: startTime,
        revealed: false,
        ...studentUpdates,
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
