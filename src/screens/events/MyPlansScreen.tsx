import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../config/colors';
import { FONT_FAMILY } from '../../config/globalStyles';
import { Plan, PlanCategory, PlanStatus } from '../../types/plan.types';
import { EventStackParamList } from '../../navigation/types';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { SuccessModal } from '../../components/modals/SuccessModal';
import { usePlanStore } from '../../store/planStore';

type NavigationProp = NativeStackNavigationProp<EventStackParamList>;
type TabFilter = 'created' | 'joined';

const getCategoryConfig = (category: PlanCategory) => {
  const configs: Record<PlanCategory, { color: string; emoji: string }> = {
    [PlanCategory.CAFE]: { color: '#FEF3C7', emoji: '☕' },
    [PlanCategory.FIESTA]: { color: '#FCE7F3', emoji: '🎉' },
    [PlanCategory.ESTUDIO]: { color: '#DBEAFE', emoji: '📚' },
    [PlanCategory.DEPORTE]: { color: '#D1FAE5', emoji: '⚽' },
    [PlanCategory.CINE]: { color: '#E0E7FF', emoji: '🎬' },
    [PlanCategory.MUSICA]: { color: '#FAE8FF', emoji: '🎵' },
    [PlanCategory.VIAJE]: { color: '#FED7AA', emoji: '✈️' },
    [PlanCategory.COMIDA]: { color: '#FEE2E2', emoji: '🍕' },
    [PlanCategory.OTRO]: { color: '#E5E7EB', emoji: '⭐' },
  };
  return configs[category] || configs[PlanCategory.OTRO];
};

