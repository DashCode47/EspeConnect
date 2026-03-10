import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ErrorModal } from '../../../../components/modals/ErrorModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { PlanCategory } from '../../domain/entities/plan.entity';
import { usePlanStore } from '../store/plan.store';
import { PlanCard } from './PlanCard';
import { useState } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // 2 columns with padding

interface PlansTabProps {
  onPlanPress: (planId: string) => void;
  onCreatePress: () => void;
  onMyPlansPress?: () => void;
}

export const PlansTab: React.FC<PlansTabProps> = ({ onPlanPress, onCreatePress, onMyPlansPress }) => {
  const { plans, isLoading: plansLoading, joinPlan, leavePlan, fetchPlans, subscribeToPlans } = usePlanStore();
  const [plansCategory, setPlansCategory] = useState<PlanCategory | 'ALL'>('ALL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans(plansCategory === 'ALL' ? undefined : { category: plansCategory });
  }, [plansCategory]);

  useEffect(() => {
    const unsubscribe = subscribeToPlans();
    return unsubscribe;
  }, [subscribeToPlans]);

  const handleJoinPlan = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.isRequested) {
      setErrorMessage('Ya tienes una solicitud pendiente para este plan. Espera a que el organizador la revise.');
      return;
    }

    try {
      if (plan.isParticipating) {
        await leavePlan(planId);
      } else {
        await joinPlan(planId);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'No se pudo completar la acción. Intenta nuevamente.');
    }
  };

  const categories = [
    { key: 'ALL', label: 'Todos', icon: 'view-grid' },
    { key: PlanCategory.CAFE, label: 'Café', icon: 'coffee' },
    { key: PlanCategory.ESTUDIO, label: 'Estudio', icon: 'book-open-variant' },
    { key: PlanCategory.DEPORTE, label: 'Deporte', icon: 'basketball' },
    { key: PlanCategory.FIESTA, label: 'Fiesta', icon: 'party-popper' },
    { key: PlanCategory.CINE, label: 'Cine', icon: 'movie' },
    { key: PlanCategory.COMIDA, label: 'Comida', icon: 'food' },
  ];

  const renderCategoryFilter = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.categoriesTitle}>Categorías</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryChip,
              plansCategory === cat.key && styles.categoryChipActive,
            ]}
            onPress={() => setPlansCategory(cat.key as PlanCategory | 'ALL')}
            activeOpacity={0.7}>
            <MaterialCommunityIcons
              name={cat.icon as any}
              size={18}
              color={plansCategory === cat.key ? colors.white : colors.primary}
            />
            <Text style={[
              styles.categoryChipText,
              plansCategory === cat.key && styles.categoryChipTextActive,
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPlansGrid = () => {
    if (plansLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando planes...</Text>
        </View>
      );
    }

    if (plans.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="calendar-heart" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No hay planes disponibles</Text>
          <Text style={styles.emptySubtitle}>
            Sé el primero en crear un plan para compartir con otros estudiantes
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={onCreatePress}
            activeOpacity={0.8}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
            <Text style={styles.createButtonText}>Crear Plan</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.plansGrid}>
        {plans.map((plan) => (
          <View key={plan.id} style={styles.planCardWrapper}>
            <PlanCard
              plan={plan}
              onPress={() => onPlanPress(plan.id)}
              onJoin={() => handleJoinPlan(plan.id)}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ErrorModal
        visible={!!errorMessage}
        message={errorMessage || ''}
        onClose={() => setErrorMessage(null)}
      />
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.sectionTitle}>Planes Sociales</Text>
            <Text style={styles.sectionSubtitle}>
              Únete a planes o crea el tuyo
            </Text>
          </View>
          {onMyPlansPress && (
            <TouchableOpacity
              onPress={onMyPlansPress}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[colors.accent, '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.myPlansButton}>
                <MaterialCommunityIcons name="star-face" size={20} color={colors.primaryDark} />
                <Text style={styles.myPlansButtonText}>Mis Planes</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Plans Grid */}
      {renderPlansGrid()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myPlansButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  myPlansButtonText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
    marginTop: 4,
  },

  // Categories
  categoriesSection: {
    paddingBottom: 16,
  },
  categoriesTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },

  // Plans Grid
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  planCardWrapper: {
    width: CARD_WIDTH,
  },

  // Loading & Empty states
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },
});
