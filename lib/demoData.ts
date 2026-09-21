import { Question } from './types';

export interface QuizoraPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  questions: Question[];
}

export const QUIZORA_PRESETS: QuizoraPreset[] = [
  {
    id: 'preset_gk',
    title: 'Class 2 General Knowledge',
    category: 'General Knowledge',
    description: 'Fun trivia for young learners covering days, planets, and animals.',
    questions: [
      {
        id: 'q1',
        question: 'How many days are there in a week?',
        options: ['5 Days', '7 Days', '10 Days', '12 Days'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        question: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        question: 'How many legs does a dog have?',
        options: ['2 Legs', '4 Legs', '6 Legs', '8 Legs'],
        correctAnswer: 1,
      },
      {
        id: 'q4',
        question: 'Which animal gives us milk?',
        options: ['Lion', 'Cow', 'Tiger', 'Snake'],
        correctAnswer: 1,
      },
      {
        id: 'q5',
        question: 'What is 5 + 7?',
        options: ['10', '11', '12', '14'],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 'preset_evs',
    title: 'Class 2 EVS - Plants & Nature',
    category: 'Environmental Science',
    description: 'Explore plant biology, roots, leaves, and photosynthesis basics.',
    questions: [
      {
        id: 'evs1',
        question: 'Which part of a plant absorbs water from the soil?',
        options: ['Leaf', 'Root', 'Flower', 'Fruit'],
        correctAnswer: 1,
      },
      {
        id: 'evs2',
        question: 'What do plants need to make their food?',
        options: ['Sunlight and Water', 'Milk and Sugar', 'Ice and Salt', 'Juice and Bread'],
        correctAnswer: 0,
      },
      {
        id: 'evs3',
        question: 'Which part of the plant turns into a fruit?',
        options: ['Stem', 'Root', 'Flower', 'Leaf'],
        correctAnswer: 2,
      },
      {
        id: 'evs4',
        question: 'Which plant part is green and makes food?',
        options: ['Root', 'Leaf', 'Thorn', 'Bark'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'preset_math',
    title: 'Speed Mental Math Challenge',
    category: 'Mathematics',
    description: 'Fast addition & subtraction drills to test speed and accuracy.',
    questions: [
      {
        id: 'm1',
        question: 'What is 15 + 8?',
        options: ['21', '22', '23', '24'],
        correctAnswer: 2,
      },
      {
        id: 'm2',
        question: 'What is 20 - 7?',
        options: ['11', '12', '13', '14'],
        correctAnswer: 2,
      },
      {
        id: 'm3',
        question: 'How many sides does a triangle have?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 1,
      },
      {
        id: 'm4',
        question: 'Double of 9 is:',
        options: ['16', '17', '18', '20'],
        correctAnswer: 2,
      },
    ],
  },
];

// Backwards compatibility alias
export const DEMO_QUIZZES = QUIZORA_PRESETS;
