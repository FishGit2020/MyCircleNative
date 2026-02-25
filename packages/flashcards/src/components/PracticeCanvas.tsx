import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useTranslation } from '@mycircle/shared';
import type { ChineseCharacter } from '../data/characters';

interface PracticeCanvasProps {
  character: ChineseCharacter;
  onBack: () => void;
}

type Point = { x: number; y: number };

const CANVAS_SIZE = 300;
const STROKE_COLOR = '#1d4ed8';
const STROKE_WIDTH = 4;

export default function PracticeCanvas({ character, onBack }: PracticeCanvasProps) {
  const { t } = useTranslation();

  const chars = useMemo(() => [...character.character], [character.character]);
  const [charIndex, setCharIndex] = useState(0);
  const [strokesByChar, setStrokesByChar] = useState<Point[][][]>(() => chars.map(() => []));
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  const currentChar = chars[charIndex];
  const strokes = strokesByChar[charIndex];
  const hasMultipleChars = chars.length > 1;

  // Reset state when character entry changes
  useEffect(() => {
    const newChars = [...character.character];
    setCharIndex(0);
    setStrokesByChar(newChars.map(() => []));
    setCurrentStroke([]);
  }, [character.character]);

  // Build Skia path from all completed strokes + current stroke
  const skiaPath = useMemo(() => {
    const path = Skia.Path.Make();
    const allStrokes = [...strokes, ...(currentStroke.length > 1 ? [currentStroke] : [])];
    for (const stroke of allStrokes) {
      if (stroke.length < 2) continue;
      path.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        path.lineTo(stroke[i].x, stroke[i].y);
      }
    }
    return path;
  }, [strokes, currentStroke]);

  const handleTouchStart = useCallback((event: any) => {
    const touch = event.nativeEvent;
    setCurrentStroke([{ x: touch.locationX, y: touch.locationY }]);
  }, []);

  const handleTouchMove = useCallback((event: any) => {
    const touch = event.nativeEvent;
    setCurrentStroke(prev => [...prev, { x: touch.locationX, y: touch.locationY }]);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (currentStroke.length > 1) {
      setStrokesByChar(prev => {
        const next = [...prev];
        next[charIndex] = [...next[charIndex], currentStroke];
        return next;
      });
    }
    setCurrentStroke([]);
  }, [currentStroke, charIndex]);

  const handleClear = useCallback(() => {
    setStrokesByChar(prev => {
      const next = [...prev];
      next[charIndex] = [];
      return next;
    });
    setCurrentStroke([]);
  }, [charIndex]);

  const handleUndo = useCallback(() => {
    setStrokesByChar(prev => {
      const next = [...prev];
      next[charIndex] = next[charIndex].slice(0, -1);
      return next;
    });
  }, [charIndex]);

  return (
    <View className="flex-1 items-center gap-4 p-4">
      {/* Header with character info */}
      <View className="items-center">
        <Text className="text-4xl text-gray-800 dark:text-white">{character.character}</Text>
        <Text className="text-lg text-blue-600 dark:text-blue-400">{character.pinyin}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">{character.meaning}</Text>
      </View>

      {/* Per-character tab selector */}
      {hasMultipleChars && (
        <View className="flex-row items-center gap-2">
          {chars.map((ch, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCharIndex(i)}
              className={`px-3 py-1 rounded-lg min-h-[44px] min-w-[44px] items-center justify-center ${
                i === charIndex
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
              accessibilityLabel={`Character ${ch}`}
              accessibilityRole="button"
            >
              <Text className={`text-2xl ${
                i === charIndex
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {ch}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text className="text-sm text-gray-400 dark:text-gray-500">
        {t('chinese.practiceHint')}
      </Text>

      {/* Skia Canvas */}
      <View
        className="border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 overflow-hidden"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderStart={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={handleTouchEnd}
      >
        <Canvas style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
          {/* Watermark reference character at 15% opacity */}
          {/* Note: Skia text rendering requires a font. We use a simple text overlay instead. */}
          <Path
            path={skiaPath}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
            strokeCap="round"
            strokeJoin="round"
            color={STROKE_COLOR}
          />
        </Canvas>
        {/* Watermark reference character overlay */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 0.15,
          }}
          pointerEvents="none"
        >
          <Text style={{ fontSize: CANVAS_SIZE * 0.7, color: '#000' }}>
            {currentChar}
          </Text>
        </View>
      </View>

      {/* Per-character navigation */}
      {hasMultipleChars && (
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => setCharIndex(i => i - 1)}
            disabled={charIndex === 0}
            className={`px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[44px] justify-center ${
              charIndex === 0 ? 'opacity-40' : ''
            }`}
            accessibilityLabel={t('chinese.previous')}
            accessibilityRole="button"
          >
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              {t('chinese.previous')}
            </Text>
          </TouchableOpacity>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {charIndex + 1} / {chars.length}
          </Text>
          <TouchableOpacity
            onPress={() => setCharIndex(i => i + 1)}
            disabled={charIndex === chars.length - 1}
            className={`px-4 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 min-h-[44px] justify-center ${
              charIndex === chars.length - 1 ? 'opacity-40' : ''
            }`}
            accessibilityLabel={t('chinese.next')}
            accessibilityRole="button"
          >
            <Text className="text-sm text-white">
              {t('chinese.next')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={handleUndo}
          disabled={strokes.length === 0}
          className={`px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[44px] justify-center ${
            strokes.length === 0 ? 'opacity-40' : ''
          }`}
          accessibilityLabel={t('chinese.undo')}
          accessibilityRole="button"
        >
          <Text className="text-sm text-gray-700 dark:text-gray-300">
            {t('chinese.undo')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleClear}
          className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 min-h-[44px] justify-center"
          accessibilityLabel={t('chinese.clear')}
          accessibilityRole="button"
        >
          <Text className="text-sm text-red-700 dark:text-red-400">
            {t('chinese.clear')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[44px] justify-center"
          accessibilityLabel={t('chinese.flashcards')}
          accessibilityRole="button"
        >
          <Text className="text-sm text-gray-700 dark:text-gray-300">
            {t('chinese.flashcards')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
