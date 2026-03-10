import React, { useState } from 'react';
import { TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTranslation } from '@mycircle/shared';

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped?: boolean;
  onFlip?: () => void;
  /** Card width; defaults to screen width minus 48 */
  width?: number;
  /** Card height; defaults to 240 */
  height?: number;
}

export default function FlipCard({
  front,
  back,
  flipped: controlledFlipped,
  onFlip,
  width,
  height = 240,
}: FlipCardProps) {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = width ?? screenWidth - 48;

  const [internalFlipped, setInternalFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const isControlled = controlledFlipped !== undefined;
  const isFlipped = isControlled ? controlledFlipped : internalFlipped;

  const handleFlip = () => {
    if (isControlled) {
      onFlip?.();
    } else {
      const next = !internalFlipped;
      setInternalFlipped(next);
      rotation.value = withTiming(next ? 180 : 0, { duration: 400 });
    }
  };

  // When controlled, drive animation from prop
  React.useEffect(() => {
    if (isControlled) {
      rotation.value = withTiming(controlledFlipped ? 180 : 0, { duration: 400 });
    }
  }, [controlledFlipped, isControlled, rotation]);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  return (
    <TouchableOpacity
      onPress={handleFlip}
      activeOpacity={0.9}
      accessibilityLabel={t('flashcards.tapToFlip')}
      accessibilityRole="button"
      style={{ width: cardWidth, height }}
    >
      {/* Front face */}
      <Animated.View
        style={[
          frontAnimatedStyle,
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
          },
        ]}
        className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 items-center justify-center p-6"
      >
        {front}
      </Animated.View>

      {/* Back face */}
      <Animated.View
        style={[
          backAnimatedStyle,
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
          },
        ]}
        className="rounded-2xl bg-blue-50 dark:bg-blue-900/30 shadow-lg border border-blue-200 dark:border-blue-700 items-center justify-center p-6"
      >
        {back}
      </Animated.View>
    </TouchableOpacity>
  );
}
