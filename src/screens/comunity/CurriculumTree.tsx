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
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [collapsedSemesters, setCollapsedSemesters] = useState<Set<number>>(new Set());
  const [headerOpacity] = useState(new Animated.Value(0));
  const [contentOpacity] = useState(new Animated.Value(0));
  const [dependencyLines] = useState(new Animated.Value(0));

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

    // Animate dependency lines
    Animated.timing(dependencyLines, {
      toValue: 1,
      duration: 1000,
      delay: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const curriculumData = [
    {
      semester: 1,
      color: '#E3F2FD', // Azul muy claro
      subjects: [
        { name: 'Matemática Básica', ht: 4, hpe: 4, ha: 0, hts: 8, dependency: null, id: '1.1' },
        { name: 'Humanística', ht: 2, hpe: 0, ha: 4, hts: 6, dependency: null, id: '1.2' },
        { name: 'Geometría Lineal', ht: 4, hpe: 4, ha: 0, hts: 8, dependency: null, id: '1.3' },
        { name: 'Cálculo en una Variable', ht: 4, hpe: 4, ha: 0, hts: 8, dependency: null, id: '1.4' },
        { name: 'Física Básica', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, id: '1.5' },
        { name: 'Dibujo Asistido por Computadora', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, id: '1.6' },
        { name: 'Fundamentos de Programación', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#FF9800', id: '1.7' }
      ]
    },
    {
      semester: 2,
      color: '#BBDEFB', // Azul claro
      subjects: [
        { name: 'Cálculo en Varias Variables', ht: 4, hpe: 4, ha: 0, hts: 8, dependency: null, specialColor: '#81C784', id: '2.1' },
        { name: 'Lenguaje y Comunicación', ht: 2, hpe: 0, ha: 4, hts: 6, dependency: null, specialColor: '#8BC34A', id: '2.2' },
        { name: 'Ecuaciones Diferenciales Ordinarias', ht: 4, hpe: 4, ha: 0, hts: 8, dependency: null, specialColor: '#81C784', id: '2.3' },
        { name: 'Estática', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#F44336', id: '2.4' },
        { name: 'Fundamentos de Circuitos Eléctricos', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#9C27B0', id: '2.5' },
        { name: 'Física para Ingenieros', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#4CAF50', id: '2.6' },
        { name: 'Programación Avanzada', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '1.7', specialColor: '#FF9800', id: '2.7' },
        { name: 'Fundamentos de Química para Ingenieros', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, id: '2.8' }
      ]
    },
    {
      semester: 3,
      color: '#90CAF9', // Azul medio
      subjects: [
        { name: 'Señales y Sistemas', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '2.3', specialColor: '#81C784', id: '3.1' },
        { name: 'Dinámica', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#1565C0', id: '3.2' },
        { name: 'Metrología', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#FFC107', id: '3.3' },
        { name: 'Métodos Numéricos para Computadora', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#1565C0', id: '3.4' },
        { name: 'Estructura de Datos', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, id: '3.5' },
        { name: 'Análisis de Circuitos Eléctricos', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '2.5', specialColor: '#9C27B0', id: '3.6' },
        { name: 'Termodinámica', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '2.6', specialColor: '#4CAF50', id: '3.7' },
        { name: 'Fundamentos de Electrónica Analógica', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '3.6', specialColor: '#9C27B0', id: '3.8' }
      ]
    },
    {
      semester: 4,
      color: '#64B5F6', // Azul
      subjects: [
        { name: 'Lógica y Circuitos Digitales', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#C8E6C9', id: '4.1' },
        { name: 'Resistencia de Materiales', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '2.4', specialColor: '#F44336', id: '4.2' },
        { name: 'Procesos de Fabricación', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#E91E63', id: '4.3' },
        { name: 'Termofluídos', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '3.7', specialColor: '#4CAF50', id: '4.4' },
        { name: 'Electrónica de Potencia', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '3.8', specialColor: '#9C27B0', id: '4.5' },
        { name: 'Teoría de Control I', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '3.1', specialColor: '#FF9800', id: '4.6' },
        { name: 'Fundamentos de Control de Procesos', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#2E7D32', id: '4.7' },
        { name: 'Circuitos Electrónicos I', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '3.8', specialColor: '#9C27B0', id: '4.8' }
      ]
    },
    {
      semester: 5,
      color: '#42A5F5', // Azul más intenso
      subjects: [
        { name: 'Vibraciones Mecánicas', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '4.2', specialColor: '#F44336', id: '5.1' },
        { name: 'Modelado y Simulación Mecatrónica', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '4.4', specialColor: '#4CAF50', id: '5.2' },
        { name: 'Sistemas Mecánicos', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#9E9E9E', id: '5.3' },
        { name: 'Instrumentación y Sensores', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '3.3', specialColor: '#FFC107', id: '5.4' },
        { name: 'Circuitos Electrónicos II', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '4.8', specialColor: '#9C27B0', id: '5.5' },
        { name: 'Introducción a los sistemas Microcontroladores', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#424242', id: '5.6' },
        { name: 'Robótica', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#00BCD4', id: '5.7' },
        { name: 'Teoría de Control II', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '4.6', specialColor: '#FF9800', id: '5.8' }
      ]
    },
    {
      semester: 6,
      color: '#2196F3', // Azul principal
      subjects: [
        { name: 'Sistemas Mecatrónicos I', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '5.3', specialColor: '#9E9E9E', id: '6.1' },
        { name: 'Diseño de Máquinas', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '4.3', specialColor: '#E91E63', id: '6.2' },
        { name: 'Control Digital', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '5.8', specialColor: '#FF9800', id: '6.3' },
        { name: 'Sistemas de Actuación por Computador', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '4.7', specialColor: '#2E7D32', id: '6.4' },
        { name: 'Ingeniería de Materiales y Manufactura', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '5.4', specialColor: '#FFC107', id: '6.5' },
        { name: 'Termodinámica Aplicada', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '5.2', specialColor: '#4CAF50', id: '6.6' },
        { name: 'HMI, PLC y Redes Industriales', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '6.4', specialColor: '#2E7D32', id: '6.7' }
      ]
    },
    {
      semester: 7,
      color: '#1976D2', // Azul oscuro
      subjects: [
        { name: 'Diseño y Simulación Mecatrónica', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '6.2', specialColor: '#E91E63', id: '7.1' },
        { name: 'P.I. - D.A. - Control', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '6.3', specialColor: '#FF9800', id: '7.2' },
        { name: 'Robótica de Manipuladores y Servicios', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '5.7', specialColor: '#00BCD4', id: '7.3' },
        { name: 'Sistemas Mecatrónicos II', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '6.1', specialColor: '#9E9E9E', id: '7.4' },
        { name: 'Gestión de Proyectos', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: null, specialColor: '#FFEB3B', id: '7.5' },
        { name: 'Optativa', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '5.6', specialColor: '#424242', id: '7.6' },
        { name: 'P.P.', ht: 0, hpe: 0, ha: 2, hts: 2, dependency: null, specialColor: '#795548', id: '7.7' }
      ]
    },
    {
      semester: 8,
      color: '#0D47A1', // Azul muy oscuro
      subjects: [
        { name: 'Sistemas de Manufactura', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '7.4', specialColor: '#9E9E9E', id: '8.1' },
        { name: 'Ética', ht: 2, hpe: 0, ha: 4, hts: 6, dependency: '2.2', specialColor: '#8BC34A', id: '8.2' },
        { name: 'Gestión de la Calidad', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '7.5', specialColor: '#FFEB3B', id: '8.3' },
        { name: 'Tesis', ht: 0, hpe: 2, ha: 6, hts: 8, dependency: '7.7', specialColor: '#795548', id: '8.4' },
        { name: 'Optativa', ht: 2, hpe: 2, ha: 2, hts: 6, dependency: '7.6', specialColor: '#424242', id: '8.5' },
        { name: 'P.P.', ht: 0, hpe: 0, ha: 2, hts: 2, dependency: '7.7', specialColor: '#795548', id: '8.6' }
      ]
    }
  ];

  const getDependencyInfo = (semester: number) => {
    const semesterData = curriculumData[semester - 1];
    if (semester === 1) return 'Semestre base - sin dependencias';
    if (semester === 8) return 'Semestre final - requiere completar materias previas';
    
    const subjectsWithDependencies = semesterData.subjects.filter(subject => subject.dependency);
    if (subjectsWithDependencies.length === 0) {
      return 'Sin dependencias directas del semestre anterior';
    }
    
    const dependencyList = subjectsWithDependencies.map(subject => 
      `• ${subject.name} → ${subject.dependency}`
    ).join('\n');
    
    return `Materias con dependencias:\n${dependencyList}`;
  };

  const findSubjectById = (id: string) => {
    for (const semester of curriculumData) {
      const subject = semester.subjects.find(s => s.id === id);
      if (subject) return { subject, semester: semester.semester };
    }
    return null;
  };

  const handleSemesterPress = (semester: number) => {
    if (selectedSemester === semester) {
      setSelectedSemester(null);
      setSelectedSubject(null);
    } else {
      setSelectedSemester(semester);
      setSelectedSubject(null);
    }
    
    // Toggle collapse state
    setCollapsedSemesters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(semester)) {
        newSet.delete(semester);
      } else {
        newSet.add(semester);
      }
      return newSet;
    });
  };

  const handleSubjectPress = (subject: any) => {
    if (selectedSubject === subject.id) {
      setSelectedSubject(null);
    } else {
      setSelectedSubject(subject.id);
    }
  };

  const toggleAllSemesters = () => {
    if (collapsedSemesters.size === 0) {
      // All are expanded, collapse all
      setCollapsedSemesters(new Set(curriculumData.map(s => s.semester)));
    } else {
      // Some or all are collapsed, expand all
      setCollapsedSemesters(new Set());
    }
  };

  const expandAllSemesters = () => {
    setCollapsedSemesters(new Set());
  };

  const collapseAllSemesters = () => {
    setCollapsedSemesters(new Set(curriculumData.map(s => s.semester)));
  };

  const renderDependencyLine = (fromSubject: any, toSubject: any, fromSemester: number, toSemester: number) => {
    if (!fromSubject.dependency) return null;
    
    const dependencyInfo = findSubjectById(fromSubject.dependency);
    if (!dependencyInfo) return null;

    const isHighlighted = selectedSubject === fromSubject.id || selectedSubject === fromSubject.dependency;
    const lineColor = isHighlighted ? '#6d4aff' : '#ddd';
    const lineWidth = isHighlighted ? 3 : 1;

    return (
      <Animated.View 
        style={[
          styles.dependencyLine,
          {
            opacity: dependencyLines,
            borderColor: lineColor,
            borderWidth: lineWidth,
          }
        ]}
      >
        <View style={[styles.dependencyArrow, { borderColor: lineColor }]} />
      </Animated.View>
    );
  };

  const renderSubjectCard = (subject: any, index: number, semesterIndex: number) => {
    const isSelected = selectedSubject === subject.id;
    const hasDependency = subject.dependency;
    const dependencyInfo = hasDependency ? findSubjectById(subject.dependency) : null;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.subjectCard,
          isSelected && styles.selectedSubjectCard,
          hasDependency && styles.subjectWithDependency
        ]}
        onPress={() => handleSubjectPress(subject)}
        activeOpacity={0.8}
      >
        <View style={styles.subjectHeader}>
          <View style={[
            styles.subjectColorIndicator, 
            { backgroundColor: subject.specialColor || subject.color }
          ]} />
          <Text style={styles.subjectName}>{subject.name}</Text>
          {hasDependency && (
            <MaterialCommunityIcons 
              name="link-variant" 
              size={16} 
              color={isSelected ? "#6d4aff" : "#999"} 
            />
          )}
        </View>
        <View style={styles.hoursContainer}>
          <View style={styles.hourItem}>
            <Text style={styles.hourLabel}>HT</Text>
            <Text style={styles.hourValue}>{subject.ht}</Text>
          </View>
          <View style={styles.hourItem}>
            <Text style={styles.hourLabel}>HPE</Text>
            <Text style={styles.hourValue}>{subject.hpe}</Text>
          </View>
          <View style={styles.hourItem}>
            <Text style={styles.hourLabel}>HA</Text>
            <Text style={styles.hourValue}>{subject.ha}</Text>
          </View>
          <View style={styles.hourItem}>
            <Text style={styles.hourLabel}>HTS</Text>
            <Text style={styles.hourValue}>{subject.hts}</Text>
          </View>
        </View>
        
        {/* Dependency Info */}
        {isSelected && hasDependency && dependencyInfo && (
          <Animated.View 
            style={[
              styles.dependencyInfo,
              { opacity: dependencyLines }
            ]}
          >
            <MaterialCommunityIcons name="arrow-up" size={16} color="#6d4aff" />
            <Text style={styles.dependencyInfoText}>
              Depende de: {dependencyInfo.subject.name} (Semestre {dependencyInfo.semester})
            </Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    );
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
          <Text style={styles.headerSubtitle}>Mecatrónica ESPE - Carga Horaria y Dependencias</Text>
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
          {/* Legend */}
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Leyenda de Colores y Carga Horaria:</Text>
            
            {/* Global Controls */}
            <View style={styles.globalControls}>
              <TouchableOpacity 
                style={styles.globalControlButton}
                onPress={toggleAllSemesters}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons 
                  name={collapsedSemesters.size === 0 ? "eye-off" : "eye"} 
                  size={16} 
                  color="#6d4aff" 
                />
                <Text style={styles.globalControlText}>
                  {collapsedSemesters.size === 0 ? "Ocultar Todo" : "Mostrar Todo"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.globalControlButton}
                onPress={expandAllSemesters}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="expand-all" size={16} color="#4CAF50" />
                <Text style={styles.globalControlText}>Expandir Todo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.globalControlButton}
                onPress={collapseAllSemesters}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="collapse-all" size={16} color="#F44336" />
                <Text style={styles.globalControlText}>Contraer Todo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.legendGrid}>
              <View style={styles.legendSection}>
                <Text style={styles.legendSectionTitle}>Semestres:</Text>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#E3F2FD' }]} />
                    <Text style={styles.legendText}>1° Semestre</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#BBDEFB' }]} />
                    <Text style={styles.legendText}>2° Semestre</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#90CAF9' }]} />
                    <Text style={styles.legendText}>3° Semestre</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#64B5F6' }]} />
                    <Text style={styles.legendText}>4° Semestre</Text>
                  </View>
                </View>
              </View>
              <View style={styles.legendSection}>
                <Text style={styles.legendSectionTitle}>Materias Especiales:</Text>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                    <Text style={styles.legendText}>Control</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#9C27B0' }]} />
                    <Text style={styles.legendText}>Electrónica</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.legendText}>Física/Termo</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                    <Text style={styles.legendText}>Mecánica</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.hoursLegend}>
              <Text style={styles.hoursLegendTitle}>Carga Horaria:</Text>
              <Text style={styles.hoursLegendText}>
                HT: Horas Teóricas | HPE: Horas Práctico-Experimentales | HA: Horas de Aprendizaje Autónomo | HTS: Horas Totales Semanales
              </Text>
            </View>
            <View style={styles.dependencyLegend}>
              <Text style={styles.dependencyLegendTitle}>Dependencias:</Text>
              <Text style={styles.dependencyLegendText}>
                Toca una materia para ver de cuál depende. Las líneas conectan las materias relacionadas.
              </Text>
            </View>
          </View>

          {/* Tree Diagram */}
          <View style={styles.treeContainer}>
            {curriculumData.map((semesterData, semesterIndex) => (
              <View key={semesterData.semester} style={styles.semesterRow}>
                {/* Semester Header */}
                <TouchableOpacity
                  style={[
                    styles.semesterHeader,
                    { backgroundColor: semesterData.color },
                    selectedSemester === semesterData.semester && styles.selectedSemester,
                    collapsedSemesters.has(semesterData.semester) && styles.collapsedSemester
                  ]}
                  onPress={() => handleSemesterPress(semesterData.semester)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.semesterNumber}>{semesterData.semester}°</Text>
                  <Text style={styles.semesterLabel}>Semestre</Text>
                  <Text style={styles.semesterHours}>
                    {semesterData.subjects.reduce((total, subject) => total + subject.hts, 0)} HTS
                  </Text>
                  <MaterialCommunityIcons 
                    name={collapsedSemesters.has(semesterData.semester) ? "chevron-down" : "chevron-up"} 
                    size={20} 
                    color="#666" 
                    style={styles.semesterChevron}
                  />
                  {collapsedSemesters.has(semesterData.semester) && (
                    <View style={styles.collapsedIndicator}>
                      <Text style={styles.collapsedIndicatorText}>
                        {semesterData.subjects.length} materias
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Subjects Grid - Only show if not collapsed */}
                {!collapsedSemesters.has(semesterData.semester) && (
                  <Animated.View 
                    style={[
                      styles.subjectsGrid,
                      { opacity: contentOpacity }
                    ]}
                  >
                    {semesterData.subjects.map((subject, subjectIndex) => 
                      renderSubjectCard(subject, subjectIndex, semesterIndex)
                    )}
                  </Animated.View>
                )}

                {/* Dependency Info - Only show if not collapsed and selected */}
                {!collapsedSemesters.has(semesterData.semester) && selectedSemester === semesterData.semester && (
                  <Animated.View 
                    style={[
                      styles.dependencyInfo,
                      { opacity: dependencyLines }
                    ]}
                  >
                    <MaterialCommunityIcons name="information" size={16} color="#6d4aff" />
                    <Text style={styles.dependencyInfoText}>
                      {getDependencyInfo(semesterData.semester)}
                    </Text>
                  </Animated.View>
                )}

                {/* Connection Line to Next Semester - Only show if not collapsed */}
                {!collapsedSemesters.has(semesterData.semester) && semesterIndex < curriculumData.length - 1 && (
                  <View style={styles.connectionLine}>
                    <View style={[
                      styles.connectionDot,
                      { backgroundColor: semesterData.color }
                    ]} />
                    <View style={[
                      styles.connectionLineVertical,
                      { backgroundColor: semesterData.color }
                    ]} />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>📚 Cómo usar el plan de estudios:</Text>
            <Text style={styles.instructionsText}>
              • <Text style={styles.instructionHighlight}>Toca un semestre</Text> para expandir/contraer sus materias{'\n'}
              • <Text style={styles.instructionHighlight}>Toca una materia</Text> para ver de cuál depende{'\n'}
              • Los semestres contraídos muestran el número de materias{'\n'}
              • Usa los botones globales para expandir/contraer todo{'\n'}
              • Cada materia muestra su carga horaria (HT, HPE, HA, HTS){'\n'}
              • Las materias con colores especiales indican áreas de conocimiento específicas{'\n'}
              • Las dependencias se muestran con líneas conectivas{'\n'}
              • El total de HTS por semestre se muestra en el encabezado del semestre
            </Text>
          </View>

          {/* Career Info */}
          <View style={styles.careerInfoContainer}>
            <Text style={styles.careerInfoTitle}>🎯 Información de la Carrera</Text>
            <View style={styles.careerInfoGrid}>
              <View style={styles.careerInfoItem}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#6d4aff" />
                <Text style={styles.careerInfoLabel}>Duración</Text>
                <Text style={styles.careerInfoValue}>8 Semestres</Text>
              </View>
              <View style={styles.careerInfoItem}>
                <MaterialCommunityIcons name="school" size={24} color="#6d4aff" />
                <Text style={styles.careerInfoLabel}>Total HTS</Text>
                <Text style={styles.careerInfoValue}>~400 HTS</Text>
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
  legendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  legendSection: {
    flex: 1,
    marginHorizontal: 5,
  },
  legendSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  hoursLegend: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginBottom: 15,
  },
  hoursLegendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  hoursLegendText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  dependencyLegend: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  dependencyLegendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  dependencyLegendText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
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
    width: 160,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  collapsedSemester: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  semesterNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  semesterLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  semesterHours: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontWeight: '600',
  },
  semesterChevron: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  collapsedIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  collapsedIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
    maxWidth: width - 40,
  },
  subjectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 140,
    maxWidth: 160,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSubjectCard: {
    borderColor: '#6d4aff',
    backgroundColor: '#f8f9ff',
    transform: [{ scale: 1.02 }],
  },
  subjectWithDependency: {
    borderColor: '#e0e0e0',
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  subjectName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hourItem: {
    alignItems: 'center',
    flex: 1,
  },
  hourLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  hourValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
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
    maxWidth: width - 80,
  },
  dependencyInfoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
    lineHeight: 20,
  },
  dependencyLine: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 2,
    height: 40,
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 1,
  },
  dependencyArrow: {
    position: 'absolute',
    top: -5,
    left: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ddd',
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
  instructionHighlight: {
    fontWeight: 'bold',
    color: '#6d4aff',
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
  globalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  globalControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#6d4aff',
  },
  globalControlText: {
    fontSize: 14,
    color: '#6d4aff',
    marginLeft: 8,
    fontWeight: '600',
  },
});
