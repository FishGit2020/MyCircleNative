import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import {
  useTranslation,
  StorageKeys,
  AppEvents,
  eventBus,
  safeGetItem,
  safeSetItem,
} from '@mycircle/shared';

type GameType = 'trivia' | 'math' | 'word' | 'memory' | 'reaction' | 'simon' | 'headsup' | 'sequence' | 'colormatch' | 'maze' | 'anagram';

interface ScoreEntry {
  game: GameType;
  score: number;
  date: number;
}

// ─── Trivia Game ─────────────────────────────────────────────────
const TRIVIA_QUESTIONS = [
  { q: 'What planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Mars', 'Earth'], answer: 1 },
  { q: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: 2 },
  { q: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], answer: 2 },
  { q: 'What gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'CO2', 'Helium'], answer: 2 },
  { q: 'How many legs does a spider have?', options: ['6', '8', '10', '4'], answer: 1 },
  { q: 'What is the hardest natural substance?', options: ['Gold', 'Iron', 'Diamond', 'Quartz'], answer: 2 },
  { q: 'Which country has the most people?', options: ['USA', 'India', 'China', 'Brazil'], answer: 1 },
  { q: 'What is the speed of light?', options: ['300k km/s', '150k km/s', '500k km/s', '100k km/s'], answer: 0 },
];

function TriviaGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answered, setAnswered] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = TRIVIA_QUESTIONS[qIndex];
  const isFinished = qIndex >= TRIVIA_QUESTIONS.length;

  useEffect(() => {
    if (isFinished) return;
    setTimeLeft(15);
    setAnswered(null);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setAnswered(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [qIndex, isFinished]);

  const handleAnswer = useCallback((idx: number) => {
    if (answered !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setAnswered(idx);
    if (idx === question.answer) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      setQIndex((i) => i + 1);
    }, 1000);
  }, [answered, question]);

  useEffect(() => {
    if (isFinished) onScore(score);
  }, [isFinished, score, onScore]);

  if (isFinished) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {t('games.score')}: {score}/{TRIVIA_QUESTIONS.length}
        </Text>
        <TouchableOpacity
          onPress={() => { setQIndex(0); setScore(0); }}
          className="px-6 py-3 bg-blue-500 dark:bg-blue-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.newGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{t('games.newGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-blue-500 dark:text-blue-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {qIndex + 1}/{TRIVIA_QUESTIONS.length}
        </Text>
        <Text className={`text-sm font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
          {timeLeft}s
        </Text>
      </View>
      <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
        {question.q}
      </Text>
      {question.options.map((opt, idx) => {
        let bg = 'bg-gray-100 dark:bg-gray-700';
        if (answered !== null) {
          if (idx === question.answer) bg = 'bg-green-100 dark:bg-green-900/40';
          else if (idx === answered) bg = 'bg-red-100 dark:bg-red-900/40';
        }
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => handleAnswer(idx)}
            disabled={answered !== null}
            className={`${bg} p-4 rounded-xl mb-3 min-h-[44px] justify-center`}
            accessibilityLabel={opt}
            accessibilityRole="button"
          >
            <Text className="text-gray-800 dark:text-white">{opt}</Text>
          </TouchableOpacity>
        );
      })}
      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {t('games.score')}: {score}
      </Text>
    </View>
  );
}

// ─── Math Challenge ──────────────────────────────────────────────
function MathGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState('');
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+' as string, result: 0 });
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const maxRounds = 10;

  const generateProblem = useCallback((r: number) => {
    const difficulty = Math.min(3, Math.floor(r / 3) + 1);
    const max = difficulty * 10;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const ops = ['+', '-', '*'];
    const op = ops[Math.min(difficulty - 1, ops.length - 1)];
    let result: number;
    switch (op) {
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      default: result = a + b;
    }
    setProblem({ a, b, op, result });
    setAnswer('');
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (round < maxRounds) generateProblem(round);
  }, [round, generateProblem]);

  const handleSubmit = useCallback(() => {
    const num = parseInt(answer, 10);
    if (isNaN(num)) return;
    if (num === problem.result) {
      setFeedback('correct');
      setScore((s) => s + 1);
    } else {
      setFeedback('incorrect');
    }
    setTimeout(() => setRound((r) => r + 1), 800);
  }, [answer, problem.result]);

  useEffect(() => {
    if (round >= maxRounds) onScore(score);
  }, [round, maxRounds, score, onScore]);

  if (round >= maxRounds) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {t('games.score')}: {score}/{maxRounds}
        </Text>
        <TouchableOpacity
          onPress={() => { setRound(0); setScore(0); }}
          className="px-6 py-3 bg-blue-500 dark:bg-blue-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.newGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{t('games.newGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-blue-500 dark:text-blue-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 items-center justify-center">
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {t('games.round')} {round + 1}/{maxRounds}
      </Text>
      <Text className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
        {problem.a} {problem.op} {problem.b} = ?
      </Text>
      <View className="flex-row items-center gap-3 mb-4">
        <View className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 min-w-[120px]">
          <Text className="text-center text-2xl text-gray-800 dark:text-white">
            {answer || '_'}
          </Text>
        </View>
      </View>
      {/* Number pad */}
      <View className="flex-row flex-wrap justify-center gap-2 max-w-[240px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => setAnswer((a) => a + String(n))}
            className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center"
            accessibilityLabel={String(n)}
            accessibilityRole="button"
          >
            <Text className="text-lg font-medium text-gray-800 dark:text-white">{n}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setAnswer((a) => (a.startsWith('-') ? a.slice(1) : '-' + a))}
          className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center"
          accessibilityLabel="+/-"
          accessibilityRole="button"
        >
          <Text className="text-lg font-medium text-gray-800 dark:text-white">+/-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setAnswer((a) => a.slice(0, -1))}
          className="w-16 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg items-center justify-center"
          accessibilityLabel="Delete"
          accessibilityRole="button"
        >
          <Text className="text-lg font-medium text-gray-800 dark:text-white">{'\u232B'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!answer}
        className={`mt-4 px-8 py-3 rounded-xl min-h-[44px] justify-center ${
          answer ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
        }`}
        accessibilityLabel={t('games.play')}
        accessibilityRole="button"
      >
        <Text className="text-white font-medium">{'\u2713'}</Text>
      </TouchableOpacity>
      {feedback && (
        <Text className={`mt-3 text-sm font-medium ${
          feedback === 'correct' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {feedback === 'correct' ? t('games.correct') : `${t('games.incorrect')} (${problem.result})`}
        </Text>
      )}
    </View>
  );
}

