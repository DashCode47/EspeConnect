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

// Mock data for wisdom capsules
const WISDOM_CAPSULES = [
  {
    id: '1',
    tip: 'No tomes Termodinámica y Física 2 al mismo tiempo… confía.',
    author: 'Estudiante 8vo Semestre',
    semester: '8',
    category: 'Consejo de Supervivencia',
    likes: 127,
    icon: 'lightbulb-on',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: '2',
    tip: 'Haz amigos en el primer semestre, serán tu red de apoyo durante toda la carrera.',
    author: 'Estudiante 9no Semestre',
    semester: '9',
    category: 'Consejo de Supervivencia',
    likes: 89,
    icon: 'account-group',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: '3',
    tip: 'Aprende a programar desde el primer día, no lo dejes para después.',
    author: 'Estudiante 10mo Semestre',
    semester: '10',
    category: 'Consejo de Supervivencia',
    likes: 156,
    icon: 'code-braces',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: '4',
    tip: 'Los proyectos en grupo son tu oportunidad de aprender a trabajar en equipo real.',
    author: 'Estudiante 7mo Semestre',
    semester: '7',
    category: 'Consejo de Supervivencia',
    likes: 73,
    icon: 'handshake',
    gradient: ['#43e97b', '#38f9d7'],
  },
  {
    id: '5',
    tip: 'No te estreses por las notas perfectas, enfócate en aprender realmente.',
    author: 'Estudiante 9no Semestre',
    semester: '9',
    category: 'Consejo de Supervivencia',
    likes: 201,
    icon: 'star',
    gradient: ['#fa709a', '#fee140'],
  },
  {
    id: '6',
    tip: 'Participa en eventos de la facultad, networking temprano es clave.',
    author: 'Estudiante 8vo Semestre',
    semester: '8',
    category: 'Consejo de Supervivencia',
    likes: 94,
    icon: 'calendar-star',
    gradient: ['#a8edea', '#fed6e3'],
  },
];

export default function WisdomCapsules() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [headerOpacity] = useState(new Animated.Value(0));
  const [contentOpacity] = useState(new Animated.Value(0));
  const [contentTranslateY] = useState(new Animated.Value(50));
  const [capsuleAnimations] = useState(
    WISDOM_CAPSULES.map(() => new Animated.Value(0))
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

    // Animate capsules sequentially
    const capsuleTimings = capsuleAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 500 + index * 150,
        useNativeDriver: true,
      })
    );

    Animated.stagger(150, capsuleTimings).start();
  }, []);

  const renderCapsule = (capsule: any, index: number) => (
    <Animated.View
      key={capsule.id}
      style={[
        styles.capsule,
        {
          opacity: capsuleAnimations[index],
          transform: [
            {
              translateY: capsuleAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            {
              scale: capsuleAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}>
      <LinearGradient
        colors={capsule.gradient}
        style={styles.capsuleGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.capsuleHeader}>
          <View style={styles.capsuleIconContainer}>
            <MaterialCommunityIcons
              name={capsule.icon as any}
              size={24}
              color="white"
            />
          </View>
          <View style={styles.capsuleMeta}>
            <Text style={styles.capsuleCategory}>{capsule.category}</Text>
            <Text style={styles.capsuleAuthor}>
              {capsule.author} • {capsule.semester}° Semestre
            </Text>
          </View>
        </View>
        
        <Text style={styles.capsuleTip}>{capsule.tip}</Text>
        
        <View style={styles.capsuleFooter}>
          <View style={styles.likesContainer}>
            <MaterialCommunityIcons name="heart" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.likesText}>{capsule.likes}</Text>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <MaterialCommunityIcons name="share-variant" size={16} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
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
              <MaterialCommunityIcons name="lightbulb-on" size={48} color="white" />
            </View>
            <Text style={styles.headerTitle}>Cápsulas de Sabiduría</Text>
            <Text style={styles.headerSubtitle}>
              Consejos de supervivencia de estudiantes avanzados
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
              Descubre los consejos más valiosos que solo los estudiantes de semestres avanzados pueden darte. 
              Cada cápsula contiene sabiduría práctica para navegar tu carrera universitaria.
            </Text>
          </Animated.View>

          {/* Capsules */}
          <View style={styles.capsulesContainer}>
            {WISDOM_CAPSULES.map((capsule, index) => renderCapsule(capsule, index))}
          </View>

          {/* Add Your Own Tip */}
          <Animated.View
            style={[
              styles.addTipContainer,
              {
                opacity: contentOpacity,
                transform: [{translateY: contentTranslateY}],
              },
            ]}>
            <View style={styles.addTipHeader}>
              <MaterialCommunityIcons name="plus-circle" size={24} color="#6d4aff" />
              <Text style={styles.addTipTitle}>¿Tienes un consejo?</Text>
              <Text style={styles.addTipSubtitle}>Comparte tu sabiduría con futuros estudiantes</Text>
            </View>
            <TouchableOpacity style={styles.addTipButton}>
              <View style={styles.addTipButtonContent}>
                <MaterialCommunityIcons name="pencil" size={20} color="white" />
                <Text style={styles.addTipButtonText}>Agregar Mi Consejo</Text>
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
  capsulesContainer: {
    gap: 16,
    marginBottom: 20,
  },
  capsule: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  capsuleGradient: {
    padding: 20,
  },
  capsuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  capsuleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  capsuleMeta: {
    flex: 1,
  },
  capsuleCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  capsuleAuthor: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  capsuleTip: {
    fontSize: 18,
    lineHeight: 26,
    color: 'white',
    fontWeight: '500',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  capsuleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTipContainer: {
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
  addTipHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  addTipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  addTipSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  addTipButton: {
    backgroundColor: '#6d4aff',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addTipButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
