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
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {globalStyles} from '../../config/globalStyles';

const {width, height} = Dimensions.get('window');

// Mock data for professors
const PROFESSORS = [
  {
    id: '1',
    name: 'Dr. Carlos Mendoza',
    subject: 'Termodinámica',
    department: 'Ingeniería Mecánica',
    avatar: '👨‍🏫',
    overallRating: 4.2,
    difficultyLevel: 4.5,
    clarity: 4.0,
    humor: 3.8,
    proximity: 4.3,
    totalReviews: 127,
    recentComment: 'Sobrevive 101: No te atrases con las tareas, él las revisa al pie de la letra.',
    strengths: ['Muy claro explicando', 'Excelente material de apoyo'],
    weaknesses: ['Muy exigente', 'Exámenes complicados'],
    tags: ['Exigente', 'Claro', 'Justo'],
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: '2',
    name: 'Dra. Ana Rodríguez',
    subject: 'Física 2',
    department: 'Ingeniería Física',
    avatar: '👩‍🏫',
    overallRating: 4.6,
    difficultyLevel: 3.8,
    clarity: 4.8,
    humor: 4.5,
    proximity: 4.7,
    totalReviews: 89,
    recentComment: 'Sobrevive 101: Llega temprano, ella siempre empieza con ejercicios prácticos.',
    strengths: ['Excelente didáctica', 'Muy cercana a los estudiantes'],
    weaknesses: ['Pocas oportunidades de recuperación'],
    tags: ['Didáctica', 'Cercana', 'Práctica'],
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: '3',
    name: 'Prof. Luis Torres',
    subject: 'Programación Avanzada',
    department: 'Ingeniería en Software',
    avatar: '👨‍💻',
    overallRating: 4.4,
    difficultyLevel: 4.2,
    clarity: 4.3,
    humor: 4.1,
    proximity: 4.0,
    totalReviews: 156,
    recentComment: 'Sobrevive 101: Practica todos los días, los proyectos son acumulativos.',
    strengths: ['Proyectos reales', 'Feedback constante'],
    weaknesses: ['Mucho trabajo práctico'],
    tags: ['Práctico', 'Innovador', 'Exigente'],
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: '4',
    name: 'Dra. María González',
    subject: 'Cálculo Diferencial',
    department: 'Matemáticas',
    avatar: '👩‍🔬',
    overallRating: 4.1,
    difficultyLevel: 4.7,
    clarity: 3.9,
    humor: 3.5,
    proximity: 4.2,
    totalReviews: 203,
    recentComment: 'Sobrevive 101: Estudia los ejercicios del libro, los exámenes son similares.',
    strengths: ['Muy preparada', 'Horarios de consulta'],
    weaknesses: ['Explicaciones muy rápidas', 'Muy exigente'],
    tags: ['Preparada', 'Exigente', 'Disponible'],
    gradient: ['#43e97b', '#38f9d7'],
  },
  {
    id: '5',
    name: 'Prof. Roberto Silva',
    subject: 'Bases de Datos',
    department: 'Ingeniería en Sistemas',
    avatar: '👨‍💼',
    overallRating: 4.3,
    difficultyLevel: 3.9,
    clarity: 4.4,
    humor: 4.2,
    proximity: 4.1,
    totalReviews: 94,
    recentComment: 'Sobrevive 101: Los laboratorios son clave, no los dejes para el final.',
    strengths: ['Excelentes laboratorios', 'Muy claro'],
    weaknesses: ['Pocas flexibilidades con fechas'],
    tags: ['Claro', 'Práctico', 'Organizado'],
    gradient: ['#fa709a', '#fee140'],
  },
];

