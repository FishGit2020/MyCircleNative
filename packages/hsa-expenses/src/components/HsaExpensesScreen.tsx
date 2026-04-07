import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation, safeGetItem, safeSetItem } from '@mycircle/shared';

/* ── Types ───────────────────────────────────────────────── */

type ExpenseCategory = 'Medical' | 'Dental' | 'Vision' | 'Rx' | 'Other';
type ExpenseStatus = 'submitted' | 'approved' | 'denied' | 'pending';

interface HsaExpense {
  id: string;
  provider: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  status: ExpenseStatus;
  hasReceipt: boolean;
}

const CATEGORIES: ExpenseCategory[] = ['Medical', 'Dental', 'Vision', 'Rx', 'Other'];
const STATUSES: ExpenseStatus[] = ['pending', 'submitted', 'approved', 'denied'];
const STORAGE_KEY = 'hsa-expenses-cache';

/* ── Status Badge ────────────────────────────────────────── */

function StatusBadge({ status }: { status: ExpenseStatus }) {
  const colorMap: Record<ExpenseStatus, { bg: string; darkBg: string; text: string; darkText: string }> = {
    submitted: { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900', text: 'text-blue-800', darkText: 'dark:text-blue-200' },
    approved: { bg: 'bg-green-100', darkBg: 'dark:bg-green-900', text: 'text-green-800', darkText: 'dark:text-green-200' },
    denied: { bg: 'bg-red-100', darkBg: 'dark:bg-red-900', text: 'text-red-800', darkText: 'dark:text-red-200' },
    pending: { bg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-900', text: 'text-yellow-800', darkText: 'dark:text-yellow-200' },
  };
  const c = colorMap[status];
  return (
    <View className={`px-2 py-1 rounded-full ${c.bg} ${c.darkBg}`}>
      <Text className={`text-xs font-medium ${c.text} ${c.darkText}`}>{status}</Text>
    </View>
  );
}

/* ── Component ───────────────────────────────────────────── */

export default function HsaExpensesScreen() {
  const { t } = useTranslation();

  const [expenses, setExpenses] = useState<HsaExpense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Medical');
  const [hasReceipt, setHasReceipt] = useState(false);

  /* ── Persistence ─────────────────────────────────────────── */

  useEffect(() => {
    const raw = safeGetItem(STORAGE_KEY);
    if (raw) {
      try {
        setExpenses(JSON.parse(raw));
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  const persist = useCallback((next: HsaExpense[]) => {
    setExpenses(next);
    safeSetItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  /* ── Summary ─────────────────────────────────────────────── */

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const reimbursed = expenses
    .filter((e) => e.status === 'approved')
    .reduce((s, e) => s + e.amount, 0);
  const pending = expenses
    .filter((e) => e.status === 'pending' || e.status === 'submitted')
    .reduce((s, e) => s + e.amount, 0);

  /* ── Form helpers ────────────────────────────────────────── */

  const resetForm = () => {
    setProvider('');
    setDate('');
    setAmount('');
    setCategory('Medical');
    setHasReceipt(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!provider.trim() || !date.trim() || !amount.trim()) {
      Alert.alert(t('hsaExpenses.validationError' as any), t('hsaExpenses.fillAllFields' as any));
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('hsaExpenses.validationError' as any), t('hsaExpenses.invalidAmount' as any));
      return;
    }

    if (editingId) {
      const next = expenses.map((e) =>
        e.id === editingId
          ? { ...e, provider: provider.trim(), date: date.trim(), amount: parsedAmount, category, hasReceipt }
          : e,
      );
      persist(next);
    } else {
      const newExpense: HsaExpense = {
        id: Date.now().toString(),
        provider: provider.trim(),
        date: date.trim(),
        amount: parsedAmount,
        category,
        status: 'pending',
        hasReceipt,
      };
      persist([newExpense, ...expenses]);
    }
    resetForm();
  };

  const handleEdit = (expense: HsaExpense) => {
    setProvider(expense.provider);
    setDate(expense.date);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setHasReceipt(expense.hasReceipt);
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('hsaExpenses.confirmDelete' as any),
      t('hsaExpenses.deleteMessage' as any),
      [
        { text: t('hsaExpenses.cancel' as any), style: 'cancel' },
        {
          text: t('hsaExpenses.delete' as any),
          style: 'destructive',
          onPress: () => persist(expenses.filter((e) => e.id !== id)),
        },
      ],
    );
  };

  const cycleStatus = (id: string) => {
    const next = expenses.map((e) => {
      if (e.id !== id) return e;
      const idx = STATUSES.indexOf(e.status);
      return { ...e, status: STATUSES[(idx + 1) % STATUSES.length] };
    });
    persist(next);
  };

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 py-4">
      {/* Summary */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {t('hsaExpenses.summary' as any)}
        </Text>
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('hsaExpenses.totalExpenses' as any)}
            </Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              ${totalExpenses.toFixed(2)}
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('hsaExpenses.reimbursed' as any)}
            </Text>
            <Text className="text-lg font-bold text-green-600 dark:text-green-400">
              ${reimbursed.toFixed(2)}
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('hsaExpenses.pending' as any)}
            </Text>
            <Text className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              ${pending.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Add Button */}
      <Pressable
        onPress={() => { resetForm(); setShowForm(true); }}
        className="bg-indigo-600 dark:bg-indigo-500 rounded-xl py-3 mb-4 flex-row items-center justify-center min-h-[44px]"
        accessibilityLabel={t('hsaExpenses.addExpense' as any)}
        accessibilityRole="button"
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text className="text-white font-semibold ml-2">
          {t('hsaExpenses.addExpense' as any)}
        </Text>
      </Pressable>

      {/* Form */}
      {showForm && (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
            {editingId ? t('hsaExpenses.editExpense' as any) : t('hsaExpenses.newExpense' as any)}
          </Text>

          {/* Provider */}
          <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            {t('hsaExpenses.provider' as any)}
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[44px]"
            value={provider}
            onChangeText={setProvider}
            placeholder={t('hsaExpenses.providerPlaceholder' as any)}
            placeholderTextColor="#9ca3af"
            accessibilityLabel={t('hsaExpenses.provider' as any)}
          />

          {/* Date */}
          <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            {t('hsaExpenses.date' as any)}
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[44px]"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            accessibilityLabel={t('hsaExpenses.date' as any)}
          />

          {/* Amount */}
          <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            {t('hsaExpenses.amount' as any)}
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[44px]"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
            accessibilityLabel={t('hsaExpenses.amount' as any)}
          />

          {/* Category Picker */}
          <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            {t('hsaExpenses.category' as any)}
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-3 py-2 rounded-lg min-h-[44px] items-center justify-center ${
                  category === cat
                    ? 'bg-indigo-600 dark:bg-indigo-500'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
                accessibilityLabel={cat}
                accessibilityRole="button"
              >
                <Text
                  className={`text-sm font-medium ${
                    category === cat
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Receipt Toggle */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              {t('hsaExpenses.hasReceipt' as any)}
            </Text>
            <Switch
              value={hasReceipt}
              onValueChange={setHasReceipt}
              accessibilityLabel={t('hsaExpenses.hasReceipt' as any)}
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={resetForm}
              className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-lg py-3 items-center min-h-[44px] justify-center"
              accessibilityLabel={t('hsaExpenses.cancel' as any)}
              accessibilityRole="button"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium">
                {t('hsaExpenses.cancel' as any)}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              className="flex-1 bg-indigo-600 dark:bg-indigo-500 rounded-lg py-3 items-center min-h-[44px] justify-center"
              accessibilityLabel={t('hsaExpenses.save' as any)}
              accessibilityRole="button"
            >
              <Text className="text-white font-medium">
                {t('hsaExpenses.save' as any)}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Expense List */}
      {expenses.length === 0 && !showForm && (
        <View className="items-center py-12">
          <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-base">
            {t('hsaExpenses.noExpenses' as any)}
          </Text>
        </View>
      )}

      {expenses.map((expense) => (
        <View
          key={expense.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1 mr-2" numberOfLines={1}>
              {expense.provider}
            </Text>
            <Pressable
              onPress={() => cycleStatus(expense.id)}
              className="min-w-[44px] min-h-[44px] items-center justify-center"
              accessibilityLabel={t('hsaExpenses.changeStatus' as any)}
              accessibilityRole="button"
            >
              <StatusBadge status={expense.status} />
            </Pressable>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1 mr-4">
              {expense.date}
            </Text>
            <Ionicons name="pricetag-outline" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              {expense.category}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              ${expense.amount.toFixed(2)}
            </Text>
            <View className="flex-row items-center gap-1">
              {expense.hasReceipt && (
                <Ionicons name="document-text-outline" size={16} color="#6b7280" />
              )}
              <Pressable
                onPress={() => handleEdit(expense)}
                className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                accessibilityLabel={t('hsaExpenses.edit' as any)}
                accessibilityRole="button"
              >
                <Ionicons name="pencil-outline" size={18} color="#6366f1" />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(expense.id)}
                className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                accessibilityLabel={t('hsaExpenses.delete' as any)}
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </Pressable>
            </View>
          </View>
        </View>
      ))}

      {/* Bottom spacing */}
      <View className="h-8" />
    </ScrollView>
  );
}
