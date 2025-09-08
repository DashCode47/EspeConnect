import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Animated,
  ImageBackground,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {BenefitsStackParamList} from '../../navigation/types';

const {width, height} = Dimensions.get('window');

interface PromotionData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  discount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RouteParams {
  data: PromotionData;
}

const BenefitDetail = () => {
  const route = useRoute<RouteProp<BenefitsStackParamList, 'BenefitDetails'>>();
  const navigation = useNavigation();
  const {data: promotion} = route.params as RouteParams;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate badge with delay
    setTimeout(() => {
      Animated.spring(badgeScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: {[key: string]: string} = {
      DRINKS: 'cup-water',
      FOOD: 'food-fork-drink',
      SHOPPING: 'shopping',
      ENTERTAINMENT: 'movie',
      HEALTH: 'heart-pulse',
      EDUCATION: 'school',
      TRAVEL: 'airplane',
      OTHER: 'gift',
    };
    return icons[category] || 'gift';
  };

  const getCategoryColor = (category: string) => {
    const colors: {[key: string]: string} = {
      DRINKS: '#4FC3F7',
      FOOD: '#FF9800',
      SHOPPING: '#9C27B0',
      ENTERTAINMENT: '#E91E63',
      HEALTH: '#4CAF50',
      EDUCATION: '#2196F3',
      TRAVEL: '#00BCD4',
      OTHER: '#607D8B',
    };
    return colors[category] || '#607D8B';
  };

  const categoryColor = getCategoryColor(promotion.category);
  const isExpired = new Date(promotion.endDate) < new Date();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={categoryColor}
        translucent
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Section with Circular Image */}
        <Animated.View
          style={[
            styles.heroSection,
            {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
          ]}>
          {/* Circular Image Container */}
          <View style={styles.circularImageContainer}>
            <View style={[styles.circularImageWrapper, {borderColor: categoryColor}]}>
              <ImageBackground
                source={{uri: promotion.imageUrl}}
                style={styles.circularImage}
                imageStyle={styles.circularImageStyle}>
                <View style={styles.circularImageOverlay}>
                  {/* Status Badge */}
                  <Animated.View
                    style={[styles.badgeContainer, {transform: [{scale: badgeScale}]}]}>
                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: isExpired ? '#FF5252' : '#4CAF50'},
                      ]}>
                      <MaterialCommunityIcons
                        name={isExpired ? 'clock-alert' : 'check-circle'}
                        size={16}
                        color="white"
                      />
                      <Text style={styles.statusText}>
                        {isExpired ? 'Expirado' : 'Activo'}
                      </Text>
                    </View>
                  </Animated.View>
                </View>
              </ImageBackground>
            </View>
            
            {/* Discount Badge */}
            {promotion.discount > 0 && (
              <Animated.View
                style={[
                  styles.discountContainer,
                  {transform: [{scale: badgeScale}]},
                ]}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{promotion.discount}%</Text>
                  <Text style={styles.discountLabel}>DESCUENTO</Text>
                </View>
              </Animated.View>
            )}
          </View>

          {/* Content Section */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{promotion.title}</Text>
            <Text style={styles.restaurantName}>Restaurante La Esquina Gourmet</Text>
            <Text style={styles.heroDescription}>{promotion.description}</Text>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          {/* Info Grid */}
          <View style={styles.infoGrid}>
            {/* Location Card */}
            <View style={[styles.infoCard, styles.infoCardSmall]}>
              <View style={[styles.infoIconContainer, { backgroundColor: `${categoryColor}15` }]}>
                <MaterialCommunityIcons name="map-marker" size={28} color={categoryColor} />
              </View>
              <Text style={styles.infoLabel}>Ubicación</Text>
              <Text style={styles.infoValue}>{promotion.location}</Text>
            </View>

            {/* Category Card */}
            <View style={[styles.infoCard, styles.infoCardSmall]}>
              <View style={[styles.infoIconContainer, { backgroundColor: `${categoryColor}15` }]}>
                <MaterialCommunityIcons name="tag" size={28} color={categoryColor} />
              </View>
              <Text style={styles.infoLabel}>Categoría</Text>
              <Text style={styles.infoValue}>{promotion.category}</Text>
            </View>
          </View>

          {/* Timeline Section */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineHeader}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={categoryColor} />
              <Text style={styles.timelineTitle}>Cronología del Beneficio</Text>
            </View>
            
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>{formatDate(promotion.startDate)}</Text>
                  <Text style={styles.timelineLabel}>Inicio de la promoción</Text>
                </View>
              </View>
              
              <View style={styles.timelineLine} />
              
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: isExpired ? '#FF5252' : '#FF9800' }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>{formatDate(promotion.endDate)}</Text>
                  <Text style={styles.timelineLabel}>
                    {isExpired ? 'Promoción expirada' : 'Fecha de finalización'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Validity Period */}
          <View style={styles.validityCard}>
            <View
              style={[styles.validityContent, {backgroundColor: '#2d1863'}]}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="white"
              />
              <Text style={styles.validityText}>
                {isExpired
                  ? 'Esta promoción ha expirado'
                  : 'Promoción válida hasta ' + formatDate(promotion.endDate)}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton}>
            <View
              style={[styles.actionContent, {backgroundColor: categoryColor}]}>
              <MaterialCommunityIcons
                name="share-variant"
                size={20}
                color="white"
              />
              <Text style={styles.actionButtonText}>Compartir Beneficio</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 30,
    paddingBottom: 60,
  },
  header: {
    zIndex: 1000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerBackground: {
    width: '100%',
    height: 120,
  },
  headerOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  circularImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  circularImageWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  circularImage: {
    width: '100%',
    height: '100%',
  },
  circularImageStyle: {
    borderRadius: 80,
  },
  circularImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  categoryIcon: {
    marginBottom: 16,
    opacity: 0.9,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  heroDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  discountContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 10,
  },
  discountBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minWidth: 50,
  },
  discountText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discountLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 1,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardSmall: {
    width: '45%',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
  },
  timelineContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  timeline: {
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 4,
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginLeft: 7,
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  validityCard: {
    marginTop: 20,
    marginBottom: 30,
  },
  validityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  validityText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BenefitDetail;

