import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { BenefitsStackParamList } from "../../navigation/types";

const { width, height } = Dimensions.get('window');

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
  const { data: promotion } = route.params as RouteParams;

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
    const icons: { [key: string]: string } = {
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
    const colors: { [key: string]: string } = {
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
      <StatusBar barStyle="light-content" backgroundColor={categoryColor} translucent />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { backgroundColor: categoryColor },
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Beneficio</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection, 
            { backgroundColor: categoryColor },
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.heroContent}>
            <MaterialCommunityIcons
              name={getCategoryIcon(promotion.category) as any}
              size={80}
              color="white"
              style={styles.categoryIcon}
            />
            <Text style={styles.heroTitle}>{promotion.title}</Text>
            <Text style={styles.heroDescription}>{promotion.description}</Text>
          </View>
        </Animated.View>

        {/* Status Badge */}
        <Animated.View 
          style={[
            styles.badgeContainer,
            { transform: [{ scale: badgeScale }] }
          ]}
        >
          <View style={[
            styles.statusBadge,
            { backgroundColor: isExpired ? '#FF5252' : '#4CAF50' }
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

        {/* Discount Badge */}
        {promotion.discount > 0 && (
          <Animated.View 
            style={[
              styles.discountContainer,
              { transform: [{ scale: badgeScale }] }
            ]}
          >
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{promotion.discount}%</Text>
              <Text style={styles.discountLabel}>DESCUENTO</Text>
            </View>
          </Animated.View>
        )}

        {/* Content */}
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Location */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: `${categoryColor}20` }]}>
              <MaterialCommunityIcons name="map-marker" size={24} color={categoryColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ubicación</Text>
              <Text style={styles.infoValue}>{promotion.location}</Text>
            </View>
          </View>

          {/* Category */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: `${categoryColor}20` }]}>
              <MaterialCommunityIcons name="tag" size={24} color={categoryColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Categoría</Text>
              <Text style={styles.infoValue}>{promotion.category}</Text>
            </View>
          </View>

          {/* Start Date */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: `${categoryColor}20` }]}>
              <MaterialCommunityIcons name="calendar-start" size={24} color={categoryColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fecha de Inicio</Text>
              <Text style={styles.infoValue}>{formatDate(promotion.startDate)}</Text>
            </View>
          </View>

          {/* End Date */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: `${categoryColor}20` }]}>
              <MaterialCommunityIcons name="calendar-end" size={24} color={categoryColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fecha de Finalización</Text>
              <Text style={styles.infoValue}>{formatDate(promotion.endDate)}</Text>
            </View>
          </View>

          {/* Validity Period */}
          <View style={styles.validityCard}>
            <View style={[styles.validityContent, { backgroundColor: '#2d1863' }]}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="white" />
              <Text style={styles.validityText}>
                {isExpired 
                  ? 'Esta promoción ha expirado'
                  : 'Promoción válida hasta ' + formatDate(promotion.endDate)
                }
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionContent, { backgroundColor: categoryColor }]}>
              <MaterialCommunityIcons name="share-variant" size={20} color="white" />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    zIndex: 1000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  heroContent: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  categoryIcon: {
    marginBottom: 16,
    opacity: 0.9,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  badgeContainer: {
    alignItems: 'center',
    marginTop: -20,
    zIndex: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  discountContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  discountBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  discountText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  discountLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 30,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
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
    shadowOffset: { width: 0, height: 2 },
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