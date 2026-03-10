import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useTranslation, eventBus, AppEvents } from '@mycircle/shared';

// ── Types ────────────────────────────────────────────────────
interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  voters: Record<string, string>; // uid -> optionId
}

type ViewMode = 'list' | 'new' | 'detail';

// ── Component ────────────────────────────────────────────────
export default function PollSystemScreen() {
  const { t } = useTranslation();
  const user = auth().currentUser;

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('list');
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);

  // Form state
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<{ id: string; text: string }[]>([
    { id: 'opt-1', text: '' },
    { id: 'opt-2', text: '' },
  ]);

  // ── Subscribe to polls ─────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsubscribe = firestore()
      .collection('polls')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const data: Poll[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Poll[];
          setPolls(data);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
      );
    return unsubscribe;
  }, [user]);

  // ── Create poll ────────────────────────────────────────────
  const handleCreatePoll = useCallback(async () => {
    if (!user) return;
    const validOptions = options.filter((o) => o.text.trim());
    if (!question.trim() || validOptions.length < 2) return;

    const pollOptions: PollOption[] = validOptions.map((o) => ({
      id: o.id,
      text: o.text.trim(),
      votes: 0,
    }));

    try {
      await firestore().collection('polls').add({
        question: question.trim(),
        options: pollOptions,
        createdBy: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        voters: {},
      });
      eventBus.publish(AppEvents.POLLS_CHANGED);
      setQuestion('');
      setOptions([
        { id: 'opt-1', text: '' },
        { id: 'opt-2', text: '' },
      ]);
      setView('list');
    } catch (err) {
      Alert.alert(t('poll.error'), err instanceof Error ? err.message : 'Unknown error');
    }
  }, [question, options, user, t]);

  // ── Vote ───────────────────────────────────────────────────
  const handleVote = useCallback(
    async (pollId: string, optionId: string) => {
      if (!user) return;
      const poll = polls.find((p) => p.id === pollId);
      if (!poll) return;

      // Check if already voted
      if (poll.voters?.[user.uid]) {
        Alert.alert(t('poll.alreadyVoted'));
        return;
      }

      try {
        const updatedOptions = poll.options.map((o) =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o,
        );
        await firestore()
          .collection('polls')
          .doc(pollId)
          .update({
            options: updatedOptions,
            [`voters.${user.uid}`]: optionId,
            updatedAt: Date.now(),
          });
        eventBus.publish(AppEvents.POLLS_CHANGED);
      } catch (err) {
        Alert.alert(t('poll.error'), err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [polls, user, t],
  );

  // ── Delete poll ────────────────────────────────────────────
  const handleDelete = useCallback(
    (pollId: string) => {
      Alert.alert(t('poll.delete'), t('poll.deleteConfirm'), [
        { text: t('poll.cancel'), style: 'cancel' },
        {
          text: t('poll.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('polls').doc(pollId).delete();
              eventBus.publish(AppEvents.POLLS_CHANGED);
              if (view === 'detail') {
                setView('list');
                setSelectedPoll(null);
              }
            } catch (err) {
              Alert.alert(
                t('poll.error'),
                err instanceof Error ? err.message : 'Unknown error',
              );
            }
          },
        },
      ]);
    },
    [t, view],
  );

  // ── Option helpers ─────────────────────────────────────────
  const addOption = useCallback(() => {
    setOptions((prev) => [...prev, { id: `opt-${Date.now()}`, text: '' }]);
  }, []);

  const removeOption = useCallback((id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const updateOption = useCallback((id: string, text: string) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  }, []);

  // ── Auth wall ──────────────────────────────────────────────
  if (!user) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="lock-closed-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-center">
            {t('poll.loginToUse')}
          </Text>
        </View>
      </View>
    );
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 dark:text-red-400 text-center">{error}</Text>
        </View>
      </View>
    );
  }

  // ── Create view ────────────────────────────────────────────
  if (view === 'new') {
    const validCount = options.filter((o) => o.text.trim()).length;
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-800 dark:text-white">
              {t('poll.create')}
            </Text>
            <Pressable
              onPress={() => setView('list')}
              accessibilityRole="button"
              accessibilityLabel={t('poll.cancel')}
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
            >
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {t('poll.cancel')}
              </Text>
            </Pressable>
          </View>

          {/* Question */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('poll.question')} *
          </Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder={t('poll.questionPlaceholder')}
            placeholderTextColor="#9ca3af"
            accessibilityLabel={t('poll.question')}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 mb-4 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />

          {/* Options */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('poll.options')} *
          </Text>
          {options.map((opt, idx) => (
            <View key={opt.id} className="flex-row items-center gap-2 mb-2">
              <Text className="text-xs text-gray-400 dark:text-gray-500 w-5 text-right">
                {idx + 1}.
              </Text>
              <TextInput
                value={opt.text}
                onChangeText={(text) => updateOption(opt.id, text)}
                placeholder={`${t('poll.option')} ${idx + 1}`}
                placeholderTextColor="#9ca3af"
                accessibilityLabel={`${t('poll.option')} ${idx + 1}`}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {options.length > 2 && (
                <Pressable
                  onPress={() => removeOption(opt.id)}
                  accessibilityRole="button"
                  accessibilityLabel={t('poll.removeOption')}
                  style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Ionicons name="close" size={16} color="#9ca3af" />
                </Pressable>
              )}
            </View>
          ))}
          <Pressable
            onPress={addOption}
            accessibilityRole="button"
            accessibilityLabel={t('poll.addOption')}
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text className="text-sm text-violet-600 dark:text-violet-400">
              + {t('poll.addOption')}
            </Text>
          </Pressable>

          {/* Submit */}
          <Pressable
            onPress={handleCreatePoll}
            disabled={!question.trim() || validCount < 2}
            accessibilityRole="button"
            accessibilityLabel={t('poll.create')}
            className={`mt-6 w-full py-2.5 px-4 rounded-lg items-center ${
              !question.trim() || validCount < 2
                ? 'bg-violet-400 dark:bg-violet-800'
                : 'bg-violet-500 dark:bg-violet-600'
            }`}
            style={{ minHeight: 44 }}
          >
            <Text className="text-white text-sm font-medium">{t('poll.create')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ── Detail view ────────────────────────────────────────────
  if (view === 'detail' && selectedPoll) {
    const currentPoll = polls.find((p) => p.id === selectedPoll.id) || selectedPoll;
    const totalVotes = currentPoll.options.reduce((sum, o) => sum + o.votes, 0);
    const maxVotes = Math.max(...currentPoll.options.map((o) => o.votes), 1);
    const hasVoted = !!currentPoll.voters?.[user.uid];
    const isOwner = currentPoll.createdBy === user.uid;

    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <ScrollView className="flex-1 px-4 pt-4">
          {/* Back button */}
          <Pressable
            onPress={() => {
              setView('list');
              setSelectedPoll(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('poll.back')}
            className="mb-2"
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {'\u2190'} {t('poll.back')}
            </Text>
          </Pressable>

          {/* Question */}
          <View className="flex-row items-start justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
              {currentPoll.question}
            </Text>
            {isOwner && (
              <Pressable
                onPress={() => handleDelete(currentPoll.id)}
                accessibilityRole="button"
                accessibilityLabel={t('poll.delete')}
                style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text className="text-sm text-red-600 dark:text-red-400">
                  {t('poll.delete')}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Options with bar chart */}
          {currentPoll.options.map((option) => {
            const percentage =
              totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const barWidth =
              totalVotes > 0 ? (option.votes / maxVotes) * 100 : 0;
            const isLeading = option.votes === maxVotes && totalVotes > 0;
            const isMyVote = currentPoll.voters?.[user.uid] === option.id;

            return (
              <View key={option.id} className="mb-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Pressable
                    onPress={() => !hasVoted && handleVote(currentPoll.id, option.id)}
                    disabled={hasVoted}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('poll.voteFor')} ${option.text}`}
                    style={{ minHeight: 44, justifyContent: 'center', flex: 1 }}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        hasVoted
                          ? 'text-gray-500 dark:text-gray-400'
                          : 'text-gray-800 dark:text-white'
                      }`}
                    >
                      {option.text}
                      {isMyVote && ' \u2713'}
                    </Text>
                  </Pressable>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    {option.votes} ({percentage}%)
                  </Text>
                </View>
                <View className="w-full h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${
                      isLeading
                        ? 'bg-violet-500 dark:bg-violet-400'
                        : 'bg-purple-300 dark:bg-purple-600'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </View>
              </View>
            );
          })}

          {/* Total votes */}
          <View className="items-center pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('poll.totalVotes')}: {totalVotes}
            </Text>
          </View>

          {/* Vote instruction */}
          {!hasVoted && (
            <Text className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
              {t('poll.clickToVote')}
            </Text>
          )}
          {hasVoted && (
            <Text className="text-xs text-center text-violet-500 dark:text-violet-400 mt-2">
              {t('poll.voted')}
            </Text>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── List view ──────────────────────────────────────────────
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="clipboard-outline" size={24} color="#8b5cf6" />
            <Text className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('poll.title')}
            </Text>
          </View>
          <Pressable
            onPress={() => setView('new')}
            accessibilityRole="button"
            accessibilityLabel={t('poll.create')}
            className="px-4 py-2 bg-violet-500 rounded-lg dark:bg-violet-600"
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text className="text-white text-sm font-medium">{t('poll.create')}</Text>
          </Pressable>
        </View>
      </View>

      {polls.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <Ionicons name="clipboard-outline" size={48} color="#d1d5db" />
          <Text className="mt-3 text-gray-500 dark:text-gray-400">
            {t('poll.noPolls')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={polls}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: poll }) => {
            const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
            const isOwner = poll.createdBy === user.uid;

            return (
              <Pressable
                onPress={() => {
                  setSelectedPoll(poll);
                  setView('detail');
                }}
                accessibilityRole="button"
                accessibilityLabel={poll.question}
                className="p-4 bg-white border border-gray-200 rounded-xl mb-3 dark:bg-gray-800 dark:border-gray-700"
                style={{ minHeight: 44 }}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 min-w-0">
                    <Text
                      className="font-semibold text-gray-900 dark:text-white"
                      numberOfLines={2}
                    >
                      {poll.question}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {poll.options.length} {t('poll.options')} {'\u00B7'} {totalVotes}{' '}
                      {t('poll.votes')}
                    </Text>
                  </View>
                  <View className="items-end gap-1">
                    {isOwner && (
                      <View className="rounded-full bg-violet-100 px-2 py-0.5 dark:bg-violet-900">
                        <Text className="text-xs font-medium text-violet-700 dark:text-violet-300">
                          {t('poll.myPolls')}
                        </Text>
                      </View>
                    )}
                    {poll.voters?.[user.uid] && (
                      <View className="rounded-full bg-green-100 px-2 py-0.5 dark:bg-green-900">
                        <Text className="text-xs font-medium text-green-700 dark:text-green-300">
                          {t('poll.voted')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
