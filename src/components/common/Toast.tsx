import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

const typeClasses = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-primary-500',
};

// Singleton toast state — components can call showToast() from anywhere
let _showToast: ((text: string, type?: ToastType) => void) | null = null;

export function showToast(text: string, type: ToastType = 'info') {
  _showToast?.(text, type);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    _showToast = addToast;
    return () => {
      _showToast = null;
    };
  }, [addToast]);

  return (
    <View className="flex-1">
      {children}
      <View className="absolute top-16 left-4 right-4 z-50 gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
        ))}
      </View>
    </View>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [translateY, opacity]);

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      <Pressable
        onPress={onDismiss}
        className={`${typeClasses[toast.type]} rounded-xl px-4 py-3 shadow-lg`}
      >
        <Text className="text-white font-medium text-center">{toast.text}</Text>
      </Pressable>
    </Animated.View>
  );
}
