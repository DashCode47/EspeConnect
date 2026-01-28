import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ImageSourcePropType,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../config/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HorizontalIcon } from '../assets/svg/HorizontalIcon';
import { navigationRef } from '../navigation/RootNavigator';
import onBoardingImage1 from '../assets/images/onBoarding1.jpeg';
import onBoardingImage2 from '../assets/images/onBoarding2.jpeg';
import onBoardingImage3 from '../assets/images/onBoarding3.jpeg';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  showSkip: boolean;
  image: ImageSourcePropType;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Aprovecha tus beneficios universitarios',
    description:
      'Accede a descuentos exclusivos en restaurantes, papelerías, cafés y comercios aliados solo por ser estudiante.',
    showSkip: true,
    image: onBoardingImage1,
  },
  {
    id: 2,
    title: 'Compra, vende o intercambia lo que necesites',
    description:
      'Encuentra libros, apuntes, accesorios, ropa o cualquier artículo estudiantil. Dale una segunda vida a lo que ya no usas.',
    showSkip: true,
    image: onBoardingImage3,
  },
  {
    id: 3,
    title: 'Viajes seguros y económicos entre estudiantes',
    description:
      'Crea o únete a rutas compartidas entre tu casa y la universidad. Ahorra dinero y viaja con tus compañeros.',
    showSkip: false,
    image: onBoardingImage2,
  },
];

export const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    // Trigger refresh of onboarding status in RootNavigator
    if (navigationRef.current?.isReady() && (navigationRef.current as any).refreshOnboarding) {
      (navigationRef.current as any).refreshOnboarding();
    }
    // Navigate to Auth screen
    if (navigationRef.current?.isReady()) {
      navigationRef.current.navigate('Auth');
    }
  };

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      scrollViewRef.current?.scrollTo({
        x: nextStep * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentStep(nextStep);
    } else {
      // Last step - complete onboarding
      await AsyncStorage.setItem('onboarding_completed', 'true');
      // Trigger refresh of onboarding status in RootNavigator
      if (navigationRef.current?.isReady() && (navigationRef.current as any).refreshOnboarding) {
        (navigationRef.current as any).refreshOnboarding();
      }
      // Navigate to Auth screen
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate('Auth');
      }
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const step = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentStep(step);
  };

  const renderLogo = () => (
    <View style={styles.logoContainer}>
      <HorizontalIcon width={140} height={28} />
    </View>
  );

  const renderStep = (step: OnboardingStep, index: number) => (
    <View key={step.id} style={styles.stepContainer}>
      {/* Content Placeholder */}
      <Image source={step.image} style={styles.contentPlaceholder} />

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {ONBOARDING_STEPS.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.paginationDot,
              idx === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {/* Title */}
      <Text style={styles.stepTitle}>{step.title}</Text>

      {/* Description */}
      <Text style={styles.stepDescription}>{step.description}</Text>
    </View>
  );

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        {renderLogo()}

        {/* Steps ScrollView */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}>
          {ONBOARDING_STEPS.map((step, index) => renderStep(step, index))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.buttonsContainer, { paddingBottom: insets.bottom + 20 }]}>
          {currentStepData.showSkip && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.8}>
              <Text style={styles.skipButtonText}>Saltar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              !currentStepData.showSkip && styles.nextButtonFullWidth,
            ]}
            onPress={handleNext}
            activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  contentPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginBottom: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    lineHeight: 32,
  },
  stepDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.primaryDark,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#cde1d8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonFullWidth: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

