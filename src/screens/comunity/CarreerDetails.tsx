import React, {useEffect, useState} from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {globalStyles} from '../../config/globalStyles';

const {width, height} = Dimensions.get('window');

// Mock data for career details
const CAREER_DATA = {
  id: '1',
  name: 'Ingeniería en Software',
  description: 'La Ingeniería en Software es una disciplina que se enfoca en el desarrollo, mantenimiento y evolución de sistemas informáticos. Combina principios de ingeniería con metodologías de desarrollo de software para crear soluciones tecnológicas innovadoras.',
  longDescription: 'Esta carrera prepara a los estudiantes para diseñar, desarrollar, implementar y mantener sistemas de software de alta calidad. Los egresados están capacitados para trabajar en empresas tecnológicas, startups, consultorías y organizaciones de diversos sectores.',
  students: 1247,
  duration: '4 años',
  credits: 240,
  faculty: 'Facultad de Ingeniería',
  campus: 'Campus ESPE',
  careerIcon: 'laptop',
  backgroundImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
  gradient: ['#f093fb', '#f5576c'],
  subjects: [
    'Programación Avanzada',
    'Bases de Datos',
    'Arquitectura de Software',
    'Inteligencia Artificial',
    'Desarrollo Web',
    'Aplicaciones Móviles',
  ],
  skills: [
    'Desarrollo Full-Stack',
    'Machine Learning',
    'DevOps',
    'Cloud Computing',
    'Agile Methodologies',
    'UI/UX Design',
  ],
  careerOpportunities: [
    'Desarrollador de Software',
    'Arquitecto de Software',
    'Ingeniero DevOps',
    'Data Scientist',
    'Product Manager',
    'Consultor Tecnológico',
  ],
  averageSalary: '$3,500 - $8,000',
  employmentRate: '95%',
};

export default function CarreerDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [headerOpacity] = useState(new Animated.Value(0));
  const [contentOpacity] = useState(new Animated.Value(0));
  const [contentTranslateY] = useState(new Animated.Value(50));

  useEffect(() => {
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
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <Animated.View style={[styles.header, {opacity: headerOpacity}]}>
        <Image
          source={{uri: CAREER_DATA.backgroundImage}}
          style={styles.headerBackground}
        />
        <LinearGradient
          colors={CAREER_DATA.gradient}
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
                name={CAREER_DATA.careerIcon as any}
                size={48}
                color="white"
              />
            </View>
            <Text style={styles.careerName}>{CAREER_DATA.name}</Text>
            <Text style={styles.careerFaculty}>{CAREER_DATA.faculty}</Text>
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
          {/* Description */}
          <Animated.View
            style={[
              styles.descriptionContainer,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <Text style={styles.description}>{CAREER_DATA.description}</Text>
          </Animated.View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {renderInfoCard(
              'Estudiantes',
              CAREER_DATA.students.toLocaleString(),
              'account-group',
              '#667eea'
            )}
            {renderInfoCard(
              'Duración',
              CAREER_DATA.duration,
              'clock-outline',
              '#f093fb'
            )}
            {renderInfoCard(
              'Créditos',
              CAREER_DATA.credits.toString(),
              'school',
              '#4facfe'
            )}
          </View>

          {/* Career Opportunities */}
          {renderSection(
            'Oportunidades Laborales',
            CAREER_DATA.careerOpportunities,
            'briefcase'
          )}

          {/* Skills */}
          {renderSection('Habilidades', CAREER_DATA.skills, 'lightbulb')}

          {/* Subjects */}
          {renderSection('Materias Principales', CAREER_DATA.subjects, 'book-open')}

          {/* Salary and Employment */}
          <Animated.View
            style={[
              styles.salaryContainer,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <View style={styles.salaryCard}>
              <MaterialCommunityIcons name="cash" size={32} color="#43e97b" />
              <Text style={styles.salaryTitle}>Salario Promedio</Text>
              <Text style={styles.salaryValue}>{CAREER_DATA.averageSalary}</Text>
            </View>
            <View style={styles.employmentCard}>
              <MaterialCommunityIcons name="chart-line" size={32} color="#fa709a" />
              <Text style={styles.employmentTitle}>Tasa de Empleo</Text>
              <Text style={styles.employmentValue}>{CAREER_DATA.employmentRate}</Text>
            </View>
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
});