export default function ProfessorRadar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [headerOpacity] = useState(new Animated.Value(0));
  const [contentOpacity] = useState(new Animated.Value(0));
  const [contentTranslateY] = useState(new Animated.Value(50));
  const [professorAnimations] = useState(
    PROFESSORS.map(() => new Animated.Value(0))
  );

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

    // Animate professors sequentially
    const professorTimings = professorAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 500 + index * 150,
        useNativeDriver: true,
      })
    );

    Animated.stagger(150, professorTimings).start();
  }, []);

  const renderStars = (rating: number, size: number = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <MaterialCommunityIcons
            key={i}
            name="star"
            size={size}
            color="#FFD700"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <MaterialCommunityIcons
            key={i}
            name="star-half"
            size={size}
            color="#FFD700"
          />
        );
      } else {
        stars.push(
          <MaterialCommunityIcons
            key={i}
            name="star-outline"
            size={size}
            color="#FFD700"
          />
        );
      }
    }
    return stars;
  };

  const renderRatingBar = (label: string, value: number, color: string) => (
    <View style={styles.ratingBarContainer}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.ratingBar}>
        <View style={[styles.ratingBarFill, {width: `${(value / 5) * 100}%`, backgroundColor: color}]} />
      </View>
      <Text style={styles.ratingValue}>{value.toFixed(1)}</Text>
    </View>
  );

  const renderProfessor = (professor: any, index: number) => (
    <Animated.View
      key={professor.id}
      style={[
        styles.professorCard,
        {
          opacity: professorAnimations[index],
          transform: [
            {
              translateY: professorAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            {
              scale: professorAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}>
      <LinearGradient
        colors={professor.gradient}
        style={styles.professorGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.professorHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{professor.avatar}</Text>
          </View>
          <View style={styles.professorInfo}>
            <Text style={styles.professorName}>{professor.name}</Text>
            <Text style={styles.professorSubject}>{professor.subject}</Text>
            <Text style={styles.professorDepartment}>{professor.department}</Text>
          </View>
          <View style={styles.overallRatingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(professor.overallRating, 20)}
            </View>
            <Text style={styles.overallRating}>{professor.overallRating}</Text>
            <Text style={styles.totalReviews}>({professor.totalReviews} reseñas)</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.professorContent}>
        {/* Rating Bars */}
        <View style={styles.ratingsSection}>
          <Text style={styles.ratingsTitle}>Evaluación Detallada</Text>
          {renderRatingBar('Nivel de Exigencia', professor.difficultyLevel, '#ff6b6b')}
          {renderRatingBar('Claridad para Explicar', professor.clarity, '#4ecdc4')}
          {renderRatingBar('Humor y Cercanía', professor.humor, '#45b7d1')}
          {renderRatingBar('Disponibilidad', professor.proximity, '#96ceb4')}
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {professor.tags.map((tag: string, tagIndex: number) => (
            <View key={tagIndex} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Recent Comment */}
        <View style={styles.commentContainer}>
          <View style={styles.commentHeader}>
            <MaterialCommunityIcons name="comment-quote" size={20} color="#667eea" />
            <Text style={styles.commentTitle}>Sobrevive 101</Text>
          </View>
          <Text style={styles.commentText}>{professor.recentComment}</Text>
        </View>

        {/* Strengths & Weaknesses */}
        <View style={styles.strengthsWeaknessesContainer}>
          <View style={styles.strengthsContainer}>
            <Text style={styles.swTitle}>💪 Fortalezas</Text>
            {professor.strengths.map((strength: string, swIndex: number) => (
              <Text key={swIndex} style={styles.swItem}>• {strength}</Text>
            ))}
          </View>
          <View style={styles.weaknessesContainer}>
            <Text style={styles.swTitle}>⚠️ Áreas de Mejora</Text>
            {professor.weaknesses.map((weakness: string, swIndex: number) => (
              <Text key={swIndex} style={styles.swItem}>• {weakness}</Text>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.reviewButton}>
            <MaterialCommunityIcons name="pencil" size={16} color="white" />
            <Text style={styles.reviewButtonText}>Escribir Reseña</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <MaterialCommunityIcons name="share-variant" size={16} color="#667eea" />
            <Text style={styles.shareButtonText}>Compartir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <Animated.View style={[styles.header, {opacity: headerOpacity}]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons name="radar" size={48} color="white" />
            </View>
            <Text style={styles.headerTitle}>Radar de Profesores</Text>
            <Text style={styles.headerSubtitle}>
              Reseñas académicas con respeto y moderación
            </Text>
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
          {/* Introduction */}
          <Animated.View
            style={[
              styles.introductionContainer,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <MaterialCommunityIcons name="information" size={24} color="#667eea" />
            <Text style={styles.introductionText}>
              Descubre qué dicen otros estudiantes sobre los profesores. 
              Evaluamos con respeto: nivel de exigencia, claridad, humor y cercanía.
            </Text>
          </Animated.View>

          {/* Professors */}
          <View style={styles.professorsContainer}>
            {PROFESSORS.map((professor, index) => renderProfessor(professor, index))}
          </View>

          {/* Add Review */}
          <Animated.View
            style={[
              styles.addReviewContainer,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <View style={styles.addReviewHeader}>
              <MaterialCommunityIcons name="plus-circle" size={24} color="#6d4aff" />
              <Text style={styles.addReviewTitle}>¿Conoces a un profesor?</Text>
              <Text style={styles.addReviewSubtitle}>Comparte tu experiencia de manera respetuosa</Text>
            </View>
            <TouchableOpacity style={styles.addReviewButton}>
              <View style={styles.addReviewButtonContent}>
                <MaterialCommunityIcons name="pencil" size={20} color="white" />
                <Text style={styles.addReviewButtonText}>Agregar Reseña</Text>
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
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
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
  introductionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  introductionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginLeft: 16,
    flex: 1,
  },
  professorsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  professorCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  professorGradient: {
    padding: 20,
  },
  professorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    fontSize: 32,
  },
  professorInfo: {
    flex: 1,
  },
  professorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  professorSubject: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  professorDepartment: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  overallRatingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  overallRating: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  totalReviews: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  professorContent: {
    backgroundColor: 'white',
    padding: 20,
  },
  ratingsSection: {
    marginBottom: 20,
  },
  ratingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    width: 120,
    fontSize: 14,
    color: '#666',
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingValue: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  tagText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  commentContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginLeft: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    fontStyle: 'italic',
  },
  strengthsWeaknessesContainer: {
    marginBottom: 20,
  },
  strengthsContainer: {
    marginBottom: 16,
  },
  weaknessesContainer: {
    marginBottom: 16,
  },
  swTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  swItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    backgroundColor: '#6d4aff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  addReviewContainer: {
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
  addReviewHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  addReviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  addReviewSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  addReviewButton: {
    backgroundColor: '#6d4aff',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addReviewButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addReviewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
