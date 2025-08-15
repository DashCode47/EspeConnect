import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');

export default function CurriculumTree() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [headerOpacity] = useState(new Animated.Value(0));
  const [contentOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate header
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animate content with delay
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const curriculumData = [
    {
      semester: 1,
      color: '#4FC3F7', // 🔵 Blue
      subjects: [
        'Cálculo Diferencial e Integral',
        'Álgebra Lineal',
        'Química I',
        'Fundamentos de Programación',
        'Metodología de la Investigación Científica'
      ]
    },
    {
      semester: 2,
      color: '#4FC3F7', // 🔵 Blue
      subjects: [
        'Cálculo Vectorial',
        'Física I',
        'Ecuaciones Diferenciales Ordinarias',
        'Fundamentos de Circuitos Eléctricos'
      ]
    },
    {
      semester: 3,
      color: '#4CAF50', // 🟢 Green
      subjects: [
        'Estadística',
        'Electrónica Fundamental',
        'Métodos Numéricos',
        'Matemática Superior'
      ]
    },
    {
      semester: 4,
      color: '#4CAF50', // 🟢 Green
      subjects: [
        'Dibujo Mecánico Asistido por Computador',
        'Sistemas Digitales',
        'Mecatrónica Básica',
        'Ciencias de los Materiales',
        'Estática',
        'Máquinas Eléctricas'
      ]
    },
    {
      semester: 5,
      color: '#FFC107', // 🟡 Yellow
      subjects: [
        'Dinámica',
        'Instrumentación Aplicada a Mecatrónica',
        'Mecánica de Materiales',
        'Sistemas Embebidos MCT',
        'Electrónica de Potencia',
        'Termofluidos'
      ]
    },
    {
      semester: 6,
      color: '#FFC107', // 🟡 Yellow
      subjects: [
        'Sistemas de Control Automático',
        'Mandos Oleoneumáticos',
        'Mecanismos',
        'Sistemas Ciberfísicos',
        'Tecnología Mecánica',
        'Termofluidos Aplicados'
      ]
    },
    {
      semester: 7,
      color: '#FF9800', // 🟠 Orange
      subjects: [
        'Diseño de Elementos de Máquinas',
        'Manufactura Asistida',
        'Realidad Nacional y Geopolítica',
        'Control Industrial',
        'Control Discreto',
        'Ingeniería Asistida'
      ]
    },
    {
      semester: 8,
      color: '#FF9800', // 🟠 Orange
      subjects: [
        'Producción y Control de Calidad',
        'Automatización Mecatrónica',
        'Ingeniería en Mantenimiento',
        'PLCs y Redes',
        'Gestión y Emprendimiento',
        'Diseño Mecatrónico'
      ]
    },
    {
      semester: 9,
      color: '#F44336', // 🔴 Red
      subjects: [
        'MIC-PI Profesionalizante',
        'Prácticas de Servicio Comunitario',
        'Prácticas Laborales'
      ]
    }
  ];

  const getDependencyInfo = (semester: number) => {
    const semesterData = curriculumData[semester - 1];
    if (semester === 1) return 'Semestre base - sin dependencias';
    if (semester === 9) return 'Requiere completar todos los semestres anteriores';
    
    const prevSemester = curriculumData[semester - 2];
    if (prevSemester.color === semesterData.color) {
      return `Depende del semestre ${semester - 1} (${prevSemester.subjects.length} materias)`;
    }
    return 'Sin dependencias directas del semestre anterior';
  };

  const handleSemesterPress = (semester: number) => {
    if (selectedSemester === semester) {
      setSelectedSemester(null);
      setZoomLevel(1);
    } else {
      setSelectedSemester(semester);
      setZoomLevel(1.2);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setSelectedSemester(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6d4aff" />
      
      {/* Header */}
      <Animated.View style={[styles.header, {opacity: headerOpacity}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="sitemap" size={32} color="white" />
          <Text style={styles.headerTitle}>Plan de Estudios</Text>
          <Text style={styles.headerSubtitle}>Mecatrónica ESPE - Dependencias</Text>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}>
        <Animated.View style={[styles.content, {opacity: contentOpacity}]}>
          {/* Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
              <MaterialCommunityIcons name="magnify-minus" size={20} color="#6d4aff" />
            </TouchableOpacity>
            <Text style={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</Text>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
              <MaterialCommunityIcons name="magnify-plus" size={20} color="#6d4aff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleResetZoom}>
              <MaterialCommunityIcons name="refresh" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Leyenda de Dependencias:</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4FC3F7' }]} />
                <Text style={styles.legendText}>🔵 Semestres 1-2 vinculados</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>🟢 Semestres 3-4 vinculados</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
                <Text style={styles.legendText}>🟡 Semestres 5-6 vinculados</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>🟠 Semestres 7-8 vinculados</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>🔴 Semestre final</Text>
              </View>
            </View>
          </View>

          {/* Tree Diagram */}
          <View style={styles.treeContainer}>
            {curriculumData.map((semesterData, index) => (
              <View key={semesterData.semester} style={styles.semesterRow}>
                {/* Semester Header */}
                <TouchableOpacity
                  style={[
                    styles.semesterHeader,
                    { backgroundColor: semesterData.color },
                    selectedSemester === semesterData.semester && styles.selectedSemester
                  ]}
                  onPress={() => handleSemesterPress(semesterData.semester)}
                >
                  <Text style={styles.semesterNumber}>{semesterData.semester}°</Text>
                  <Text style={styles.semesterLabel}>Semestre</Text>
                </TouchableOpacity>

                {/* Subjects */}
                <View style={styles.subjectsContainer}>
                  {semesterData.subjects.map((subject, subjectIndex) => (
                    <View key={subjectIndex} style={styles.subjectItem}>
                      <View style={[styles.subjectDot, { backgroundColor: semesterData.color }]} />
                      <Text style={styles.subjectText}>{subject}</Text>
                    </View>
                  ))}
                </View>

                {/* Dependency Info */}
                {selectedSemester === semesterData.semester && (
                  <View style={styles.dependencyInfo}>
                    <MaterialCommunityIcons name="information" size={16} color="#6d4aff" />
                    <Text style={styles.dependencyInfoText}>
                      {getDependencyInfo(semesterData.semester)}
                    </Text>
                  </View>
                )}

                {/* Connection Line to Next Semester */}
                {index < curriculumData.length - 1 && (
                  <View style={styles.connectionLine}>
                    <View style={[
                      styles.connectionDot,
                      { backgroundColor: semesterData.color === curriculumData[index + 1].color 
                        ? semesterData.color 
                        : '#ddd'
                      }
                    ]} />
                    <View style={[
                      styles.connectionLineVertical,
                      { backgroundColor: semesterData.color === curriculumData[index + 1].color 
                        ? semesterData.color 
                        : '#ddd'
                      }
                    ]} />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>📚 Cómo funcionan las dependencias:</Text>
            <Text style={styles.instructionsText}>
              • Los semestres del mismo color están vinculados{'\n'}
              • Si repruebas una materia de un color, no puedes tomar materias del mismo color en el siguiente semestre{'\n'}
              • Toca un semestre para ver más detalles{'\n'}
              • Usa los controles de zoom para explorar el plan de estudios{'\n'}
              • El semestre 9 requiere completar todos los semestres anteriores
            </Text>
          </View>

          {/* Career Info */}
          <View style={styles.careerInfoContainer}>
            <Text style={styles.careerInfoTitle}>🎯 Información de la Carrera</Text>
            <View style={styles.careerInfoGrid}>
              <View style={styles.careerInfoItem}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#6d4aff" />
                <Text style={styles.careerInfoLabel}>Duración</Text>
                <Text style={styles.careerInfoValue}>9 Semestres</Text>
              </View>
              <View style={styles.careerInfoItem}>
                <MaterialCommunityIcons name="school" size={24} color="#6d4aff" />
                <Text style={styles.careerInfoLabel}>Créditos</Text>
                <Text style={styles.careerInfoValue}>240+</Text>
              </View>
              <View style={styles.careerInfoItem}>
                <MaterialCommunityIcons name="account-group" size={24} color="#6d4aff" />
                <Text style={styles.careerInfoLabel}>Facultad</Text>
                <Text style={styles.careerInfoValue}>Ingeniería</Text>
              </View>
              <View style={styles.careerInfoItem}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#6d4aff" />
                <Text style={styles.careerInfoLabel}>Campus</Text>
                <Text style={styles.careerInfoValue}>ESPE</Text>
              </View>
            </View>
          </View>
        </Animated.View>
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
    backgroundColor: '#6d4aff',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  zoomLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6d4aff',
  },
  resetButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  legendContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  legendItems: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  legendText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  treeContainer: {
    marginBottom: 20,
  },
  semesterRow: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  semesterHeader: {
    width: 140,
    height: 90,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedSemester: {
    borderWidth: 4,
    borderColor: '#6d4aff',
    transform: [{ scale: 1.05 }],
  },
  semesterNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  semesterLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  subjectsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 300,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  subjectText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  dependencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#6d4aff',
  },
  dependencyInfoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  connectionLine: {
    position: 'absolute',
    bottom: -15,
    alignItems: 'center',
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 5,
  },
  connectionLineVertical: {
    width: 2,
    height: 20,
  },
  instructionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    textAlign: 'justify',
  },
  careerInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  careerInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  careerInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  careerInfoItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  careerInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  careerInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});
