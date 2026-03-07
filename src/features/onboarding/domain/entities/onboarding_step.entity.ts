import { ImageSourcePropType } from 'react-native';

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  showSkip: boolean;
  image: ImageSourcePropType;
}

export const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
