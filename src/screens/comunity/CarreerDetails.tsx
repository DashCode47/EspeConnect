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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute, useNavigation} from '@react-navigation/native';
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

// Helper function to get career icon based on career name
const getCareerIcon = (careerName: string) => {
  const icons = [
    'laptop',
    'robot',
    'flask',
    'factory',
    'heart-pulse',
    'brain',
    'briefcase',
    'home-city',
  ];
  
  const index = careerName.length % icons.length;
  return icons[index];
};

interface RouteParams {
  careerId: string;
}

export default function CarreerDetails() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headerOpacity] = useState(new Animated.Value(0));
  const [contentOpacity] = useState(new Animated.Value(0));
  const [contentTranslateY] = useState(new Animated.Value(50));

  const {careerId} = route.params;

  const fetchCareer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await careerService.getCareer(careerId);
      console.log('Career response:', response.data.career);
      setCareer(response.data.career);
    } catch (err: any) {
      console.error('Error fetching career:', err);
      setError(err.response?.data?.message || 'Error al cargar la carrera');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareer();
  }, [careerId]);

  useEffect(() => {
    if (career) {
      // Animate header
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Animate content with delay
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [career]);

  const renderInfoCard = (title: string, value: string, icon: string, color: string) => (
    <Animated.View
      style={[
        styles.infoCard,
        {
          opacity: contentOpacity,
          transform: [{translateY: contentTranslateY}],
        },
      ]}>
      <View style={[styles.infoIcon, {backgroundColor: color}]}>
        <MaterialCommunityIcons name={icon as any} size={24} color="white" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoValue}>{value}</Text>
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
    </Animated.View>
  );

  const renderSection = (title: string, items: string[], icon: string) => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: contentOpacity,
          transform: [{translateY: contentTranslateY}],
        },
      ]}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon as any} size={24} color="#6d4aff" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.itemDot} />
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Cargando carrera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !career) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Carrera no encontrada'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCareer}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const gradient = getCareerGradient(career.name);
  const backgroundImage = getCareerBackgroundImage(career.name);
  const careerIcon = getCareerIcon(career.name);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <Animated.View style={[styles.header, {opacity: headerOpacity}]}>
        <Image
          source={{uri: backgroundImage}}
          style={styles.headerBackground}
        />
        <LinearGradient
          colors={gradient}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.careerIconContainer}>
              <MaterialCommunityIcons
                name={careerIcon as any}
                size={48}
                color="white"
              />
            </View>
            <Text style={styles.careerName}>{career.name}</Text>
            <Text style={styles.careerFaculty}>{career.campus}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: globalStyles.getBottomSafeArea(insets) + 20,
        }}>
        <View style={styles.content}>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {renderInfoCard(
              'Duración',
              `${career.duration} semestres`,
              'clock-outline',
              '#f093fb'
            )}
            {renderInfoCard(
              'Modalidad',
              career.modality,
              'account-group',
              '#667eea'
            )}
            {renderInfoCard(
              'Horario',
              career.schedule,
              'school',
              '#4facfe'
            )}
          </View>

          {/* Mission & Vision */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="target" size={24} color="#6d4aff" />
              <Text style={styles.sectionTitle}>Misión y Visión</Text>
            </View>
            <View style={styles.missionVisionContainer}>
              <View style={styles.missionVisionItem}>
                <Text style={styles.missionVisionTitle}>Misión</Text>
                <Text style={styles.missionVisionText}>{career.mission}</Text>
              </View>
              <View style={styles.missionVisionItem}>
                <Text style={styles.missionVisionTitle}>Visión</Text>
                <Text style={styles.missionVisionText}>{career.vision}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Objectives */}
          {renderSection('Objetivos', career.objectives, 'flag-checkered')}

          {/* Graduate Profile */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-graduate" size={24} color="#6d4aff" />
              <Text style={styles.sectionTitle}>Perfil del Egresado</Text>
            </View>
            <Text style={styles.profileText}>{career.graduateProfile}</Text>
          </Animated.View>

          {/* Professional Profile */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="briefcase" size={24} color="#6d4aff" />
              <Text style={styles.sectionTitle}>Perfil Profesional</Text>
            </View>
            <Text style={styles.profileText}>{career.professionalProfile}</Text>
          </Animated.View>

          {/* Subjects */}
          {renderSection('Materias Principales', career.subjects, 'book-open')}

          {/* Accreditations */}
          {career.accreditations.length > 0 && (
            renderSection('Acreditaciones', career.accreditations, 'certificate')
          )}

          {/* Director Info */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-tie" size={24} color="#6d4aff" />
              <Text style={styles.sectionTitle}>Director de Carrera</Text>
            </View>
            <View style={styles.directorInfo}>
              <Text style={styles.directorName}>{career.directorName}</Text>
              <Text style={styles.directorEmail}>{career.directorEmail}</Text>
            </View>
          </Animated.View>

          {/* Curriculum Tree Button */}
          <Animated.View
            style={[
              styles.curriculumContainer,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <View style={styles.curriculumHeader}>
              <MaterialCommunityIcons name="sitemap" size={24} color="#6d4aff" />
              <Text style={styles.curriculumTitle}>Plan de Estudios</Text>
              <Text style={styles.curriculumSubtitle}>Dependencias entre materias</Text>
            </View>
            <TouchableOpacity
              style={styles.curriculumButton}
              onPress={() => navigation.navigate('CurriculumTree' as never)}>
              <View style={styles.curriculumButtonContent}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
                <Text style={styles.curriculumButtonText}>Ver Plan de Estudios Completo</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Wisdom Capsules Button */}
          <Animated.View
            style={[
              styles.wisdomContainer,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <View style={styles.wisdomHeader}>
              <MaterialCommunityIcons name="lightbulb-on" size={24} color="#ff6b6b" />
              <Text style={styles.wisdomTitle}>Cápsulas de Sabiduría</Text>
              <Text style={styles.wisdomSubtitle}>Consejos de supervivencia estudiantil</Text>
            </View>
            <TouchableOpacity
              style={styles.wisdomButton}
              onPress={() => navigation.navigate('WisdomCapsules' as never)}>
              <View style={styles.wisdomButtonContent}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
                <Text style={styles.wisdomButtonText}>Ver Consejos de Supervivencia</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Professor Radar Button */}
          <Animated.View
            style={[
              styles.professorRadarContainer,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <View style={styles.professorRadarHeader}>
              <MaterialCommunityIcons name="radar" size={24} color="#4ecdc4" />
              <Text style={styles.professorRadarTitle}>Radar de Profesores</Text>
              <Text style={styles.professorRadarSubtitle}>Reseñas académicas con respeto</Text>
            </View>
            <TouchableOpacity
              style={styles.professorRadarButton}
              onPress={() => navigation.navigate('ProfessorRadar' as never)}>
              <View style={styles.professorRadarButtonContent}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
                <Text style={styles.professorRadarButtonText}>Ver Evaluaciones de Profesores</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 280,
    position: 'relative',
  },
  headerBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerGradient: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  careerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  careerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  careerFaculty: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  descriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoContent: {
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  itemsContainer: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6d4aff',
    marginRight: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  salaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  salaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employmentCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salaryTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  salaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  employmentTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  employmentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  curriculumContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  curriculumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  curriculumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  curriculumSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },

  curriculumButton: {
    backgroundColor: '#6d4aff',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  curriculumButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  curriculumButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  wisdomContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wisdomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  wisdomTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  wisdomSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  wisdomButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  wisdomButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wisdomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  professorRadarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  professorRadarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  professorRadarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  professorRadarSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  professorRadarButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  professorRadarButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  professorRadarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6d4aff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  missionVisionContainer: {
    gap: 12,
  },
  missionVisionItem: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6d4aff',
  },
  missionVisionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  missionVisionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  profileText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginTop: 10,
  },
  directorInfo: {
    marginTop: 15,
  },
  directorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  directorEmail: {
    fontSize: 14,
    color: '#666',
  },
});