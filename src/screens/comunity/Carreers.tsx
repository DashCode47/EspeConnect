import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {globalStyles} from '../../config/globalStyles';
import {careerService, Career} from '../../services/career.service';

const {width, height} = Dimensions.get('window');

// Helper function to get gradient colors based on career name
const getCareerGradient = (careerName: string) => {
  const gradients = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a8edea', '#fed6e3'],
    ['#ffecd2', '#fcb69f'],
    ['#ff9a9e', '#fecfef'],
  ];
  
  const index = careerName.length % gradients.length;
  return gradients[index];
};

// Helper function to get background image based on career name
const getCareerBackgroundImage = (careerName: string) => {
  const images = [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
    'https://images.unsplash.com/photo-1576091160399-112f8f6a03b7?w=800',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
  ];
  
  const index = careerName.length % images.length;
  return images[index];
};

export default function CarreersScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnimations, setFadeAnimations] = useState<Animated.Value[]>([]);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching careers');
      const response = await careerService.getCareers({ isActive: true });
      console.log('Careers response:', response.data.careers);
      setCareers(response.data.careers);
      
      // Initialize animations for the fetched careers
      setFadeAnimations(response.data.careers.map(() => new Animated.Value(0)));
    } catch (err: any) {
      console.error('Error fetching careers:', err);
      setError(err.response?.data?.message || 'Error al cargar las carreras');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCareers();
    }, [])
  );

  useEffect(() => {
    if (fadeAnimations.length > 0) {
      // Scroll to top
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      
      // Reset animations to initial state
      fadeAnimations.forEach(anim => anim.setValue(0));
      
      // Animate cards with staggered delay
      const animations = fadeAnimations.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay: index * 150, // Stagger effect
          useNativeDriver: true,
        })
      );

      Animated.stagger(100, animations).start();
    }
  }, [fadeAnimations]);

  const handleCareerPress = (career: Career) => {
    console.log('Selected career:', career.name);
    navigation.navigate('CarreerDetails', { careerId: career.id });
  };

  const renderCareerCard = (career: Career, index: number) => {
    if (index >= fadeAnimations.length) return null;
    
    const gradient = getCareerGradient(career.name);
    const backgroundImage = getCareerBackgroundImage(career.name);
    
    return (
      <Animated.View
        key={career.id}
        style={[
          styles.careerCard,
          {
            opacity: fadeAnimations[index],
            transform: [
              {
                translateY: fadeAnimations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => handleCareerPress(career)}
          activeOpacity={0.2}>
          <Image
            source={{uri: backgroundImage}}
            style={styles.backgroundImage}
          />
          <LinearGradient
            colors={gradient}
            style={styles.gradientOverlay}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <View style={styles.cardContent}>
              <Text style={styles.careerName}>{career.name}</Text>
              <Text style={styles.careerDescription}>
                {career.modality} • {career.duration} semestres • {career.campus}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carreras</Text>
          <Text style={styles.headerSubtitle}>
            Explora las diferentes carreras disponibles
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Cargando carreras...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carreras</Text>
          <Text style={styles.headerSubtitle}>
            Explora las diferentes carreras disponibles
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCareers}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carreras</Text>
        <Text style={styles.headerSubtitle}>
          Explora las diferentes carreras disponibles
        </Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={{
          ...styles.scrollContent,
          paddingBottom: globalStyles.getBottomSafeArea(insets) + 20,
        }}
        showsVerticalScrollIndicator={false}>
        {careers.length > 0 ? (
          careers.map((career, index) => renderCareerCard(career, index))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay carreras disponibles</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  careerCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTouchable: {
    height: 200,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  careerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  careerDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#b8b8b8',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#b8b8b8',
    fontSize: 18,
    textAlign: 'center',
  },
});
