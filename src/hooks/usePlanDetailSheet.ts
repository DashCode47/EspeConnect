import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions } from 'react-native';
import { Plan } from '../types/plan.types';
import { planService } from '../services/plan.service';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const usePlanDetailSheet = (
  planId: string | null,
  visible: boolean,
  onClose: () => void,
  onJoin: () => void,
) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible && planId) {
      slideAnim.setValue(SCREEN_HEIGHT);
      fetchPlanDetails();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else if (!visible) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, planId]);

  const fetchPlanDetails = async () => {
    if (!planId) return;
    try {
      setLoading(true);
      const data = await planService.getPlanById(planId);
      setPlan(data);
    } catch (error) {
      console.error('Error fetching plan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleJoinPress = async () => {
    try {
      setJoiningLoading(true);
      await onJoin();
      await fetchPlanDetails();
    } catch (error) {
      console.error('Error in handleJoinPress:', error);
    } finally {
      setJoiningLoading(false);
    }
  };

  const getCategoryEmoji = (category?: string): string => {
    const emojis: Record<string, string> = {
      CAFE: '☕',
      FIESTA: '🎉',
      ESTUDIO: '📚',
      DEPORTE: '⚽',
      CINE: '🎬',
      MUSICA: '🎵',
      VIAJE: '✈️',
      COMIDA: '🍕',
      OTRO: '⭐',
    };
    return category ? (emojis[category] || '📅') : '📅';
  };

  const formatTime = (time: string) => time.slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const activeParticipants = plan?.participants?.filter(p => p.left_at === null) ?? [];
  const displayParticipants = activeParticipants.slice(0, 3);
  const additionalCount = Math.max(activeParticipants.length - 3, 0);

  return {
    plan,
    loading,
    joiningLoading,
    slideAnim,
    handleClose,
    handleJoinPress,
    getCategoryEmoji,
    formatTime,
    formatDate,
    displayParticipants,
    additionalCount,
  };
};
