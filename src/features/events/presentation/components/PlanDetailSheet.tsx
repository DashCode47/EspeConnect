import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { usePlanDetailSheet } from '../hooks/usePlanDetailSheet';
import { PlanCategory, PlanParticipant } from '../../domain/entities/plan.entity';
import { PlanCommentPreview } from './PlanCommentPreview';
import { usePlanComments } from '../hooks/usePlanComments';

interface PlanDetailSheetProps {
  planId: string | null;
  visible: boolean;
  onClose: () => void;
  onJoin: () => void;
  onViewComments?: (planId: string, planTitle: string) => void;
}

const CATEGORY_CONFIG: Record<PlanCategory, { label: string; bg: string; text: string }> = {
  [PlanCategory.CAFE]:    { label: 'Café',    bg: '#FFF3D4', text: '#92400E' },
  [PlanCategory.FIESTA]:  { label: 'Fiesta',  bg: '#FFE4F3', text: '#9D174D' },
  [PlanCategory.ESTUDIO]: { label: 'Estudio', bg: '#DBEAFE', text: '#1E40AF' },
  [PlanCategory.DEPORTE]: { label: 'Deporte', bg: '#DCFCE7', text: '#166534' },
  [PlanCategory.CINE]:    { label: 'Cine',    bg: '#EDE9FE', text: '#5B21B6' },
  [PlanCategory.MUSICA]:  { label: 'Música',  bg: '#F3E8FF', text: '#7E22CE' },
  [PlanCategory.VIAJE]:   { label: 'Viaje',   bg: '#FFEDD5', text: '#9A3412' },
  [PlanCategory.COMIDA]:  { label: 'Comida',  bg: '#FEE2E2', text: '#991B1B' },
  [PlanCategory.OTRO]:    { label: 'Otro',    bg: '#F1F5F9', text: '#475569' },
};

const getCategoryConfig = (category: PlanCategory) =>
  CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG[PlanCategory.OTRO];

export const PlanDetailSheet: React.FC<PlanDetailSheetProps> = ({
  planId,
  visible,
  onClose,
  onJoin,
  onViewComments,
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

  const catConfig = plan ? getCategoryConfig(plan.category as PlanCategory) : null;
  const canComment = !!(plan?.isParticipating || plan?.isCreator);

  const { comments, loading: commentsLoading } = usePlanComments({
    planId,
    enabled: visible && canComment,
    previewLimit: 3,
  });

  const handleViewComments = () => {
    if (planId && plan && onViewComments) {
      onViewComments(planId, plan.title);
      setTimeout(() => handleClose(), 100);
    }
  };

  if (!plan) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Backdrop — tapping it closes the sheet */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet — sits at the bottom, no gesture wrappers that compete with scroll */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>

        {/* Drag Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.emojiText}>{getCategoryEmoji(plan.category)}</Text>
              </View>
            </View>

            <View style={styles.storeInfo}>
              <View style={[styles.categoryChip, catConfig && { backgroundColor: catConfig.bg }]}>
                <Text style={[styles.categoryText, catConfig && { color: catConfig.text }]}>
                  {catConfig?.label ?? ''}
                </Text>
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

          {/* Description */}
          {plan.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{plan.description}</Text>
            </View>
          )}

          {/* Info rows */}
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
                  {formatTime(plan.startTime)}{plan.endTime ? ` - ${formatTime(plan.endTime)}` : ''}
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
                  {plan.locationName || 'Sin dirección definida'}
                </Text>
              </View>
            </View>
          </View>

          {/* Participants */}
          <View style={styles.participantsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Participantes</Text>
              <Text style={styles.participantsCount}>
                {plan.participantsCount || 0}/{plan.maxParticipants || '∞'}
              </Text>
            </View>

            <View style={styles.avatarsContainer}>
              {displayParticipants.map((participant: PlanParticipant, index: number) => (
                <View
                  key={participant.id}
                  style={[styles.attendeeAvatar, { marginLeft: index > 0 ? -12 : 0 }]}>
                  {participant.user?.avatarUrl ? (
                    <Image source={{ uri: participant.user.avatarUrl }} style={styles.attendeeAvatarImage} />
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

          {/* Comments Preview */}
          <PlanCommentPreview
            comments={comments}
            loading={commentsLoading}
            canComment={canComment}
            onViewAll={handleViewComments}
            onJoinToComment={handleJoinPress}
          />
        </ScrollView>

        {/* CTA Button */}
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
                plan.isParticipating && styles.ctaButtonLeave,
                plan.isRequested && styles.ctaButtonRequested,
                plan.isFull && !plan.isParticipating && !plan.isRequested && styles.ctaButtonDisabled,
              ]}
              onPress={handleJoinPress}
              disabled={joiningLoading || plan.isRequested || (plan.isFull && !plan.isParticipating)}
              activeOpacity={0.9}
            >
              {joiningLoading ? (
                <ActivityIndicator size="small" color="#111814" />
              ) : plan.isRequested ? (
                <>
                  <MaterialCommunityIcons name="clock-outline" size={22} color="#B45309" />
                  <Text style={[styles.ctaButtonText, styles.ctaButtonTextRequested]}>
                    Solicitud enviada
                  </Text>
                </>
              ) : plan.isParticipating ? (
                <>
                  <MaterialCommunityIcons name="exit-to-app" size={22} color="#EF4444" />
                  <Text style={[styles.ctaButtonText, styles.ctaButtonTextLeave]}>
                    Salir del plan
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.ctaButtonText}>
                    {plan.isFull ? 'Plan lleno' : plan.requiresApproval ? 'Solicitar unirme' : '¡Me uno ahora!'}
                  </Text>
                  {!plan.isFull && (
                    <MaterialCommunityIcons
                      name={plan.requiresApproval ? 'send' : 'hand-wave'}
                      size={22}
                      color="#111814"
                    />
                  )}
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    paddingBottom: 100,
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
  ctaButtonLeave: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonTextLeave: {
    color: '#EF4444',
    fontSize: 16,
  },
  ctaButtonRequested: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#111814',
  },
  ctaButtonTextRequested: {
    color: '#B45309',
    fontSize: 16,
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