const getStatusConfig = (status: PlanStatus) => {
  switch (status) {
    case PlanStatus.ACTIVE:
      return { label: 'Activo', color: '#4CAF50', bg: '#E8F5E9' };
    case PlanStatus.CANCELLED:
      return { label: 'Cancelado', color: '#F44336', bg: '#FFEBEE' };
    case PlanStatus.FINISHED:
      return { label: 'Finalizado', color: '#FF9800', bg: '#FFF3E0' };
    default:
      return { label: status, color: '#9E9E9E', bg: '#F5F5F5' };
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (time: string) => time.slice(0, 5);

export const MyPlansScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabFilter>('created');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'default' | 'danger';
    onConfirm: () => void;
  }>({ visible: false, title: '', message: '', type: 'default', onConfirm: () => { } });

  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const { myPlans, fetchMyPlans, cancelPlan, deletePlan, leavePlan } = usePlanStore();

  const fetchPlans = useCallback(async () => {
    await fetchMyPlans();
    setLoading(false);
    setRefreshing(false);
  }, [fetchMyPlans]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const filteredPlans = myPlans.filter(plan =>
    activeTab === 'created' ? plan.isCreator : !plan.isCreator
  );

  const handleCancelPlan = (plan: Plan) => {
    setConfirmModal({
      visible: true,
      title: 'Cancelar Plan',
      message: `¿Estás seguro de que deseas cancelar "${plan.title}"? Los participantes serán notificados.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, visible: false }));
        setActionLoading(plan.id);
        try {
          await cancelPlan(plan.id);
          setSuccessModal({ visible: true, title: 'Plan Cancelado', message: 'El plan ha sido cancelado exitosamente.' });
        } catch (error) {
          console.error('Error cancelling plan:', error);
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleDeletePlan = (plan: Plan) => {
    setConfirmModal({
      visible: true,
      title: 'Eliminar Plan',
      message: `¿Estás seguro de que deseas eliminar "${plan.title}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, visible: false }));
        setActionLoading(plan.id);
        try {
          await deletePlan(plan.id);
          setSuccessModal({ visible: true, title: 'Plan Eliminado', message: 'El plan ha sido eliminado exitosamente.' });
        } catch (error) {
          console.error('Error deleting plan:', error);
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleLeavePlan = (plan: Plan) => {
    setConfirmModal({
      visible: true,
      title: 'Salir del Plan',
      message: `¿Estás seguro de que deseas salir de "${plan.title}"?`,
      type: 'default',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, visible: false }));
        setActionLoading(plan.id);
        try {
          await leavePlan(plan.id);
          setSuccessModal({ visible: true, title: 'Has salido', message: 'Has salido del plan exitosamente.' });
        } catch (error) {
          console.error('Error leaving plan:', error);
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const renderPlanCard = (plan: Plan) => {
    const categoryConfig = getCategoryConfig(plan.category);
    const statusConfig = getStatusConfig(plan.status);
    const isLoading = actionLoading === plan.id;
    const isCreated = activeTab === 'created';

    return (
      <View key={plan.id} style={styles.planCard}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={[styles.emojiContainer, { backgroundColor: categoryConfig.color }]}>
            <Text style={styles.emoji}>{categoryConfig.emoji}</Text>
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>{plan.title}</Text>
            <View style={styles.cardMeta}>
              <MaterialCommunityIcons name="calendar" size={14} color="#6B7280" />
              <Text style={styles.cardMetaText}>{formatDate(plan.date)}</Text>
              <Text style={styles.cardMetaDot}>•</Text>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
              <Text style={styles.cardMetaText}>{formatTime(plan.start_time)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>

        {/* Info row */}
        <View style={styles.cardInfoRow}>
          {plan.location_name && (
            <View style={styles.infoChip}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#6B7280" />
              <Text style={styles.infoChipText} numberOfLines={1}>{plan.location_name}</Text>
            </View>
          )}
          <View style={styles.infoChip}>
            <MaterialCommunityIcons name="account-group" size={14} color="#6B7280" />
            <Text style={styles.infoChipText}>
              {plan.participantsCount || 0}{plan.max_participants ? `/${plan.max_participants}` : ''}
            </Text>
          </View>
        </View>

        {/* Participant avatars */}
        {(plan.participantsCount || 0) > 0 && (
          <View style={styles.avatarsRow}>
            {plan.participants
              ?.filter(p => p.left_at === null)
              .slice(0, 5)
              .map((p, index) => (
                p.user?.avatarUrl ? (
                  <Image
                    key={p.id}
                    source={{ uri: p.user.avatarUrl }}
                    style={[styles.avatar, { marginLeft: index > 0 ? -8 : 0 }]}
                  />
                ) : (
                  <View key={p.id} style={[styles.avatarPlaceholder, { marginLeft: index > 0 ? -8 : 0 }]}>
                    <MaterialCommunityIcons name="account" size={16} color="#9CA3AF" />
                  </View>
                )
              ))}
            {(plan.participantsCount || 0) > 5 && (
              <Text style={styles.moreCount}>+{(plan.participantsCount || 0) - 5}</Text>
            )}
          </View>
        )}

        {/* Actions */}
        {isLoading ? (
          <View style={styles.actionsRow}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : isCreated ? (
          <View style={styles.actionsRow}>
            {plan.status === PlanStatus.ACTIVE && (
              <>
                <TouchableOpacity
                  style={styles.actionButtonPrimary}
                  onPress={() => navigation.navigate('ManagePlanParticipants', { planId: plan.id })}
                  activeOpacity={0.7}>
                  <MaterialCommunityIcons name="account-group" size={16} color={colors.white} />
                  <Text style={styles.actionButtonPrimaryText}>Participanstes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonEdit}
                  onPress={() => navigation.navigate('EditPlan', { planId: plan.id })}
                  activeOpacity={0.7}>
                  <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonOutline}
                  onPress={() => handleCancelPlan(plan)}
                  activeOpacity={0.7}>
                  <MaterialCommunityIcons name="cancel" size={16} color="#F44336" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.actionButtonOutline}
              onPress={() => handleDeletePlan(plan)}
              activeOpacity={0.7}>
              <MaterialCommunityIcons name="delete-outline" size={16} color="#F44336" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionsRow}>
            {plan.status === PlanStatus.ACTIVE && (
              <TouchableOpacity
                style={[styles.actionButtonOutline, styles.leaveButton]}
                onPress={() => handleLeavePlan(plan)}
                activeOpacity={0.7}>
                <MaterialCommunityIcons name="exit-run" size={16} color="#F44336" />
                <Text style={styles.leaveButtonText}>Salir del Plan</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Planes</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Filter */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'created' && styles.tabActive]}
          onPress={() => setActiveTab('created')}
          activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="creation"
            size={18}
            color={activeTab === 'created' ? colors.white : colors.primary}
          />
          <Text style={[styles.tabText, activeTab === 'created' && styles.tabTextActive]}>
            Creados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'joined' && styles.tabActive]}
          onPress={() => setActiveTab('joined')}
          activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="account-check"
            size={18}
            color={activeTab === 'joined' ? colors.white : colors.primary}
          />
          <Text style={[styles.tabText, activeTab === 'joined' && styles.tabTextActive]}>
            Unidos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando planes...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}>
          {filteredPlans.length === 0 ? (
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons
                name={activeTab === 'created' ? 'calendar-plus' : 'calendar-heart'}
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'created'
                  ? 'No has creado planes aún'
                  : 'No te has unido a ningún plan'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'created'
                  ? 'Crea un plan para compartir con otros estudiantes'
                  : 'Explora planes disponibles y únete a los que te interesen'}
              </Text>
              {activeTab === 'created' && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate('CreatePlan')}
                  activeOpacity={0.8}>
                  <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
                  <Text style={styles.createButtonText}>Crear Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredPlans.map(renderPlanCard)
          )}
        </ScrollView>
      )}

      {/* Modals */}
      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        icon="alert-circle"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
      />
      <SuccessModal
        visible={successModal.visible}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  tabTextActive: {
    color: colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
    marginTop: 12,
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
    paddingHorizontal: 20,
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

  // Plan Card
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardMetaText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
  },
  cardMetaDot: {
    fontSize: 13,
    color: '#D1D5DB',
    marginHorizontal: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
  },

  // Info row
  cardInfoRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  infoChipText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
    maxWidth: 120,
  },

  // Avatars
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCount: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: '#9CA3AF',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },
  actionButtonEdit: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonOutline: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveButton: {
    flex: 1,
    flexDirection: 'row',
    width: undefined,
    gap: 6,
    borderColor: '#FECACA',
  },
  leaveButtonText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#F44336',
  },
});
