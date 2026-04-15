import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorModal } from '../../../../components/modals/ErrorModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { PlanCategory, PlanStatus } from '../../domain/entities/plan.entity';
import { usePlanStore } from '../store/plan.store';
import { PlanCard } from './PlanCard';
import { PlansSkeletonLoader } from './PlansSkeletonLoader';
import { track } from '../../../../analytics/track';
import { AnalyticsEvents } from '../../../../analytics/events';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

// Stable reference — never recreated on render
const PLAN_CATEGORIES: { key: PlanCategory | 'ALL'; label: string; icon: string }[] = [
  { key: 'ALL', label: 'Todos', icon: 'view-grid' },
  { key: PlanCategory.CAFE, label: 'Café', icon: 'coffee' },
  { key: PlanCategory.ESTUDIO, label: 'Estudio', icon: 'book-open-variant' },
  { key: PlanCategory.DEPORTE, label: 'Deporte', icon: 'basketball' },
  { key: PlanCategory.FIESTA, label: 'Fiesta', icon: 'party-popper' },
  { key: PlanCategory.CINE, label: 'Cine', icon: 'movie' },
  { key: PlanCategory.COMIDA, label: 'Comida', icon: 'food' },
];

interface PlansTabProps {
  onPlanPress: (planId: string) => void;
  onCreatePress: () => void;
  onMyPlansPress?: () => void;
}

export const PlansTab: React.FC<PlansTabProps> = ({ onPlanPress, onCreatePress, onMyPlansPress }) => {
  const { plans, isLoading: plansLoading, isFetchingMorePlans, hasMorePlans, joinPlan, leavePlan, fetchPlans, fetchMorePlans, subscribeToPlans } = usePlanStore();
  const [plansCategory, setPlansCategory] = useState<PlanCategory | 'ALL'>('ALL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  // Ref to avoid stale closure in subscription callback
  const plansCategoryRef = useRef<PlanCategory | 'ALL'>(plansCategory);
  useEffect(() => {
    plansCategoryRef.current = plansCategory;
  }, [plansCategory]);

  useEffect(() => {
    fetchPlans(plansCategory === 'ALL' ? undefined : { category: plansCategory });
  }, [plansCategory]);

  useEffect(() => {
    AsyncStorage.getItem('plans_disclaimer_seen').then(seen => {
      if (!seen) {
        setInfoModalVisible(true);
        AsyncStorage.setItem('plans_disclaimer_seen', '1');
      }
    });
  }, []);

  // Real-time subscription respects the active category filter
  useEffect(() => {
    const unsubscribe = subscribeToPlans(() => {
      const cat = plansCategoryRef.current;
      return cat === 'ALL' ? undefined : { category: cat };
    });
    return unsubscribe;
  }, [subscribeToPlans]);

  // Only show active, non-expired plans, sorted newest first
  const filteredSortedPlans = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [...plans]
      .filter(plan => {
        if (plan.status !== PlanStatus.ACTIVE) return false;
        const planDate = new Date(plan.date + 'T00:00:00');
        return planDate >= today;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [plans]);

  const handleJoinPlan = useCallback(async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.isRequested) {
      setErrorMessage('Ya tienes una solicitud pendiente para este plan. Espera a que el organizador la revise.');
      return;
    }

    try {
      if (plan.isParticipating) {
        track(AnalyticsEvents.PLANS_JOIN_TOGGLED, { planId, action: 'leave' });
        await leavePlan(planId);
      } else {
        track(AnalyticsEvents.PLANS_JOIN_TOGGLED, { planId, action: 'join' });
        await joinPlan(planId);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'No se pudo completar la acción. Intenta nuevamente.');
    }
  }, [plans, joinPlan, leavePlan]);

  const handleCategoryChange = useCallback((cat: PlanCategory | 'ALL') => {
    track(AnalyticsEvents.PLANS_CATEGORY_CHANGED, { category: cat });
    setPlansCategory(cat);
  }, []);

  const handleLoadMore = useCallback(() => {
    fetchMorePlans({ category: plansCategory === 'ALL' ? undefined : plansCategory });
  }, [fetchMorePlans, plansCategory]);

  const renderCategoryFilter = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.categoriesTitle}>Categorías</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}>
        {PLAN_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryChip,
              plansCategory === cat.key && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryChange(cat.key)}
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
      return <PlansSkeletonLoader />;
    }

    if (filteredSortedPlans.length === 0) {
      const activeCategoryLabel = PLAN_CATEGORIES.find(c => c.key === plansCategory)?.label;
      const emptyTitle = plansCategory === 'ALL'
        ? 'No hay planes disponibles'
        : `No hay planes de ${activeCategoryLabel}`;
      const emptySubtitle = plansCategory === 'ALL'
        ? 'Sé el primero en crear un plan para compartir con otros estudiantes'
        : `Todavía no hay planes de ${activeCategoryLabel}. ¡Crea el primero!`;

      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="calendar-heart" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => { track(AnalyticsEvents.PLANS_CREATE_TAPPED); onCreatePress(); }}
            activeOpacity={0.8}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
            <Text style={styles.createButtonText}>Crear Plan</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.plansGrid}>
          {filteredSortedPlans.map((plan) => (
            <View key={plan.id} style={styles.planCardWrapper}>
              <PlanCard
                plan={plan}
                onPress={() => onPlanPress(plan.id)}
                onJoin={() => handleJoinPlan(plan.id)}
              />
            </View>
          ))}
        </View>
        {hasMorePlans && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
            disabled={isFetchingMorePlans}
            activeOpacity={0.8}>
            {isFetchingMorePlans ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.loadMoreText}>Ver más planes</Text>
            )}
          </TouchableOpacity>
        )}
      </>
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
            <View style={styles.titleRow}>
              <Text style={styles.sectionTitle}>Planes Sociales</Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setInfoModalVisible(true)}
                activeOpacity={0.7}>
                <MaterialCommunityIcons name="shield-check" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>
              Únete a planes o crea el tuyo
            </Text>
          </View>
          {onMyPlansPress && (
            <TouchableOpacity
              onPress={() => { track(AnalyticsEvents.PLANS_MY_PLANS_TAPPED); onMyPlansPress?.(); }}
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

      {/* Info Modal */}
      <Modal
        visible={infoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setInfoModalVisible(false)}>
          <View style={styles.modalCard}>
            <MaterialCommunityIcons name="shield-check" size={32} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Planes entre estudiantes</Text>
            <Text style={styles.modalBody}>
              En CamPlus, todos los planes son creados por y para estudiantes reales de la ESPE.{'\n\n'}
              Conecta con otros alumnos, organiza grupos de estudio o salidas sociales en un entorno seguro y exclusivo para la comunidad universitaria.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoButton: {
    padding: 2,
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

  // Empty state
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },
  loadMoreButton: {
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },
});
