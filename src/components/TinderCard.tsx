import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { User } from '../services/match.service';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;
const ROTATION_FACTOR = 15; // Maximum rotation in degrees

interface TinderCardProps {
  user: User;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isFirst?: boolean;
}

export default function TinderCard({ user, onSwipeLeft, onSwipeRight, isFirst = false }: TinderCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(isFirst)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const shouldSwipeOff = Math.abs(event.translationX) > SWIPE_THRESHOLD;

      if (shouldSwipeOff) {
        translateX.value = withSpring(
          event.translationX > 0 ? width * 1.5 : -width * 1.5,
          {},
          (finished) => {
            if (finished) {
              if (event.translationX > 0 && onSwipeRight) {
                runOnJS(onSwipeRight)();
              } else if (event.translationX <= 0 && onSwipeLeft) {
                runOnJS(onSwipeLeft)();
              }
            }
          }
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-ROTATION_FACTOR, 0, ROTATION_FACTOR],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` }
      ],
      opacity: isFirst ? 1 : 0.8,
      scale: isFirst ? 1 : 0.95,
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, width / 4],
      [0, 1],
      { extrapolateRight: 'clamp' }
    ),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-width / 4, 0],
      [1, 0],
      { extrapolateLeft: 'clamp' }
    ),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image
          source={{ uri: user.avatarUrl || 'https://via.placeholder.com/400' }}
          style={styles.image}
          resizeMode="cover"
        />
        
        <Animated.View style={[styles.overlayLabel, styles.likeLabel, likeStyle]}>
          <MaterialCommunityIcons name="heart" size={80} color="white" />
          <Text style={styles.overlayText}>LIKE</Text>
        </Animated.View>

        <Animated.View style={[styles.overlayLabel, styles.nopeLabel, nopeStyle]}>
          <MaterialCommunityIcons name="close" size={80} color="white" />
          <Text style={styles.overlayText}>NOPE</Text>
        </Animated.View>

        <View style={styles.content}>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.career}>{user.career}</Text>
          </View>

          {user.bio && (
            <Text style={styles.bio} numberOfLines={3}>
              {user.bio}
            </Text>
          )}

          {user.interests && user.interests.length > 0 && (
            <View style={styles.interests}>
              {user.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: height * 0.7,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    position: 'absolute',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '70%',
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  userInfo: {
    marginBottom: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  career: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  bio: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 12,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  interestText: {
    color: '#666',
    fontSize: 14,
  },
  overlayLabel: {
    position: 'absolute',
    top: '30%',
    padding: 10,
    alignItems: 'center',
    zIndex: 2,
  },
  likeLabel: {
    right: 40,
    transform: [{ rotate: '30deg' }],
  },
  nopeLabel: {
    left: 40,
    transform: [{ rotate: '-30deg' }],
  },
  overlayText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
