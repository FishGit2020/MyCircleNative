import { View, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthLayout() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: isDark ? '#111827' : '#ffffff' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
    </View>
  );
}