// ─── Word Game (Unscramble) ──────────────────────────────────────
const WORD_LIST = ['REACT', 'MOBILE', 'FAMILY', 'CIRCLE', 'GAMES', 'NATURE', 'PLANET', 'ORANGE', 'PURPLE', 'SILVER'];

function WordGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [wordIdx, setWordIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [scrambled, setScrambled] = useState('');
  const maxWords = Math.min(5, WORD_LIST.length);

  const scramble = useCallback((word: string) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const result = arr.join('');
    return result === word ? scramble(word) : result;
  }, []);

  useEffect(() => {
    if (wordIdx < maxWords) {
      setScrambled(scramble(WORD_LIST[wordIdx]));
      setGuess('');
    }
  }, [wordIdx, maxWords, scramble]);

  const handleSubmit = useCallback(() => {
    if (guess.toUpperCase() === WORD_LIST[wordIdx]) {
      setScore((s) => s + 1);
    }
    setWordIdx((i) => i + 1);
  }, [guess, wordIdx]);

  useEffect(() => {
    if (wordIdx >= maxWords) onScore(score);
  }, [wordIdx, maxWords, score, onScore]);

  if (wordIdx >= maxWords) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {t('games.score')}: {score}/{maxWords}
        </Text>
        <TouchableOpacity
          onPress={() => { setWordIdx(0); setScore(0); }}
          className="px-6 py-3 bg-blue-500 dark:bg-blue-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.newGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{t('games.newGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-blue-500 dark:text-blue-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 items-center justify-center">
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {wordIdx + 1}/{maxWords}
      </Text>
      <Text className="text-3xl font-bold text-blue-500 dark:text-blue-400 mb-6 tracking-widest">
        {scrambled}
      </Text>
      <View className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 min-w-[200px] mb-4">
        <Text className="text-center text-xl text-gray-800 dark:text-white tracking-widest">
          {guess || '...'}
        </Text>
      </View>
      {/* Letter keyboard */}
      <View className="flex-row flex-wrap justify-center gap-1 max-w-[320px] mb-4">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch) => (
          <TouchableOpacity
            key={ch}
            onPress={() => setGuess((g) => g + ch)}
            className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded items-center justify-center"
            accessibilityLabel={ch}
            accessibilityRole="button"
          >
            <Text className="text-sm font-medium text-gray-800 dark:text-white">{ch}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => setGuess((g) => g.slice(0, -1))}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg min-h-[44px] justify-center"
          accessibilityLabel="Delete"
          accessibilityRole="button"
        >
          <Text className="text-gray-700 dark:text-gray-300">{'\u232B'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!guess}
          className={`px-6 py-2 rounded-lg min-h-[44px] justify-center ${
            guess ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
          }`}
          accessibilityLabel={t('games.play')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{'\u2713'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Memory Match ────────────────────────────────────────────────
const MEMORY_EMOJIS = ['\u{1F436}', '\u{1F431}', '\u{1F42D}', '\u{1F430}', '\u{1F43B}', '\u{1F43C}', '\u{1F98A}', '\u{1F981}'];

function MemoryGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  const initGame = useCallback(() => {
    const pairs = MEMORY_EMOJIS.map((e, i) => [
      { id: i * 2, emoji: e, flipped: false, matched: false },
      { id: i * 2 + 1, emoji: e, flipped: false, matched: false },
    ]).flat();
    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    setCards(pairs);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const handleTap = useCallback((idx: number) => {
    if (flipped.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
    const newCards = [...cards];
    newCards[idx] = { ...newCards[idx], flipped: true };
    setCards(newCards);
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        newCards[a] = { ...newCards[a], matched: true };
        newCards[b] = { ...newCards[b], matched: true };
        setCards(newCards);
        setMatches((m) => m + 1);
        setFlipped([]);
      } else {
        setTimeout(() => {
          const reset = [...newCards];
          reset[a] = { ...reset[a], flipped: false };
          reset[b] = { ...reset[b], flipped: false };
          setCards(reset);
          setFlipped([]);
        }, 800);
      }
    }
  }, [flipped, cards]);

  const isFinished = matches === MEMORY_EMOJIS.length;

  useEffect(() => {
    if (isFinished) onScore(Math.max(0, MEMORY_EMOJIS.length * 2 - moves));
  }, [isFinished, moves, onScore]);

  if (isFinished) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('games.correct')}!
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-4">
          {moves} moves
        </Text>
        <TouchableOpacity
          onPress={initGame}
          className="px-6 py-3 bg-blue-500 dark:bg-blue-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.newGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{t('games.newGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-blue-500 dark:text-blue-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row justify-between mb-4">
        <Text className="text-sm text-gray-500 dark:text-gray-400">{t('games.memory')}</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-300">{moves} moves</Text>
      </View>
      <View className="flex-row flex-wrap justify-center gap-2">
        {cards.map((card, idx) => (
          <TouchableOpacity
            key={card.id}
            onPress={() => handleTap(idx)}
            className={`w-16 h-16 rounded-xl items-center justify-center ${
              card.matched
                ? 'bg-green-100 dark:bg-green-900/30'
                : card.flipped
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
            accessibilityLabel={card.flipped || card.matched ? card.emoji : t('games.memory')}
            accessibilityRole="button"
          >
            <Text className="text-2xl">
              {card.flipped || card.matched ? card.emoji : '?'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Reaction Time ───────────────────────────────────────────────
function ReactionGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'waiting' | 'ready' | 'go' | 'result'>('waiting');
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(Infinity);
  const [round, setRound] = useState(0);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRound = useCallback(() => {
    setState('ready');
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setState('go');
    }, delay);
  }, []);

  const handleTap = useCallback(() => {
    if (state === 'waiting') {
      startRound();
    } else if (state === 'ready') {
      // Too early
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('waiting');
      Alert.alert(t('games.reaction'), t('games.timeUp'));
    } else if (state === 'go') {
      const time = Date.now() - startRef.current;
      setReactionTime(time);
      if (time < bestTime) setBestTime(time);
      setRound((r) => r + 1);
      setState('result');
    } else if (state === 'result') {
      if (round >= 5) {
        onScore(Math.max(0, 500 - Math.floor(bestTime / 2)));
        return;
      }
      startRound();
    }
  }, [state, bestTime, round, onScore, startRound, t]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const bgColor = state === 'ready'
    ? 'bg-red-500 dark:bg-red-600'
    : state === 'go'
    ? 'bg-green-500 dark:bg-green-600'
    : 'bg-gray-100 dark:bg-gray-800';

  return (
    <TouchableOpacity
      onPress={handleTap}
      activeOpacity={0.8}
      className={`flex-1 items-center justify-center ${bgColor}`}
      accessibilityLabel={t('games.reaction')}
      accessibilityRole="button"
    >
      {state === 'waiting' && (
        <>
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {t('games.reaction')}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">{t('games.ready')}</Text>
        </>
      )}
      {state === 'ready' && (
        <Text className="text-2xl font-bold text-white">{t('games.ready')}...</Text>
      )}
      {state === 'go' && (
        <Text className="text-3xl font-bold text-white">TAP!</Text>
      )}
      {state === 'result' && (
        <>
          <Text className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {reactionTime}ms
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t('games.bestScore')}: {bestTime === Infinity ? '-' : `${bestTime}ms`}
          </Text>
          <Text className="text-sm text-gray-400 dark:text-gray-500">
            {t('games.round')} {round}/5
          </Text>
          <Text className="text-sm text-blue-500 dark:text-blue-400 mt-4">
            {round >= 5 ? t('games.scoreboard') : t('games.ready')}
          </Text>
        </>
      )}
      <TouchableOpacity
        onPress={onBack}
        className="absolute top-12 left-4 px-3 py-2 min-h-[44px] justify-center"
        accessibilityLabel={t('games.back')}
        accessibilityRole="button"
      >
        <Text className="text-gray-600 dark:text-gray-300">{'\u2190'} {t('games.back')}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Simon Says ──────────────────────────────────────────────────
const SIMON_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
function SimonGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const addToSequence = useCallback(() => {
    const next = Math.floor(Math.random() * 4);
    setSequence((s) => [...s, next]);
    setPlayerIdx(0);
    setIsPlaying(true);
  }, []);

  // Play the sequence
  useEffect(() => {
    if (!isPlaying || sequence.length === 0) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setActiveButton(sequence[i]);
        setTimeout(() => setActiveButton(null), 400);
        i++;
      } else {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 700);
    return () => clearInterval(interval);
  }, [isPlaying, sequence]);

  const handlePress = useCallback((idx: number) => {
    if (isPlaying || gameOver) return;
    setActiveButton(idx);
    setTimeout(() => setActiveButton(null), 200);

    if (sequence[playerIdx] === idx) {
      if (playerIdx === sequence.length - 1) {
        setScore((s) => s + 1);
        setTimeout(() => addToSequence(), 500);
      } else {
        setPlayerIdx((p) => p + 1);
      }
    } else {
      setGameOver(true);
      onScore(score);
    }
  }, [isPlaying, gameOver, sequence, playerIdx, score, onScore, addToSequence]);

  const startGame = useCallback(() => {
    setSequence([]);
    setScore(0);
    setGameOver(false);
    setPlayerIdx(0);
    setTimeout(() => {
      const first = Math.floor(Math.random() * 4);
      setSequence([first]);
      setIsPlaying(true);
    }, 300);
  }, []);

  if (gameOver) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {t('games.score')}: {score}
        </Text>
        <TouchableOpacity
          onPress={startGame}
          className="px-6 py-3 bg-blue-500 dark:bg-blue-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.newGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{t('games.newGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-blue-500 dark:text-blue-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 items-center justify-center">
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {t('games.simon')} - {t('games.round')} {sequence.length}
      </Text>
      <Text className="text-lg font-bold text-gray-800 dark:text-white mb-6">
        {t('games.score')}: {score}
      </Text>
      {sequence.length === 0 ? (
        <TouchableOpacity
          onPress={startGame}
          className="px-8 py-4 bg-blue-500 dark:bg-blue-600 rounded-xl min-h-[44px] justify-center"
          accessibilityLabel={t('games.play')}
          accessibilityRole="button"
        >
          <Text className="text-white font-bold text-lg">{t('games.play')}</Text>
        </TouchableOpacity>
      ) : (
        <View className="flex-row flex-wrap justify-center gap-3 max-w-[220px]">
          {SIMON_COLORS.map((color, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handlePress(idx)}
              disabled={isPlaying}
              style={{
                backgroundColor: activeButton === idx ? color : `${color}66`,
                width: 96,
                height: 96,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessibilityLabel={`${t('games.simon')} ${idx + 1}`}
              accessibilityRole="button"
            />
          ))}
        </View>
      )}
      <TouchableOpacity
        onPress={onBack}
        className="mt-8 px-3 py-2 min-h-[44px] justify-center"
        accessibilityLabel={t('games.back')}
        accessibilityRole="button"
      >
        <Text className="text-gray-500 dark:text-gray-400">{'\u2190'} {t('games.back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Heads Up ────────────────────────────────────────────────────
const HEADS_UP_WORDS = [
  'elephant', 'pizza', 'airplane', 'basketball', 'guitar',
  'butterfly', 'volcano', 'penguin', 'rainbow', 'dinosaur',
  'pirate', 'robot', 'mermaid', 'astronaut', 'ninja',
  'tornado', 'unicorn', 'zombie', 'dragon', 'wizard',
  'surfing', 'karate', 'ballet', 'juggling', 'skiing',
  'banana', 'popcorn', 'hamburger', 'spaghetti', 'chocolate',
  'camera', 'telescope', 'bicycle', 'helicopter', 'submarine',
  'fireworks', 'snowman', 'castle', 'lighthouse', 'waterfall',
  'monkey', 'octopus', 'kangaroo', 'dolphin', 'parrot',
  'cowboy', 'superhero', 'clown', 'detective', 'chef',
];

const HEADS_UP_DURATION = 60;

function HeadsUpGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'menu' | 'playing' | 'over'>('menu');
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [timeLeft, setTimeLeft] = useState(HEADS_UP_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => { return () => stopTimer(); }, [stopTimer]);

  const startRound = useCallback(() => {
    const shuffled = [...HEADS_UP_WORDS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setWords(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setSkipped(0);
    setTimeLeft(HEADS_UP_DURATION);
    setPhase('playing');
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, HEADS_UP_DURATION - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setPhase('over');
      }
    }, 250);
  }, []);

  const advance = useCallback(() => {
    if (currentIndex + 1 >= words.length) {
      stopTimer();
      setPhase('over');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, words.length, stopTimer]);

  const handleGotIt = useCallback(() => {
    setScore((s) => s + 1);
    advance();
  }, [advance]);

  const handlePass = useCallback(() => {
    setSkipped((s) => s + 1);
    advance();
  }, [advance]);

  useEffect(() => {
    if (phase === 'over') onScore(score);
  }, [phase, score, onScore]);

  if (phase === 'over') {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('games.score')}: {score}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('games.skipWord')}: {skipped}
        </Text>
        <TouchableOpacity
          onPress={startRound}
          className="px-6 py-3 bg-fuchsia-500 dark:bg-fuchsia-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.newGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{t('games.newGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-blue-500 dark:text-blue-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'menu') {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {t('games.headsUp')}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          {t('games.holdUp')}
        </Text>
        <TouchableOpacity
          onPress={startRound}
          className="px-8 py-4 bg-fuchsia-500 dark:bg-fuchsia-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.startGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-bold text-lg">{t('games.startGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-gray-500 dark:text-gray-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentWord = words[currentIndex] || '';
  const isLow = timeLeft <= 10;

  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className={`text-5xl font-bold mb-6 ${isLow ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
        {timeLeft}
      </Text>
      <View className="bg-fuchsia-500 dark:bg-fuchsia-600 rounded-3xl px-12 py-16 min-w-[280px] items-center mb-8">
        <Text className="text-4xl font-bold text-white uppercase tracking-wide text-center">
          {currentWord}
        </Text>
      </View>
      <View className="flex-row gap-4 w-full max-w-[300px]">
        <TouchableOpacity
          onPress={handlePass}
          className="flex-1 py-4 bg-red-100 dark:bg-red-900/30 rounded-xl min-h-[44px] items-center justify-center"
          accessibilityLabel={t('games.pass')}
          accessibilityRole="button"
        >
          <Text className="text-red-600 dark:text-red-400 font-bold text-lg">{t('games.pass')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGotIt}
          className="flex-1 py-4 bg-green-100 dark:bg-green-900/30 rounded-xl min-h-[44px] items-center justify-center"
          accessibilityLabel={t('games.gotIt')}
          accessibilityRole="button"
        >
          <Text className="text-green-600 dark:text-green-400 font-bold text-lg">{t('games.gotIt')}</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-xs text-gray-400 dark:text-gray-500 mt-4">
        {t('games.score')}: {score} {'\u00B7'} {t('games.skipWord')}: {skipped}
      </Text>
    </View>
  );
}

// ─── Number Sequence ─────────────────────────────────────────────
interface SequencePuzzle {
  sequence: number[];
  answer: number;
}

function generateSequencePuzzle(level: number): SequencePuzzle {
  const type = Math.floor(Math.random() * 4);
  const len = Math.min(4 + Math.floor(level / 3), 7);

  if (type === 0) {
    // Arithmetic: a, a+d, a+2d, ...
    const a = Math.floor(Math.random() * 20) + 1;
    const d = Math.floor(Math.random() * 10) + 2;
    const seq = Array.from({ length: len }, (_, i) => a + i * d);
    return { sequence: seq.slice(0, -1), answer: seq[seq.length - 1] };
  } else if (type === 1) {
    // Geometric: a, a*r, a*r^2, ...
    const a = Math.floor(Math.random() * 5) + 2;
    const r = Math.floor(Math.random() * 3) + 2;
    const seq = Array.from({ length: len }, (_, i) => a * Math.pow(r, i));
    return { sequence: seq.slice(0, -1), answer: seq[seq.length - 1] };
  } else if (type === 2) {
    // Add-increasing: +1, +2, +3, ...
    let val = Math.floor(Math.random() * 10) + 1;
    const seq = [val];
    for (let i = 1; i < len; i++) { val += i; seq.push(val); }
    return { sequence: seq.slice(0, -1), answer: seq[seq.length - 1] };
  } else {
    // Squares: 1, 4, 9, 16, ...
    const offset = Math.floor(Math.random() * 5);
    const seq = Array.from({ length: len }, (_, i) => (i + 1 + offset) * (i + 1 + offset));
    return { sequence: seq.slice(0, -1), answer: seq[seq.length - 1] };
  }
}

const SEQUENCE_TOTAL = 10;

function SequenceGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [puzzle, setPuzzle] = useState<SequencePuzzle | null>(null);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const nextPuzzle = useCallback((lvl: number) => {
    setPuzzle(generateSequencePuzzle(lvl));
    setInput('');
    setFeedback(null);
  }, []);

  useEffect(() => { nextPuzzle(0); }, [nextPuzzle]);

  const handleSubmit = useCallback(() => {
    if (!puzzle || !input.trim()) return;
    const userAnswer = parseInt(input, 10);
    if (userAnswer === puzzle.answer) {
      const newScore = score + (10 + level * 5);
      const newLevel = level + 1;
      setScore(newScore);
      setLevel(newLevel);
      setFeedback('correct');
      if (newLevel >= SEQUENCE_TOTAL) {
        setTimeout(() => setIsFinished(true), 800);
      } else {
        setTimeout(() => nextPuzzle(newLevel), 800);
      }
    } else {
      setFeedback('incorrect');
      setTimeout(() => { setFeedback(null); setInput(''); }, 800);
    }
  }, [puzzle, input, score, level, nextPuzzle]);

  useEffect(() => {
    if (isFinished) onScore(score);
  }, [isFinished, score, onScore]);

  if (isFinished) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {t('games.score')}: {score}
        </Text>
        <TouchableOpacity
          onPress={() => { setLevel(0); setScore(0); setIsFinished(false); nextPuzzle(0); }}
          className="px-6 py-3 bg-teal-500 dark:bg-teal-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.newGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{t('games.newGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-blue-500 dark:text-blue-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 items-center justify-center">
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {level + 1}/{SEQUENCE_TOTAL} {'\u00B7'} {t('games.score')}: {score}
      </Text>
      {puzzle && (
        <>
          <View className="flex-row items-center gap-2 mb-6">
            {puzzle.sequence.map((n, i) => (
              <Text key={i} className="text-2xl font-bold text-gray-800 dark:text-white">
                {n}{i < puzzle.sequence.length - 1 ? ',' : ''}
              </Text>
            ))}
            <Text className="text-2xl font-bold text-teal-500">, ?</Text>
          </View>
          <View className={`border rounded-xl px-4 py-3 min-w-[120px] mb-4 ${
            feedback === 'correct' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
            feedback === 'incorrect' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
            'border-gray-300 dark:border-gray-600'
          }`}>
            <Text className={`text-center text-2xl font-bold ${
              feedback === 'correct' ? 'text-green-700 dark:text-green-300' :
              feedback === 'incorrect' ? 'text-red-700 dark:text-red-300' :
              'text-gray-800 dark:text-white'
            }`}>
              {input || '_'}
            </Text>
          </View>
          {/* Number pad */}
          <View className="flex-row flex-wrap justify-center gap-2 max-w-[200px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setInput((a) => a + String(n))}
                className="w-14 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center"
                accessibilityLabel={String(n)}
                accessibilityRole="button"
              >
                <Text className="text-lg font-medium text-gray-800 dark:text-white">{n}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setInput('')}
              className="w-14 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg items-center justify-center"
              accessibilityLabel="Clear"
              accessibilityRole="button"
            >
              <Text className="text-lg font-medium text-red-600 dark:text-red-400">C</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!input}
              className={`w-14 h-12 rounded-lg items-center justify-center ${
                input ? 'bg-teal-500 dark:bg-teal-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
              accessibilityLabel={t('games.play')}
              accessibilityRole="button"
            >
              <Text className="text-white font-bold">=</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      <TouchableOpacity
        onPress={onBack}
        className="mt-6 px-3 py-2 min-h-[44px] justify-center"
        accessibilityLabel={t('games.back')}
        accessibilityRole="button"
      >
        <Text className="text-gray-500 dark:text-gray-400">{'\u2190'} {t('games.back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Color Match (Stroop) ────────────────────────────────────────
const CM_COLORS = ['red', 'green', 'blue', 'yellow'] as const;
type CMColorName = typeof CM_COLORS[number];

const CM_COLOR_HEX: Record<CMColorName, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
};

const CM_LABEL_KEYS: Record<CMColorName, string> = {
  red: 'games.colorRed',
  green: 'games.colorGreen',
  blue: 'games.colorBlue',
  yellow: 'games.colorYellow',
};

const CM_ROUND_TIME = 30;

function ColorMatchGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'menu' | 'playing' | 'over'>('menu');
  const [word, setWord] = useState<CMColorName>('red');
  const [displayColor, setDisplayColor] = useState<CMColorName>('blue');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(CM_ROUND_TIME);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateChallenge = useCallback(() => {
    const w = CM_COLORS[Math.floor(Math.random() * CM_COLORS.length)];
    const mismatch = Math.random() < 0.6;
    let dc = w;
    if (mismatch) {
      const others = CM_COLORS.filter((c) => c !== w);
      dc = others[Math.floor(Math.random() * others.length)];
    }
    setWord(w);
    setDisplayColor(dc);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTotal(0);
    setTimeLeft(CM_ROUND_TIME);
    setFeedback(null);
    generateChallenge();
    setPhase('playing');
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, CM_ROUND_TIME - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setPhase('over');
      }
    }, 250);
  }, [generateChallenge]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleAnswer = useCallback((color: CMColorName) => {
    if (phase !== 'playing') return;
    setTotal((n) => n + 1);
    if (color === displayColor) {
      setScore((s) => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
    setTimeout(() => {
      setFeedback(null);
      generateChallenge();
    }, 300);
  }, [phase, displayColor, generateChallenge]);

  useEffect(() => {
    if (phase === 'over') onScore(score * 10);
  }, [phase, score, onScore]);

  if (phase === 'over') {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('games.score')}: {score * 10}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {score}/{total} {t('games.correct').toLowerCase()}
        </Text>
        <TouchableOpacity
          onPress={startGame}
          className="px-6 py-3 bg-rose-500 dark:bg-rose-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.newGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{t('games.newGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-blue-500 dark:text-blue-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'menu') {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {t('games.colorMatch')}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          {t('games.colorMatchDesc')}
        </Text>
        <TouchableOpacity
          onPress={startGame}
          className="px-8 py-4 bg-rose-500 dark:bg-rose-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.startGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-bold text-lg">{t('games.startGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-gray-500 dark:text-gray-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="flex-row justify-between w-full max-w-[280px] mb-4">
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {t('games.score')}: {score}/{total}
        </Text>
        <Text className={`text-sm font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {timeLeft}s
        </Text>
      </View>
      <View className={`py-8 px-12 rounded-2xl items-center mb-2 ${
        feedback === 'correct' ? 'bg-green-50 dark:bg-green-900/20' :
        feedback === 'incorrect' ? 'bg-red-50 dark:bg-red-900/20' :
        'bg-gray-50 dark:bg-gray-800'
      }`}>
        <Text style={{ color: CM_COLOR_HEX[displayColor], fontSize: 48, fontWeight: '900' }}>
          {t(CM_LABEL_KEYS[word] as any)}
        </Text>
      </View>
      <Text className="text-xs text-gray-400 dark:text-gray-500 mb-6">
        {t('games.colorMatchHint')}
      </Text>
      <View className="flex-row flex-wrap justify-center gap-3 max-w-[280px]">
        {CM_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => handleAnswer(color)}
            style={{ backgroundColor: CM_COLOR_HEX[color] }}
            className="w-[130px] py-4 rounded-xl items-center justify-center min-h-[44px]"
            accessibilityLabel={t(CM_LABEL_KEYS[color] as any)}
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-sm">{t(CM_LABEL_KEYS[color] as any)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Maze ────────────────────────────────────────────────────────
type MazeCell = { top: boolean; right: boolean; bottom: boolean; left: boolean; visited: boolean };

function generateMaze(rows: number, cols: number): MazeCell[][] {
  const grid: MazeCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ top: true, right: true, bottom: true, left: true, visited: false }))
  );
  const stack: [number, number][] = [];
  grid[0][0].visited = true;
  stack.push([0, 0]);

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    const neighbors: [number, number, 'top' | 'right' | 'bottom' | 'left', 'top' | 'right' | 'bottom' | 'left'][] = [];
    if (r > 0 && !grid[r - 1][c].visited) neighbors.push([r - 1, c, 'top', 'bottom']);
    if (c < cols - 1 && !grid[r][c + 1].visited) neighbors.push([r, c + 1, 'right', 'left']);
    if (r < rows - 1 && !grid[r + 1][c].visited) neighbors.push([r + 1, c, 'bottom', 'top']);
    if (c > 0 && !grid[r][c - 1].visited) neighbors.push([r, c - 1, 'left', 'right']);

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const [nr, nc, wall, opposite] = neighbors[Math.floor(Math.random() * neighbors.length)];
      grid[r][c][wall] = false;
      grid[nr][nc][opposite] = false;
      grid[nr][nc].visited = true;
      stack.push([nr, nc]);
    }
  }
  return grid;
}

