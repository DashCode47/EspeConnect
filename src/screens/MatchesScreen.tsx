import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { matchService, User } from '../services/match.service';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

export default function MatchesScreen() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  useEffect(() => {
    console.log('usersFET', users);
  }, [users]);

  const fetchPotentialMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchService.getPotentialMatches();
      if (response.status === 'success' && response.data.users) {
        setUsers(response.data.users);
        setCurrentIndex(0); // Reset index when new users are fetched
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

  const onSwipeComplete = async (direction: 'right' | 'left') => {
    console.log('onSwipeCompleteFET', users);
    // Get the current user directly from the users array using currentIndex
    const currentUser = users[currentIndex];

    if (!currentUser) {
      console.warn('No user found at current index:', currentIndex);
      return;
    }

    if (direction === 'right') {
      try {
        console.log('Attempting to like user with ID:', currentUser.id);
        const response = await matchService.likeUser(currentUser.id);
        const matchCheck = await matchService.checkMatch(currentUser.id);
        if (matchCheck.data.isMatch) {
          console.log("It's a match!");
        }
      } catch (err) {
        console.error('Error liking user:', err);
      }
    }

    // First update position
    position.setValue({ x: 0, y: 0 });

    // Then update the index
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      console.log('Moving to next index:', nextIndex);
      
      // If we're at the end of the list, fetch more matches
      if (nextIndex >= users.length) {
        console.log('Reached end of users, fetching more...');
        fetchPotentialMatches();
      }
      return nextIndex;
    });
  };

  const forceSwipe = (direction: 'right' | 'left') => {
    console.log('forceSwipeFET', users);
    // Get current user directly from users array
    const currentUser = users[currentIndex];

    if (!currentUser) {
      console.warn('No user found at current index:', currentIndex);
      return;
    }

    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true
    }).start(() => onSwipeComplete(direction));
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 4
    }).start();
  };

  const handleManualSwipe = (direction: 'right' | 'left') => {
    if (currentIndex >= users.length) {
      console.warn('No more users to swipe');
      return;
    }
    forceSwipe(direction);
  };

  const getCardStyle = (index: number) => {
    if (index === currentIndex) {
      const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
        outputRange: ['-30deg', '0deg', '30deg'],
        extrapolate: 'clamp'
      });

      const opacity = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
        outputRange: [0.5, 1, 0.5]
      });

      return {
        ...styles.card,
        zIndex: users.length - index,
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate }
        ],
        opacity
      };
    }

    // Calculate scale and translation based on position in stack
    const scale = Math.max(0.85, 0.95 - 0.05 * (index - currentIndex));
    const translateY = 10 * (index - currentIndex);

    return {
      ...styles.card,
      zIndex: users.length - index,
      transform: [
        { scale },
        { translateY }
      ],
      opacity: Math.max(0.5, 1 - 0.2 * (index - currentIndex))
    };
  };

  const renderCard = (user: User, index: number) => {
    if (index < currentIndex) return null;
    if (index > currentIndex + 3) return null;

    const isTopCard = index === currentIndex;
    
    // Add like/nope indicators for the top card
    const likeOpacity = position.x.interpolate({
      inputRange: [0, SCREEN_WIDTH * 0.25],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    const nopeOpacity = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 0.25, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View
        key={user.id}
        {...(isTopCard ? panResponder.panHandlers : {})}
        style={getCardStyle(index)}
      >
        {isTopCard && (
          <>
            <Animated.View style={[
              styles.choiceContainer, 
              styles.likeContainer,
              { opacity: likeOpacity }
            ]}>
              <Text style={[styles.choiceText, styles.likeText]}>LIKE</Text>
            </Animated.View>

            <Animated.View style={[
              styles.choiceContainer,
              styles.nopeContainer,
              { opacity: nopeOpacity }
            ]}>
              <Text style={[styles.choiceText, styles.nopeText]}>NOPE</Text>
            </Animated.View>
          </>
        )}
        <CardContent user={user} />
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      </View>
    );
  }

  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noMatchesText}>No more potential matches</Text>
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
          onPress={fetchPotentialMatches}
        >
          <Text style={[styles.refreshButtonText, { color: theme.colors.onPrimary }]}>
            Refresh Matches
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        {users.map((user, index) => renderCard(user, index)).reverse()}
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.nopeButton]}
          onPress={() => handleManualSwipe('left')}
        >
          <MaterialCommunityIcons name="close" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.likeButton]}
          onPress={() => handleManualSwipe('right')}
        >
          <MaterialCommunityIcons name="heart" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CardContent = ({ user }: { user: User }) => (
  <>
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: user.avatarUrl || undefined }}
        style={styles.avatar}
        resizeMode="cover"
      />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.career}>{user.career}</Text>
      {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      {user.interests && user.interests.length > 0 && (
        <View style={styles.interestsContainer}>
          <Text style={styles.interestsTitle}>Interests:</Text>
          <View style={styles.interestsTags}>
            {user.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 100, // Add space for buttons
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.65,
    top: 0,
    left: SCREEN_WIDTH * 0.05,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  imageContainer: {
    height: '60%',
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  career: {
    fontSize: 18,
    color: '#6200ee',
    marginBottom: 15,
  },
  bio: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
  },
  interestsContainer: {
    marginTop: 10,
  },
  interestsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  interestsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  interestText: {
    color: '#424242',
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  noMatchesText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 2,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nopeButton: {
    backgroundColor: '#FF3B30',
  },
  likeButton: {
    backgroundColor: '#4CD964',
  },
  choiceContainer: {
    position: 'absolute',
    top: 50,
    zIndex: 1000,
    padding: 10,
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  likeContainer: {
    right: 20,
    borderColor: '#4CD964',
    transform: [{ rotate: '15deg' }],
  },
  nopeContainer: {
    left: 20,
    borderColor: '#FF3B30',
    transform: [{ rotate: '-15deg' }],
  },
  choiceText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  likeText: {
    color: '#4CD964',
  },
  nopeText: {
    color: '#FF3B30',
  },
});
