import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../config/colors';
import { FONT_FAMILY } from '../../config/globalStyles';
import { usePlanDetailSheet } from '../../hooks/usePlanDetailSheet';
import { PlanCategory } from '../../types/plan.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PlanDetailSheetProps {
  planId: string | null;
  visible: boolean;
  onClose: () => void;
  onJoin: () => void;
}

const getCategoryLabel = (category: PlanCategory): string => {
  const labels: Record<PlanCategory, string> = {
    [PlanCategory.CAFE]: 'Café',
    [PlanCategory.FIESTA]: 'Fiesta',
    [PlanCategory.ESTUDIO]: 'Estudio',
    [PlanCategory.DEPORTE]: 'Deporte',
    [PlanCategory.CINE]: 'Cine',
    [PlanCategory.MUSICA]: 'Música',
    [PlanCategory.VIAJE]: 'Viaje',
    [PlanCategory.COMIDA]: 'Comida',
    [PlanCategory.OTRO]: 'Otro',
  };
  return labels[category] || 'Otro';
};

export const PlanDetailSheet: React.FC<PlanDetailSheetProps> = ({
  planId,
  visible,
  onClose,
  onJoin,
}) => {
  const insets = useSafeAreaInsets();
  const {
    plan,
    joiningLoading,
    handleClose,
    handleJoinPress,
    getCategoryEmoji,
    formatTime,
    formatDate,
    displayParticipants,
    additionalCount,
  } = usePlanDetailSheet(planId, visible, onClose, onJoin);

  if (!plan) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[
            styles.modalContainer,
            { paddingBottom: insets.bottom + 16 }
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Structure identical to EstablishmentModal */}
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.emojiText}>{getCategoryEmoji(plan.category)}</Text>
                </View>
              </View>

              <View style={styles.storeInfo}>
                <View style={styles.categoryContainer}>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryText}>
                      {getCategoryLabel(plan.category as PlanCategory)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.storeName}>{plan.title}</Text>

                <View style={styles.organizerRow}>
                  {plan.creator?.avatarUrl ? (
                    <Image source={{ uri: plan.creator.avatarUrl }} style={styles.miniAvatar} />
                  ) : (
                    <View style={styles.miniAvatarPlaceholder}>
                      <MaterialCommunityIcons name="account" size={12} color={colors.primary} />
                    </View>
                  )}
                  <Text style={styles.storeSubtitle}>
                    Organizado por {plan.creator?.name || 'Usuario'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description follows EstablishmentModal's descriptionContainer style */}
            {plan.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{plan.description}</Text>
              </View>
            )}

            {/* Info Section - Clean icons and labels */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.socialIconContainer}>
                  <MaterialCommunityIcons name="calendar-multiselect" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.socialLabel}>FECHA</Text>
                  <Text style={styles.infoValue}>{formatDate(plan.date)}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.socialIconContainer}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.socialLabel}>HORARIO</Text>
                  <Text style={styles.infoValue}>
                    {formatTime(plan.start_time)}{plan.end_time ? ` - ${formatTime(plan.end_time)}` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={[styles.socialIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.socialLabel, { color: '#EF4444' }]}>UBICACIÓN</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {plan.location_name || 'Sin dirección definida'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Participants Grid */}
            <View style={styles.participantsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Participantes</Text>
                <Text style={styles.participantsCount}>
                  {plan.participantsCount || 0}/{plan.max_participants || '∞'}
                </Text>
              </View>

              <View style={styles.avatarsContainer}>
                {displayParticipants.map((participant, index) => (
                  <View
                    key={participant.id}
                    style={[styles.attendeeAvatar, { marginLeft: index > 0 ? -12 : 0 }]}>
                    {participant.user?.avatarUrl ? (
                      <Image
                        source={{ uri: participant.user.avatarUrl }}
                        style={styles.attendeeAvatarImage}
                      />
                    ) : (
                      <View style={styles.attendeeAvatarPlaceholder}>
                        <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
                      </View>
                    )}
                  </View>
                ))}
                {additionalCount > 0 && (
                  <View style={[styles.attendeeAvatar, styles.avatarCounter]}>
                    <Text style={styles.counterText}>+{additionalCount}</Text>
                  </View>
                )}
                {(plan.participantsCount || 0) === 0 && (
                  <Text style={styles.emptyText}>Sé el primero en unirte</Text>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Primary Action Button identical to EstablishmentModal's ctaButton */}
          <View style={styles.ctaContainer}>
            {plan.isCreator ? (
              <View style={styles.creatorBtn}>
                <MaterialCommunityIcons name="crown" size={24} color={colors.primary} />
                <Text style={styles.ctaButtonText}>Es tu Plan</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  plan.isParticipating && styles.ctaButtonDisabled,
                  plan.isFull && !plan.isParticipating && styles.ctaButtonDisabled,
                ]}
                onPress={handleJoinPress}
                disabled={joiningLoading || (plan.isFull && !plan.isParticipating)}
                activeOpacity={0.9}
              >
                {joiningLoading ? (
                  <ActivityIndicator size="small" color="#111814" />
                ) : (
                  <>
                    <Text style={styles.ctaButtonText}>
                      {plan.isParticipating ? '✓ Ya estoy unido' : plan.isFull ? 'Plan lleno' : '¡Me uno ahora!'}
                    </Text>
                    {!plan.isParticipating && !plan.isFull && (
                      <MaterialCommunityIcons name="hand-wave" size={24} color="#111814" />
                    )}
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiText: {
    fontSize: 40,
  },
  storeInfo: {
    flex: 1,
    paddingTop: 4,
  },
  categoryContainer: {
    marginBottom: 4,
  },
  categoryChip: {
    backgroundColor: 'rgba(46, 238, 130, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#104e33',
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  storeName: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#111814',
    lineHeight: 30,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  miniAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  miniAvatarPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeSubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
  },
  descriptionContainer: {
    backgroundColor: '#F6F8F7',
    padding: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#111814',
    lineHeight: 24,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(46, 238, 130, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialLabel: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#6B7280',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: '#111814',
  },
  participantsSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#111814',
  },
  participantsCount: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  attendeeAvatarImage: {
    width: '100%',
    height: '100%',
  },
  attendeeAvatarPlaceholder: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCounter: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -12,
  },
  counterText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#475569',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#94A3B8',
    marginLeft: 8,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#111814',
  },
  creatorBtn: {
    backgroundColor: 'rgba(46, 238, 130, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