const MAZE_SIZE = 8;

function MazeGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [maze, setMaze] = useState<MazeCell[][] | null>(null);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [moves, setMoves] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const startRef = useRef(Date.now());

  const initMaze = useCallback(() => {
    setMaze(generateMaze(MAZE_SIZE, MAZE_SIZE));
    setPos([0, 0]);
    setMoves(0);
    setIsFinished(false);
    startRef.current = Date.now();
  }, []);

  useEffect(() => { initMaze(); }, [initMaze]);

  const movePlayer = useCallback((dr: number, dc: number) => {
    if (!maze || isFinished) return;
    const [r, c] = pos;
    const cell = maze[r][c];
    if (dr === -1 && cell.top) return;
    if (dr === 1 && cell.bottom) return;
    if (dc === -1 && cell.left) return;
    if (dc === 1 && cell.right) return;
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= MAZE_SIZE || nc < 0 || nc >= MAZE_SIZE) return;
    setPos([nr, nc]);
    setMoves((m) => m + 1);
    if (nr === MAZE_SIZE - 1 && nc === MAZE_SIZE - 1) {
      setIsFinished(true);
    }
  }, [maze, pos, isFinished]);

  useEffect(() => {
    if (isFinished) {
      const elapsed = Date.now() - startRef.current;
      const optimalMoves = (MAZE_SIZE - 1) * 2;
      const efficiency = Math.max(0, 1 - (moves - optimalMoves) / (optimalMoves * 3));
      const timeBonus = Math.max(0, 120000 - elapsed) / 1000;
      const finalScore = Math.round(efficiency * 500 + timeBonus * 5);
      onScore(finalScore);
    }
  }, [isFinished, moves, onScore]);

  if (isFinished) {
    const elapsed = Date.now() - startRef.current;
    const optimalMoves = (MAZE_SIZE - 1) * 2;
    const efficiency = Math.max(0, 1 - (moves - optimalMoves) / (optimalMoves * 3));
    const timeBonus = Math.max(0, 120000 - elapsed) / 1000;
    const finalScore = Math.round(efficiency * 500 + timeBonus * 5);
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('games.score')}: {finalScore}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {moves} moves
        </Text>
        <TouchableOpacity
          onPress={initMaze}
          className="px-6 py-3 bg-emerald-500 dark:bg-emerald-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.newGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{t('games.newGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-blue-500 dark:text-blue-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cellSize = 32;
  const wallWidth = 2;
  const wallColor = '#9ca3af';

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('games.mazeRunner')} {'\u00B7'} {moves} moves
      </Text>
      {/* Maze grid */}
      <View style={{ borderWidth: wallWidth, borderColor: wallColor }}>
        {maze?.map((row, r) => (
          <View key={r} className="flex-row">
            {row.map((cell, c) => (
              <View
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderTopWidth: cell.top ? wallWidth : 0,
                  borderRightWidth: cell.right ? wallWidth : 0,
                  borderBottomWidth: cell.bottom ? wallWidth : 0,
                  borderLeftWidth: cell.left ? wallWidth : 0,
                  borderColor: wallColor,
                }}
                className={`items-center justify-center ${
                  r === 0 && c === 0 ? 'bg-green-100 dark:bg-green-900/30' :
                  r === MAZE_SIZE - 1 && c === MAZE_SIZE - 1 ? 'bg-red-100 dark:bg-red-900/30' : ''
                }`}
              >
                {pos[0] === r && pos[1] === c && (
                  <View className="w-5 h-5 rounded-full bg-emerald-500" />
                )}
                {r === MAZE_SIZE - 1 && c === MAZE_SIZE - 1 && !(pos[0] === r && pos[1] === c) && (
                  <Text className="text-xs">{'\u{1F3C1}'}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
      {/* D-pad controls */}
      <View className="mt-6 items-center">
        <TouchableOpacity
          onPress={() => movePlayer(-1, 0)}
          className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl items-center justify-center mb-1"
          accessibilityLabel="Up"
          accessibilityRole="button"
        >
          <Text className="text-xl text-gray-800 dark:text-white">{'\u25B2'}</Text>
        </TouchableOpacity>
        <View className="flex-row gap-1">
          <TouchableOpacity
            onPress={() => movePlayer(0, -1)}
            className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl items-center justify-center"
            accessibilityLabel="Left"
            accessibilityRole="button"
          >
            <Text className="text-xl text-gray-800 dark:text-white">{'\u25C0'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => movePlayer(1, 0)}
            className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl items-center justify-center"
            accessibilityLabel="Down"
            accessibilityRole="button"
          >
            <Text className="text-xl text-gray-800 dark:text-white">{'\u25BC'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => movePlayer(0, 1)}
            className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl items-center justify-center"
            accessibilityLabel="Right"
            accessibilityRole="button"
          >
            <Text className="text-xl text-gray-800 dark:text-white">{'\u25B6'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={onBack}
        className="mt-4 px-3 py-2 min-h-[44px] justify-center"
        accessibilityLabel={t('games.back')}
        accessibilityRole="button"
      >
        <Text className="text-gray-500 dark:text-gray-400">{'\u2190'} {t('games.back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Anagram ─────────────────────────────────────────────────────
const ANAGRAM_WORDS = [
  'apple', 'brain', 'chair', 'dance', 'eagle', 'flame', 'grape', 'house',
  'image', 'juice', 'knife', 'lemon', 'music', 'night', 'ocean', 'piano',
  'queen', 'river', 'stone', 'tiger', 'uncle', 'voice', 'water', 'youth',
  'beach', 'cloud', 'dream', 'earth', 'frost', 'giant', 'heart', 'light',
  'magic', 'noble', 'pearl', 'royal', 'shine', 'train', 'world', 'blaze',
];

const ANAGRAM_TOTAL = 10;
const ANAGRAM_HINT_PENALTY = 30;

function scrambleWord(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join('');
  return result === word ? scrambleWord(word) : result;
}

function AnagramGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const { t } = useTranslation();
  const [words, setWords] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const roundStartRef = useRef(Date.now());

  const startGame = useCallback(() => {
    const shuffled = [...ANAGRAM_WORDS].sort(() => Math.random() - 0.5).slice(0, ANAGRAM_TOTAL);
    setWords(shuffled);
    setRound(0);
    setScore(0);
    setHints(0);
    setGuess('');
    setRevealed(new Set());
    setFeedback(null);
    setIsFinished(false);
    setScrambled(scrambleWord(shuffled[0]));
    roundStartRef.current = Date.now();
  }, []);

  useEffect(() => { startGame(); }, [startGame]);

  const currentWord = words[round] || '';

  const handleSubmit = useCallback(() => {
    if (!guess.trim()) return;
    if (guess.trim().toLowerCase() === currentWord) {
      const speed = Math.max(0, 15000 - (Date.now() - roundStartRef.current)) / 1000;
      const pts = Math.round(100 + speed * 5 - hints * ANAGRAM_HINT_PENALTY);
      setScore((s) => s + Math.max(10, pts));
      setFeedback('correct');
      const nextRound = round + 1;
      if (nextRound >= ANAGRAM_TOTAL) {
        setTimeout(() => setIsFinished(true), 800);
      } else {
        setTimeout(() => {
          setRound(nextRound);
          setGuess('');
          setRevealed(new Set());
          setHints(0);
          setFeedback(null);
          setScrambled(scrambleWord(words[nextRound]));
          roundStartRef.current = Date.now();
        }, 800);
      }
    } else {
      setFeedback('incorrect');
      setTimeout(() => { setFeedback(null); setGuess(''); }, 600);
    }
  }, [guess, currentWord, round, hints, words]);

  const revealHint = useCallback(() => {
    const unrevealed = currentWord.split('').map((_, i) => i).filter((i) => !revealed.has(i));
    if (unrevealed.length <= 1) return;
    const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    setRevealed((prev) => new Set(prev).add(idx));
    setHints((h) => h + 1);
  }, [currentWord, revealed]);

  useEffect(() => {
    if (isFinished) onScore(score);
  }, [isFinished, score, onScore]);

  if (isFinished) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {t('games.score')}: {score}
        </Text>
        <TouchableOpacity
          onPress={startGame}
          className="px-6 py-3 bg-sky-500 dark:bg-sky-600 rounded-xl min-h-[44px] justify-center mb-3"
          accessibilityLabel={t('games.newGame')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{t('games.newGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="px-6 py-3 min-h-[44px] justify-center"
          accessibilityLabel={t('games.back')}
          accessibilityRole="button"
        >
          <Text className="text-blue-500 dark:text-blue-400">{t('games.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 items-center justify-center">
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {round + 1}/{ANAGRAM_TOTAL} {'\u00B7'} {t('games.score')}: {score}
      </Text>
      {/* Scrambled letters */}
      <View className="flex-row gap-2 mb-6">
        {scrambled.split('').map((letter, i) => (
          <View
            key={i}
            className="w-12 h-12 rounded-lg bg-sky-100 dark:bg-sky-900/30 items-center justify-center"
          >
            <Text className="text-xl font-bold text-sky-700 dark:text-sky-300 uppercase">{letter}</Text>
          </View>
        ))}
      </View>
      {/* Hint display */}
      {revealed.size > 0 && (
        <View className="flex-row gap-1 mb-4">
          {currentWord.split('').map((letter, i) => (
            <Text key={i} className="w-8 text-center text-sm font-bold text-gray-800 dark:text-white uppercase border-b-2 border-gray-300 dark:border-gray-600">
              {revealed.has(i) ? letter : '_'}
            </Text>
          ))}
        </View>
      )}
      {/* Input area */}
      <View className={`border rounded-xl px-4 py-3 min-w-[200px] mb-4 ${
        feedback === 'correct' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
        feedback === 'incorrect' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
        'border-gray-300 dark:border-gray-600'
      }`}>
        <Text className={`text-center text-xl font-bold uppercase tracking-widest ${
          feedback === 'correct' ? 'text-green-700 dark:text-green-300' :
          feedback === 'incorrect' ? 'text-red-700 dark:text-red-300' :
          'text-gray-800 dark:text-white'
        }`}>
          {guess || '...'}
        </Text>
      </View>
      {/* Letter keyboard */}
      <View className="flex-row flex-wrap justify-center gap-1 max-w-[320px] mb-4">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch) => (
          <TouchableOpacity
            key={ch}
            onPress={() => setGuess((g) => g + ch)}
            className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded items-center justify-center"
            accessibilityLabel={ch}
            accessibilityRole="button"
          >
            <Text className="text-sm font-medium text-gray-800 dark:text-white">{ch}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-row gap-3 mb-3">
        <TouchableOpacity
          onPress={() => setGuess((g) => g.slice(0, -1))}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg min-h-[44px] justify-center"
          accessibilityLabel="Delete"
          accessibilityRole="button"
        >
          <Text className="text-gray-700 dark:text-gray-300">{'\u232B'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!guess}
          className={`px-6 py-2 rounded-lg min-h-[44px] justify-center ${
            guess ? 'bg-sky-500 dark:bg-sky-600' : 'bg-gray-300 dark:bg-gray-700'
          }`}
          accessibilityLabel={t('games.play')}
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{'\u2713'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={revealHint}
        className="mb-3 min-h-[44px] justify-center"
        accessibilityLabel={t('games.anagramHint')}
        accessibilityRole="button"
      >
        <Text className="text-xs text-sky-600 dark:text-sky-400">
          {t('games.anagramHint')} (-{ANAGRAM_HINT_PENALTY} pts)
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onBack}
        className="px-3 py-2 min-h-[44px] justify-center"
        accessibilityLabel={t('games.back')}
        accessibilityRole="button"
      >
        <Text className="text-gray-500 dark:text-gray-400">{'\u2190'} {t('games.back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Game Menu & Scoreboard ──────────────────────────────────────
const GAME_CONFIGS: { type: GameType; titleKey: string; color: string; emoji: string }[] = [
  { type: 'trivia', titleKey: 'games.trivia', color: 'bg-purple-500 dark:bg-purple-600', emoji: '\u2753' },
  { type: 'math', titleKey: 'games.math', color: 'bg-blue-500 dark:bg-blue-600', emoji: '\u{1F522}' },
  { type: 'word', titleKey: 'games.wordGame', color: 'bg-green-500 dark:bg-green-600', emoji: '\u{1F520}' },
  { type: 'memory', titleKey: 'games.memory', color: 'bg-orange-500 dark:bg-orange-600', emoji: '\u{1F9E0}' },
  { type: 'reaction', titleKey: 'games.reaction', color: 'bg-red-500 dark:bg-red-600', emoji: '\u26A1' },
  { type: 'simon', titleKey: 'games.simon', color: 'bg-yellow-500 dark:bg-yellow-600', emoji: '\u{1F3B5}' },
  { type: 'headsup', titleKey: 'games.headsUp', color: 'bg-fuchsia-500 dark:bg-fuchsia-600', emoji: '\u{1F64B}' },
  { type: 'sequence', titleKey: 'games.numberSequence', color: 'bg-teal-500 dark:bg-teal-600', emoji: '\u{1F522}' },
  { type: 'colormatch', titleKey: 'games.colorMatch', color: 'bg-rose-500 dark:bg-rose-600', emoji: '\u{1F3A8}' },
  { type: 'maze', titleKey: 'games.mazeRunner', color: 'bg-emerald-500 dark:bg-emerald-600', emoji: '\u{1F9E9}' },
  { type: 'anagram', titleKey: 'games.anagram', color: 'bg-sky-500 dark:bg-sky-600', emoji: '\u{1F524}' },
];

export default function FamilyGamesScreen() {
  const { t } = useTranslation();
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(false);

  // Load scores
  useEffect(() => {
    try {
      const stored = safeGetItem(StorageKeys.FAMILY_GAMES_CACHE);
      if (stored) setScores(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveScore = useCallback((game: GameType, score: number) => {
    const entry: ScoreEntry = { game, score, date: Date.now() };
    setScores((prev) => {
      const updated = [entry, ...prev].slice(0, 50);
      try {
        safeSetItem(StorageKeys.FAMILY_GAMES_CACHE, JSON.stringify(updated));
      } catch { /* ignore */ }
      eventBus.publish(AppEvents.FAMILY_GAMES_CHANGED);
      return updated;
    });
  }, []);

  const handleScore = useCallback((game: GameType) => (score: number) => {
    saveScore(game, score);
  }, [saveScore]);

  const handleBack = useCallback(() => setActiveGame(null), []);

  // Best scores per game
  const bestScores = useMemo(() => {
    const map: Record<string, number> = {};
    scores.forEach((s) => {
      if (!map[s.game] || s.score > map[s.game]) map[s.game] = s.score;
    });
    return map;
  }, [scores]);

  // Render active game
  if (activeGame) {
    const props = { onBack: handleBack, onScore: handleScore(activeGame) };
    switch (activeGame) {
      case 'trivia': return <TriviaGame {...props} />;
      case 'math': return <MathGame {...props} />;
      case 'word': return <WordGame {...props} />;
      case 'memory': return <MemoryGame {...props} />;
      case 'reaction': return <ReactionGame {...props} />;
      case 'simon': return <SimonGame {...props} />;
      case 'headsup': return <HeadsUpGame {...props} />;
      case 'sequence': return <SequenceGame {...props} />;
      case 'colormatch': return <ColorMatchGame {...props} />;
      case 'maze': return <MazeGame {...props} />;
      case 'anagram': return <AnagramGame {...props} />;
    }
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4 pb-20" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6 mt-4">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('games.title')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('games.subtitle')}
          </Text>
        </View>

        {/* Game grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {GAME_CONFIGS.map((game) => (
            <TouchableOpacity
              key={game.type}
              onPress={() => setActiveGame(game.type)}
              className={`${game.color} rounded-xl p-4 w-[47%] min-h-[120px] justify-center items-center`}
              accessibilityLabel={t(game.titleKey as any)}
              accessibilityRole="button"
            >
              <Text className="text-3xl mb-2">{game.emoji}</Text>
              <Text className="text-white font-semibold text-sm text-center">
                {t(game.titleKey as any)}
              </Text>
              {bestScores[game.type] !== undefined && (
                <Text className="text-white/70 text-xs mt-1">
                  {t('games.bestScore')}: {bestScores[game.type]}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Scoreboard toggle */}
        <TouchableOpacity
          onPress={() => setShowScoreboard(!showScoreboard)}
          className="mb-4 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl min-h-[44px] justify-center"
          accessibilityLabel={t('games.scoreboard')}
          accessibilityRole="button"
        >
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            {t('games.scoreboard')} {showScoreboard ? '\u25B2' : '\u25BC'}
          </Text>
        </TouchableOpacity>

        {/* Scoreboard */}
        {showScoreboard && (
          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
            {scores.length === 0 ? (
              <Text className="text-sm text-gray-400 dark:text-gray-500 text-center">
                {t('games.play')}
              </Text>
            ) : (
              scores.slice(0, 20).map((entry, idx) => (
                <View
                  key={idx}
                  className="flex-row justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700"
                >
                  <Text className="text-sm text-gray-700 dark:text-gray-300">
                    {t(GAME_CONFIGS.find((g) => g.type === entry.game)?.titleKey as any || entry.game)}
                  </Text>
                  <Text className="text-sm font-medium text-gray-800 dark:text-white">
                    {entry.score}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
