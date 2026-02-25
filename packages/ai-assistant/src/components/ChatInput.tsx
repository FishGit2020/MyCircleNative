import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  Animated,
  Platform,
} from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useTranslation } from '@mycircle/shared';

/* ── Props ────────────────────────────────────────────────── */

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

/* ── Component ────────────────────────────────────────────── */

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [listening, setListening] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Focus input when disabled changes (e.g., after loading finishes)
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Pulsing animation while listening
  useEffect(() => {
    if (listening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [listening, pulseAnim]);

  // Speech recognition event handlers
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
  });

  useSpeechRecognitionEvent('error', () => {
    setListening(false);
  });

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }, [value, disabled, onSend]);

  const toggleVoice = useCallback(async () => {
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) return;

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
      });
      setListening(true);
    } catch {
      /* speech recognition not available */
    }
  }, [listening]);

  return (
    <View className="flex-row items-end gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSubmit}
        placeholder={t('ai.inputPlaceholder')}
        placeholderTextColor="#9ca3af"
        editable={!disabled}
        multiline
        maxLength={2000}
        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm max-h-32"
        accessibilityLabel={t('ai.inputPlaceholder')}
        returnKeyType="send"
        blurOnSubmit={false}
        style={[
          disabled && { opacity: 0.5 },
          // min touch target
          { minHeight: 44 },
        ]}
      />

      {/* Voice input button */}
      <Animated.View style={{ opacity: listening ? pulseAnim : 1 }}>
        <Pressable
          onPress={toggleVoice}
          disabled={disabled}
          accessibilityLabel={listening ? t('ai.voiceListening') : t('ai.voiceInput')}
          accessibilityRole="button"
          className={`rounded-lg items-center justify-center ${
            listening
              ? 'bg-red-500'
              : 'bg-gray-200 dark:bg-gray-600'
          }`}
          style={[
            { width: 44, height: 44 },
            disabled && { opacity: 0.5 },
          ]}
        >
          <Text
            className={`text-lg ${
              listening ? 'text-white' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {'\uD83C\uDF99\uFE0F'}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Send button */}
      <Pressable
        onPress={handleSubmit}
        disabled={disabled || !value.trim()}
        accessibilityLabel={t('ai.send')}
        accessibilityRole="button"
        className="rounded-lg bg-blue-500 items-center justify-center"
        style={[
          { width: 44, height: 44 },
          (disabled || !value.trim()) && { opacity: 0.5 },
        ]}
      >
        <Text className="text-white text-lg">{'\u2B06\uFE0F'}</Text>
      </Pressable>
    </View>
  );
}
