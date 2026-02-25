import React from 'react';
import { View, Text } from 'react-native';

interface ChordLineProps {
  line: string;
}

interface ChordSegment {
  chord: string;
  lyric: string;
}

function parseChordProLine(line: string): ChordSegment[] {
  const segments: ChordSegment[] = [];
  const regex = /\[([^\]]+)\]([^[]*)/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  // Text before the first chord
  const preMatch = line.match(/^([^[]*)\[/);
  if (preMatch && preMatch[1]) {
    segments.push({ chord: '', lyric: preMatch[1] });
  } else if (!line.includes('[')) {
    // No chords in this line — return as plain lyric
    return [{ chord: '', lyric: line }];
  }

  while ((match = regex.exec(line)) !== null) {
    segments.push({ chord: match[1], lyric: match[2] });
    lastIndex = regex.lastIndex;
  }

  // Trailing text after last chord match
  if (lastIndex < line.length && lastIndex > 0 && segments.length === 0) {
    segments.push({ chord: '', lyric: line.slice(lastIndex) });
  }

  return segments;
}

export default function ChordLine({ line }: ChordLineProps) {
  const segments = parseChordProLine(line);

  if (segments.length === 0) {
    return <View className="h-4" />;
  }

  // If no chords at all, render as plain text
  const hasChords = segments.some((s) => s.chord);
  if (!hasChords) {
    return (
      <Text className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200">
        {segments.map((s) => s.lyric).join('')}
      </Text>
    );
  }

  return (
    <View className="flex-row flex-wrap">
      {segments.map((seg, i) => (
        <View key={i}>
          {/* Chord above */}
          <Text className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 h-5">
            {seg.chord || ' '}
          </Text>
          {/* Lyric below */}
          <Text className="font-mono text-sm text-gray-800 dark:text-gray-200">
            {seg.lyric || (seg.chord ? ' '.repeat(Math.max(seg.chord.length, 1)) : '')}
          </Text>
        </View>
      ))}
    </View>
  );
}
