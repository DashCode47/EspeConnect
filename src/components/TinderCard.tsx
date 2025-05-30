import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent
} from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;

type TinderCardProps = {
  name: string;
  onSwipeOff?: () => void;
};

export default function TinderCard({ name, onSwipeOff }: TinderCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = event.translationX / 20;
    },
    onEnd: (event) => {
      const shouldSwipeOff = Math.abs(event.translationX) > SWIPE_THRESHOLD;

      if (shouldSwipeOff) {
        translateX.value = withSpring(event.translationX > 0 ? width : -width, {}, () => {
          if (onSwipeOff) runOnJS(onSwipeOff)();
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${rotate.value}deg` }
    ]
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text style={styles.name}>{name}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    position: 'absolute'
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold'
  }
});
