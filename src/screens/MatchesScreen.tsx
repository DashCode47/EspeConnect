import React, {useState, useEffect} from 'react';
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
  Image,
} from 'react-native';
import {useTheme} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {matchService, User} from '../services/match.service';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.7;
const SWIPE_THRESHOLD = width * 0.3;

const getInterestIcon = (interest: string): string => {
  switch (interest.toLowerCase()) {
    case 'nature':
      return 'leaf';
    case 'travel':
      return 'airplane';
    case 'writing':
      return 'pencil';
    case 'music':
      return 'music-note';
    case 'dancing':
      return 'human-female-dance';
    case 'sports':
      return 'soccer';
    case 'movies':
      return 'movie';
    case 'art':
      return 'palette';
    case 'gaming':
      return 'gamepad-variant';
    case 'cooking':
      return 'chef-hat';
    default:
      return 'star';
  }
};

export default function MatchesScreen() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const detailsTranslateY = useSharedValue(CARD_HEIGHT);
  const nextCardScale = useSharedValue(0.95);
  const nextCardOpacity = useSharedValue(1);

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  useEffect(() => {
    if (!detailsVisible) {
      detailsTranslateY.value = withSpring(CARD_HEIGHT, {damping: 15});
    }
  }, [detailsVisible]);

  useEffect(() => {
    cardOpacity.value = 1;
    cardScale.value = 1;
    detailsTranslateY.value = withSpring(CARD_HEIGHT);
    setDetailsVisible(false);
  }, [currentIndex]);

  const fetchPotentialMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchService.getPotentialMatches();
      if (response.status === 'success' && response.data.users) {
        setUsers(response.data.users);
        setCurrentIndex(0);
      } else {
        setUsers([]);
        setError('Failed to fetch matches');
      }
    } catch (err) {
      setUsers([]);
      setError('Error connecting to the server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToNextCard = () => {
    if (currentIndex >= users.length - 1) {
      setUsers([]);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleLike = async (userId: string) => {
    goToNextCard();
    try {
      await matchService.likeUser(userId);
      const matchCheck = await matchService.checkMatch(userId);
      if (matchCheck.data.isMatch) {
        console.log("It's a match!");
      }
    } catch (err) {
      console.error('Error liking user:', err);
    }
  };

  const handleSkip = () => {
    goToNextCard();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={'#cc2b5e'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPotentialMatches}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <LinearGradient colors={['#1a001a', '#1a001a']} style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <View style={styles.cardPlaceholder}>
            <Text style={styles.noMatchesText}>No more potential matches</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a001a', '#1a001a']} style={styles.container}>
        <Image
          source={{uri: currentUser.avatarUrl || 'https://dummyimage.com/600x400/000/fff'}}
          style={styles.image}
        />
        <LinearGradient
          colors={[
            'rgba(52, 0, 84, 0)',
            'rgba(52, 0, 84, 0.5)',
            'rgba(52, 0, 84, 0.5)',
            'rgba(52, 0, 84, 0)',
          ]}
          locations={[0, 0.2, 0.8, 1]}
          style={styles.overlay}>
          <Text style={styles.match}>80% Match</Text>
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.location}>{currentUser.career}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buttonX} onPress={handleSkip}>
              <Text style={styles.buttonText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonHeart}
              onPress={() => handleLike(currentUser.id)}>
              <Text style={styles.buttonText}>❤</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutText}>
            {currentUser.bio || 'No bio available.'}
          </Text>

          <View style={styles.interests}>
            {currentUser.interests.map((interest, index) => (
              <Text key={index} style={styles.interestTag}>
                {interest}
              </Text>
            ))}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    height: '60%',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 80,
    height: '60%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
  },
  match: {
    backgroundColor: '#8a2be2',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
  },
  name: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  location: {
    color: 'white',
    fontSize: 14,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 30,
  },
  buttonX: {
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonHeart: {
    backgroundColor: '#f28bce',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 26,
  },
  aboutSection: {
    backgroundColor: 'white',
    padding: 20,
    height: '40%',
    marginTop:'auto',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  aboutTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 16,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#e6f0e6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    color: '#4b4b4b',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a001a',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8a2be2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPlaceholder: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  noMatchesText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
