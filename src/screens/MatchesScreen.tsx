import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Image } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { matchService, User } from '../services/match.service';

export default function MatchesScreen() {
  const [index, setIndex] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const fetchPotentialMatches = async () => {
    try {
      const response = await matchService.getPotentialMatches();
      console.log('response', response);
      if (response.status === 'success') {
        setUsers(response.data.users);
      } else {
        setError('Failed to fetch matches');
      }
    } catch (err) {
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const onSwipedLeft = async (index: number) => {
    try {
      const user = users[index];
      await matchService.dislikeUser(user.id);
      console.log('Disliked user:', user.name);
    } catch (err) {
      console.error('Error disliking user:', err);
    }
  };

  const onSwipedRight = async (index: number) => {
    try {
      const user = users[index];
      const response = await matchService.likeUser(user.id);
      console.log('Liked user:', user.name);
      
      // You could show a match notification here if the response indicates a mutual match
      if (response.message?.includes('match')) {
        // TODO: Show match notification
        console.log('It\'s a match!');
      }
    } catch (err) {
      console.error('Error liking user:', err);
    }
  };

  const renderCard = (user: User) => {
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={ { uri: user.avatarUrl || undefined } }
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
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noMatchesText}>No potential matches found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        cards={users}
        renderCard={renderCard}
        onSwipedLeft={onSwipedLeft}
        onSwipedRight={onSwipedRight}
        cardIndex={index}
        backgroundColor={'#F5F5F5'}
        stackSize={3}
        stackSeparation={15}
        overlayLabels={{
          left: {
            title: 'NOPE',
            style: {
              label: {
                backgroundColor: '#FF0000',
                color: '#FFFFFF',
                fontSize: 24,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: -30,
              },
            },
          },
          right: {
            title: 'LIKE',
            style: {
              label: {
                backgroundColor: '#4CAF50',
                color: '#FFFFFF',
                fontSize: 24,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: 30,
              },
            },
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  card: {
    height: Dimensions.get('window').height * 0.7,
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
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
  },
  noMatchesText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
}); 