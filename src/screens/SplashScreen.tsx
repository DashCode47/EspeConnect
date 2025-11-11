import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../config/colors';
import { globalStyles } from '../config/globalStyles';

const { width, height } = Dimensions.get('window');

export const SplashScreen = () => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animar la barra de progreso de 0 a 100% con easing suave
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 2000, // 2 segundos para completar
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#f6f8f7', '#e8f0eb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Grid pattern overlay */}
      <View style={styles.gridOverlay} />
      
      {/* Decorative blurs */}
      <View style={[styles.blurCircle, styles.blurCircleTop]} />
      <View style={[styles.blurCircle, styles.blurCircleBottom]} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Conectando tu futuro</Text>

        {/* Loading Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          CamPlus
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: 'transparent',
    // Grid pattern sería complejo de implementar, usamos un overlay simple
  },
  blurCircle: {
    position: 'absolute',
    width: 288,
    height: 288,
    borderRadius: 144,
    opacity: 0.5,
  },
  blurCircleTop: {
    top: -144,
    left: -144,
    backgroundColor: '#2ECC71',
    opacity: 0.2,
  },
  blurCircleBottom: {
    bottom: -144,
    right: -144,
    backgroundColor: '#F1C40F',
    opacity: 0.2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  logo: {
    width: 160,
    height: 160,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  progressContainer: {
    width: 160,
    paddingTop: 32,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2ECC71',
    borderRadius: 4,
    // Añadimos una animación suave
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

