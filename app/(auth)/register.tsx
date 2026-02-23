import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import { signUpWithEmail, signInWithGoogle } from '../../src/firebase/auth';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function getErrorMessage(err: any): string {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return t('auth.errorEmailInUse');
      case 'auth/invalid-email':
        return t('auth.errorInvalidEmail');
      case 'auth/weak-password':
        return t('auth.errorWeakPassword');
      case 'auth/too-many-requests':
        return t('auth.errorTooManyRequests');
      default:
        return t('auth.errorGeneric');
    }
  }

  async function handleEmailSignUp() {
    if (!email.trim() || !password.trim()) {
      setError(t('auth.errorInvalidEmail'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.errorPasswordMismatch'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await signUpWithEmail(email.trim(), password, displayName.trim() || undefined);
      // Auth state listener in root layout will handle navigation
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      // Auth state listener in root layout will handle navigation
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const isSubmitting = isLoading || isGoogleLoading;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center p-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <Pressable
            type="button"
            onPress={() => router.back()}
            className="w-11 h-11 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800 mb-4 -ml-2"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </Pressable>

          {/* Title */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('auth.signUp')}
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mt-1">
              Create your MyCircle account
            </Text>
          </View>

          {/* Error message */}
          {error ? (
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
              <Text className="text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Google Sign-In */}
          <Pressable
            type="button"
            onPress={handleGoogleSignIn}
            disabled={isSubmitting}
            className="flex-row items-center justify-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl py-3.5 px-4 mb-6 active:bg-gray-50 dark:active:bg-gray-700"
            accessibilityRole="button"
            accessibilityLabel={t('auth.continueWithGoogle')}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text className="text-base font-semibold text-gray-700 dark:text-gray-200 ml-3">
                  {t('auth.continueWithGoogle')}
                </Text>
              </>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <Text className="mx-4 text-sm text-gray-400 dark:text-gray-500">
              {t('auth.or')}
            </Text>
            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </View>

          {/* Display Name field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('auth.displayName')}
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
              placeholder={t('auth.displayName')}
              placeholderTextColor="#9ca3af"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              editable={!isSubmitting}
              accessibilityLabel={t('auth.displayName')}
            />
          </View>

          {/* Email field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('auth.email')}
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
              placeholder={t('auth.email')}
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!isSubmitting}
              accessibilityLabel={t('auth.email')}
            />
          </View>

          {/* Password field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('auth.password')}
            </Text>
            <View className="relative">
              <TextInput
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pr-12 text-base text-gray-900 dark:text-white"
                placeholder={t('auth.password')}
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!isSubmitting}
                accessibilityLabel={t('auth.password')}
              />
              <Pressable
                type="button"
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 bottom-0 w-12 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9ca3af"
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password field */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('auth.confirmPassword')}
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
              placeholder={t('auth.confirmPassword')}
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!isSubmitting}
              accessibilityLabel={t('auth.confirmPassword')}
            />
          </View>

          {/* Sign Up button */}
          <Pressable
            onPress={handleEmailSignUp}
            disabled={isSubmitting}
            className="bg-blue-500 rounded-xl py-3.5 items-center active:bg-blue-600 disabled:opacity-50 mb-4"
            accessibilityRole="button"
            accessibilityLabel={t('auth.signUp')}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-white">
                {t('auth.signUp')}
              </Text>
            )}
          </Pressable>

          {/* Navigate to Login */}
          <Pressable
            type="button"
            onPress={() => router.back()}
            className="items-center py-2"
            accessibilityRole="button"
          >
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Text className="text-blue-500 font-semibold">
                {t('auth.signIn')}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
