import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  useTranslation,
  StorageKeys,
  AppEvents,
  eventBus,
  safeGetItem,
  safeSetItem,
} from '@mycircle/shared';

type GameType = 'trivia' | 'math' | 'word' | 'memory' | 'reaction' | 'simon';

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

// ─── Game Menu & Scoreboard ──────────────────────────────────────
const GAME_CONFIGS: { type: GameType; titleKey: string; color: string; emoji: string }[] = [
  { type: 'trivia', titleKey: 'games.trivia', color: 'bg-purple-500 dark:bg-purple-600', emoji: '\u2753' },
  { type: 'math', titleKey: 'games.math', color: 'bg-blue-500 dark:bg-blue-600', emoji: '\u{1F522}' },
  { type: 'word', titleKey: 'games.wordGame', color: 'bg-green-500 dark:bg-green-600', emoji: '\u{1F520}' },
  { type: 'memory', titleKey: 'games.memory', color: 'bg-orange-500 dark:bg-orange-600', emoji: '\u{1F9E0}' },
  { type: 'reaction', titleKey: 'games.reaction', color: 'bg-red-500 dark:bg-red-600', emoji: '\u26A1' },
  { type: 'simon', titleKey: 'games.simon', color: 'bg-yellow-500 dark:bg-yellow-600', emoji: '\u{1F3B5}' },
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
