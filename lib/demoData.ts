import { Question } from './types';

export const DEMO_QUIZZES: { title: string; questions: Question[] }[] = [
  {
    title: 'Class 2 General Knowledge',
    questions: [
      {
        id: 'q1',
        question: 'How many days are there in a week?',
        options: ['5 Days', '7 Days', '10 Days', '12 Days'],
        correctAnswer: 1, // B: 7 Days
      },
      {
        id: 'q2',
        question: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        correctAnswer: 1, // B: Mars
      },
      {
        id: 'q3',
        question: 'How many legs does a dog have?',
        options: ['2 Legs', '4 Legs', '6 Legs', '8 Legs'],
        correctAnswer: 1, // B: 4 Legs
      },
      {
        id: 'q4',
        question: 'Which animal gives us milk?',
        options: ['Lion', 'Cow', 'Tiger', 'Snake'],
        correctAnswer: 1, // B: Cow
      },
      {
        id: 'q5',
        question: 'What is 5 + 7?',
        options: ['10', '11', '12', '14'],
        correctAnswer: 2, // C: 12
      },
    ],
  },
  {
    title: 'Class 2 EVS - Plants & Nature',
    questions: [
      {
        id: 'evs1',
        question: 'Which part of a plant absorbs water from the soil?',
        options: ['Leaf', 'Root', 'Flower', 'Fruit'],
        correctAnswer: 1, // B: Root
      },
      {
        id: 'evs2',
        question: 'What do plants need to make their food?',
        options: ['Sunlight and Water', 'Milk and Sugar', 'Ice and Salt', 'Juice and Bread'],
        correctAnswer: 0, // A: Sunlight and Water
      },
      {
        id: 'evs3',
        question: 'Which part of the plant turns into a fruit?',
        options: ['Stem', 'Root', 'Flower', 'Leaf'],
        correctAnswer: 2, // C: Flower
      },
    ],
  },
];
