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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../config/colors';
import { FONT_FAMILY } from '../../config/globalStyles';
import { Plan, PlanParticipant, PlanParticipantRole } from '../../types/plan.types';
import { planService } from '../../services/plan.service';
import { EventStackParamList } from '../../navigation/types';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { SuccessModal } from '../../components/modals/SuccessModal';

type NavigationProp = NativeStackNavigationProp<EventStackParamList>;
type ScreenRouteProp = RouteProp<EventStackParamList, 'ManagePlanParticipants'>;

export const ManagePlanParticipantsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { planId } = route.params;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [participants, setParticipants] = useState<PlanParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ visible: false, title: '', message: '', onConfirm: () => {} });

  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const fetchData = useCallback(async () => {
    try {
      const [planData, participantsData] = await Promise.all([
        planService.getPlanById(planId),
        planService.getParticipants(planId),
      ]);
      setPlan(planData);
      setParticipants(participantsData);
    } catch (error) {
      console.error('Error fetching plan data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRemoveParticipant = (participant: PlanParticipant) => {
    const name = participant.user?.name || 'este participante';
    setConfirmModal({
      visible: true,
      title: 'Remover Participante',
      message: `¿Estás seguro de que deseas remover a ${name} del plan?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, visible: false }));
        setActionLoading(participant.id);
        try {
          await planService.removeParticipant(planId, participant.user_id);
          setSuccessModal({
            visible: true,
            title: 'Participante Removido',
            message: `${name} ha sido removido del plan.`,
          });
          fetchData();
        } catch (error) {
          console.error('Error removing participant:', error);
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const activeParticipants = participants.filter(p => p.left_at === null);
  const participantCount = activeParticipants.length;
  const availableSpots = plan?.max_participants
    ? Math.max(plan.max_participants - participantCount, 0)
    : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Participantes</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Participantes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}>

        {/* Plan info */}
        {plan && (
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>{plan.title}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{participantCount}</Text>
            <Text style={styles.statLabel}>Participantes</Text>
          </View>
          {availableSpots !== null && (
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{availableSpots}</Text>
              <Text style={styles.statLabel}>Lugares disponibles</Text>
            </View>
          )}
        </View>

        {/* Participants list */}
        {activeParticipants.length === 0 ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="account-group-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Sin participantes</Text>
            <Text style={styles.emptySubtitle}>
              Aún no se ha unido nadie a este plan
            </Text>
          </View>
        ) : (
          <View style={styles.participantsList}>
            <Text style={styles.sectionTitle}>
              {activeParticipants.length} participante{activeParticipants.length !== 1 ? 's' : ''}
            </Text>
            {activeParticipants.map((participant) => {
              const isCreator = participant.role === PlanParticipantRole.CREATOR;
              const isRemoving = actionLoading === participant.id;

              return (
                <View key={participant.id} style={styles.participantCard}>
                  <View style={styles.participantInfo}>
                    {participant.user?.avatarUrl ? (
                      <Image
                        source={{ uri: participant.user.avatarUrl }}
                        style={styles.participantAvatar}
                      />
                    ) : (
                      <View style={styles.participantAvatarPlaceholder}>
                        <MaterialCommunityIcons name="account" size={20} color="#9CA3AF" />
                      </View>
                    )}
                    <View style={styles.participantDetails}>
                      <Text style={styles.participantName}>
                        {participant.user?.name || 'Usuario'}
                      </Text>
                      {isCreator && (
                        <View style={styles.creatorBadge}>
                          <MaterialCommunityIcons name="crown" size={12} color="#F59E0B" />
                          <Text style={styles.creatorBadgeText}>Organizador</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {!isCreator && (
                    isRemoving ? (
                      <ActivityIndicator size="small" color="#F44336" />
                    ) : (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveParticipant(participant)}
                        activeOpacity={0.7}>
                        <MaterialCommunityIcons name="account-remove" size={18} color="#F44336" />
                      </TouchableOpacity>
                    )
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
        icon="alert-circle"
        confirmText="Remover"
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Plan info
  planInfo: {
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statNumber: {
    fontSize: 28,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
    marginTop: 4,
  },

  // Empty
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },

  // Participants list
  participantsList: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  participantAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantDetails: {
    marginLeft: 12,
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  creatorBadgeText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#F59E0B',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
