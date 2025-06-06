import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { matchService, User } from '../services/match.service';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.6;
const SWIPE_THRESHOLD = width * 0.3;

export default function MatchesScreen() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animated values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const nextCardScale = useSharedValue(0.95);
  const nextCardOpacity = useSharedValue(0.5);

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const fetchPotentialMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchService.getPotentialMatches();
      if (response.status === 'success' && response.data.users) {
        setUsers(response.data.users);
      } else {
        setError('Failed to fetch matches');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetCardPosition = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotation.value = withSpring(0);
    scale.value = withSpring(1);
  };

  const handleLike = async (userId: string) => {
    try {
      const response = await matchService.likeUser(userId);
      const matchCheck = await matchService.checkMatch(userId);
      if (matchCheck.data.isMatch) {
        console.log("It's a match!");
      }
    } catch (err) {
      console.error('Error liking user:', err);
    }
    setCurrentIndex(prev => prev + 1);
    resetCardPosition();
    if (currentIndex >= users.length - 2) {
      fetchPotentialMatches();
    }
  };

  const handleSkip = () => {
    setCurrentIndex(prev => prev + 1);
    resetCardPosition();
    if (currentIndex >= users.length - 2) {
      fetchPotentialMatches();
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
      rotation.value = interpolate(
        translateX.value,
        [-width / 2, 0, width / 2],
        [-15, 0, 15],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      const shouldSwipe = Math.abs(translateX.value) > SWIPE_THRESHOLD;
      
      if (shouldSwipe) {
        translateX.value = withSpring(
          Math.sign(translateX.value) * width * 1.5,
          { velocity: event.velocityX }
        );
        translateY.value = withSpring(
          Math.sign(translateY.value) * height,
          { velocity: event.velocityY }
        );
        if (translateX.value > 0) {
          runOnJS(handleLike)(users[currentIndex].id);
        } else {
          runOnJS(handleSkip)();
        }
      } else {
        resetCardPosition();
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: nextCardScale.value }],
      opacity: nextCardOpacity.value,
    };
  });

  const renderCard = (user: User, isNext = false) => {
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          isNext ? nextCardStyle : cardStyle,
        ]}>
        <ImageBackground
          source={{ uri: user.avatarUrl || 'https://via.placeholder.com/400' }}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}>
          <View style={styles.gradientOverlay} />
          <View style={styles.cardContent}>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.career}>{user.career}</Text>
            </View>

            {user.bio && (
              <View style={styles.bioContainer}>
                <Text style={styles.bio} numberOfLines={3}>
                  {user.bio}
                </Text>
              </View>
            )}

            {user.interests && (
              <View style={styles.interests}>
                {user.interests.slice(0, 4).map((interest, i) => (
                  <View key={i} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ImageBackground>
      </Animated.View>
    );
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error && users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={fetchPotentialMatches}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons
          name="cards-heart"
          size={64}
          color={theme.colors.primary}
        />
        <Text style={styles.noMatchesText}>No more potential matches</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={fetchPotentialMatches}>
          <Text style={styles.retryButtonText}>Find More Matches</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>
          {users.length - currentIndex} potential matches
        </Text>
      </View>

      <View style={styles.cardWrapper}>
        {currentIndex + 1 < users.length && renderCard(users[currentIndex + 1], true)}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={styles.cardWrapper}>
            {renderCard(users[currentIndex])}
          </Animated.View>
        </PanGestureHandler>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={handleSkip}>
          <MaterialCommunityIcons name="close" size={30} color="#FF3B30" />
          <Text style={[styles.buttonText, styles.skipButtonText]}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.likeButton]}
          onPress={() => handleLike(users[currentIndex].id)}>
          <MaterialCommunityIcons name="heart" size={30} color="#4CD964" />
          <Text style={[styles.buttonText, styles.likeButtonText]}>Like</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'absolute',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    borderRadius: 16,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardContent: {
    padding: 16,
  },
  userInfo: {
    marginBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  career: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  bioContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  interestText: {
    color: 'white',
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.1)',
  },
  skipButtonText: {
    color: '#FF3B30',
  },
  likeButton: {
    borderColor: '#4CD964',
    backgroundColor: 'rgba(76,217,100,0.1)',
  },
  likeButtonText: {
    color: '#4CD964',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  noMatchesText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
