import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { Phrase } from '../data/phrases';

interface QuizViewProps {
  phrases: Phrase[];
  onQuizComplete: (score: { correct: number; total: number }) => void;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuizView({ phrases, onQuizComplete }: QuizViewProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Generate quiz questions: show Chinese, pick correct English
  const questions = useMemo(() => {
    const shuffled = shuffle(phrases).slice(0, Math.min(10, phrases.length));
    return shuffled.map((phrase) => {
      const wrongOptions = shuffle(phrases.filter((p) => p.id !== phrase.id))
        .slice(0, 3)
        .map((p) => p.english);
      const options = shuffle([phrase.english, ...wrongOptions]);
      return { phrase, options, correctAnswer: phrase.english };
    });
  }, [phrases]);

  if (isComplete) {
    return (
      <View className="items-center py-12">
        <Text className="text-5xl mb-4">{'\uD83C\uDFC6'}</Text>
        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {t('english.quizComplete')}
        </Text>
        <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {t('english.score')}: {score} / {questions.length}
        </Text>
      </View>
    );
  }

  if (questions.length === 0) return null;

  const question = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (selected) return; // Already answered
    setSelected(option);
    const isCorrect = option === question.correctAnswer;
    if (isCorrect) setScore((s) => s + 1);

    // Auto-advance after a delay
    timerRef.current = setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        const finalScore = isCorrect ? score + 1 : score;
        onQuizComplete({ correct: finalScore, total: questions.length });
        setIsComplete(true);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
      }
    }, 1000);
  };

  return (
    <View className="items-center gap-6">
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        {currentIndex + 1} / {questions.length}
      </Text>

      {/* Show Chinese phrase */}
      <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 items-center w-full max-w-md">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white">
          {question.phrase.chinese}
        </Text>
      </View>

      {/* Options */}
      <View className="gap-2 w-full max-w-md">
        {question.options.map((option) => {
          const isCorrectOption = option === question.correctAnswer;
          const isSelected = option === selected;

          let bgClass = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
          let textClass = 'text-gray-800 dark:text-white';

          if (selected) {
            if (isCorrectOption) {
              bgClass = 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600';
              textClass = 'text-green-700 dark:text-green-400';
            } else if (isSelected && !isCorrectOption) {
              bgClass = 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600';
              textClass = 'text-red-700 dark:text-red-400';
            }
          }

          return (
            <TouchableOpacity
              key={option}
              onPress={() => handleSelect(option)}
              disabled={selected !== null}
              className={`p-3 rounded-lg border min-h-[44px] justify-center ${bgClass}`}
              accessibilityLabel={option}
              accessibilityRole="button"
            >
              <Text className={`font-medium ${textClass}`}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected && (
        <Text className={`text-sm font-medium ${
          selected === question.correctAnswer
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {selected === question.correctAnswer ? t('english.correct') : t('english.incorrect')}
        </Text>
      )}
    </View>
  );
}
