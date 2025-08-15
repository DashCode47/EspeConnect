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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {globalStyles} from '../../config/globalStyles';

const {width, height} = Dimensions.get('window');

// Mock data for careers
const CAREERS = [
  {
    id: '1',
    name: 'Ingeniería Mecatrónica',
    description: 'Combina mecánica, electrónica e informática',
    backgroundImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: '2',
    name: 'Ingeniería en Software',
    description: 'Desarrollo de aplicaciones y sistemas informáticos',
    backgroundImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: '3',
    name: 'Biotecnología',
    description: 'Aplicación de tecnología en sistemas biológicos',
    backgroundImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: '4',
    name: 'Ingeniería Industrial',
    description: 'Optimización de procesos y sistemas productivos',
    backgroundImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
    gradient: ['#43e97b', '#38f9d7'],
  },
  {
    id: '5',
    name: 'Medicina',
    description: 'Ciencias de la salud y atención médica',
    backgroundImage: 'https://images.unsplash.com/photo-1576091160399-112f8f6a03b7?w=800',
    gradient: ['#fa709a', '#fee140'],
  },
  {
    id: '6',
    name: 'Psicología',
    description: 'Estudio del comportamiento y procesos mentales',
    backgroundImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
    gradient: ['#a8edea', '#fed6e3'],
  },
  {
    id: '7',
    name: 'Administración de Empresas',
    description: 'Gestión y dirección de organizaciones',
    backgroundImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    gradient: ['#ffecd2', '#fcb69f'],
  },
  {
    id: '8',
    name: 'Arquitectura',
    description: 'Diseño y construcción de espacios habitables',
    backgroundImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
    gradient: ['#ff9a9e', '#fecfef'],
  },
];

export default function CarreersScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [fadeAnimations] = useState(() =>
    CAREERS.map(() => new Animated.Value(0))
  );

  useFocusEffect(
    React.useCallback(() => {
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
    }, [fadeAnimations])
  );

  const handleCareerPress = (career: typeof CAREERS[0]) => {
    // Handle career selection
    console.log('Selected career:', career.name);
    navigation.navigate('CarreerDetails', { carreerId: career.id });
  };

  const renderCareerCard = (career: typeof CAREERS[0], index: number) => (
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
          source={{uri: career.backgroundImage}}
          style={styles.backgroundImage}
        />
        <LinearGradient
          colors={career.gradient}
          style={styles.gradientOverlay}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <View style={styles.cardContent}>
            <Text style={styles.careerName}>{career.name}</Text>
            <Text style={styles.careerDescription}>{career.description}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

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
        {CAREERS.map((career, index) => renderCareerCard(career, index))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#b8b8b8',
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
    shadowColor: '#000',
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
});
