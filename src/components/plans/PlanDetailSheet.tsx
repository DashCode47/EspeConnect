import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../config/colors';
import { FONT_FAMILY } from '../../config/globalStyles';
import { Plan } from '../../types/plan.types';
import { planService } from '../../services/plan.service';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PlanDetailSheetProps {
  planId: string | null;
  visible: boolean;
  onClose: () => void;
  onJoin: () => void;
}

export const PlanDetailSheet: React.FC<PlanDetailSheetProps> = ({
  planId,
  visible,
  onClose,
  onJoin,
}) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible && planId) {
      // Ensure it starts from bottom
      slideAnim.setValue(SCREEN_HEIGHT);
      fetchPlanDetails();
      // Animate in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else if (!visible) {
      // Animate out
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

  const formatTime = (time: string) => {
    return time.slice(0, 5); // "HH:MM:SS" -> "HH:MM"
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const getCategoryEmoji = () => {
    if (!plan) return '📅';
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
    return emojis[plan.category] || '📅';
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
      await fetchPlanDetails(); // Refresh data
    } catch (error) {
      console.error('Error in handleJoinPress:', error);
    } finally {
      setJoiningLoading(false);
    }
  };

  if (!visible || !plan) return null;

  const activeParticipants = plan.participants?.filter(p => p.left_at === null) || [];
  const displayParticipants = activeParticipants.slice(0, 3);
  const additionalCount = Math.max(activeParticipants.length - 3, 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.8}>
          <View style={styles.closeButtonInner}>
            <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
          </View>
        </TouchableOpacity>

        {/* Sheet Container */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          {/* Floating Emoji */}
          <Animated.View style={styles.floatingEmoji}>
            <View style={styles.emojiCard}>
              <Text style={styles.emojiText}>{getCategoryEmoji()}</Text>
            </View>
          </Animated.View>

          {/* Sheet Content */}
          <View style={styles.sheet}>
            {/* Decorative blob */}
            <LinearGradient
              colors={[`${colors.accent}40`, `${colors.accent}10`]}
              style={styles.decorativeBlob}
            />

            {/* Handle */}
            <View style={styles.handle} />

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{plan.title}</Text>
                <View style={styles.underline} />
              </View>

              {/* Organizer */}
              <View style={styles.organizerRow}>
                {plan.creator?.avatarUrl ? (
                  <Image
                    source={{ uri: plan.creator.avatarUrl }}
                    style={styles.organizerAvatar}
                  />
                ) : (
                  <View style={[styles.organizerAvatar, styles.organizerAvatarPlaceholder]}>
                    <MaterialCommunityIcons name="account" size={16} color={colors.primary} />
                  </View>
                )}
                <Text style={styles.organizerText}>
                  Organizado por{' '}
                  <Text style={styles.organizerName}>@{plan.creator?.name || 'Usuario'}</Text>
                </Text>
              </View>

              {/* Info Chips */}
              <View style={styles.chipsContainer}>
                {/* Time Chip */}
                <View style={styles.chip}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
                  <Text style={styles.chipText}>
                    {plan.end_time
                      ? `${formatTime(plan.start_time)} - ${formatTime(plan.end_time)}`
                      : formatTime(plan.start_time)}
                  </Text>
                </View>

                {/* Location Chip */}
                {plan.location_name && (
                  <View style={styles.chip}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.chipText} numberOfLines={1}>
                      {plan.location_name}
                    </Text>
                  </View>
                )}

                {/* Date Chip */}
                <View style={styles.chip}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.chipText}>{formatDate(plan.date)}</Text>
                </View>
              </View>

              {/* Description */}
              {plan.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.description}>{plan.description}</Text>
                </View>
              )}

              {/* Attendees Section */}
              <View style={styles.attendeesSection}>
                <LinearGradient
                  colors={['rgba(248, 183, 53, 0.05)', 'rgba(248, 183, 53, 0.02)']}
                  style={styles.attendeesGradient}
                />
                <View style={styles.attendeesContent}>
                  <View style={styles.attendeesLeft}>
                    <Text style={styles.attendeesLabel}>YA SE UNIERON</Text>
                    <View style={styles.avatarsRow}>
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
                              <MaterialCommunityIcons
                                name="account"
                                size={20}
                                color={colors.primary}
                              />
                            </View>
                          )}
                        </View>
                      ))}
                      {additionalCount > 0 && (
                        <View style={[styles.attendeeAvatar, styles.attendeeAvatarCounter]}>
                          <Text style={styles.attendeeAvatarCounterText}>+{additionalCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.7}>
                    <Text style={styles.viewAllText}>Ver todos</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Spacer for button */}
              <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom CTA */}
            <View style={styles.bottomCTA}>
              <TouchableOpacity
                style={[
                  styles.joinButton,
                  plan.isParticipating && styles.joinButtonActive,
                  plan.isFull && !plan.isParticipating && styles.joinButtonDisabled,
                ]}
                onPress={handleJoinPress}
                disabled={joiningLoading || (plan.isFull && !plan.isParticipating)}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={
                    plan.isParticipating
                      ? [`${colors.primary}30`, `${colors.primary}20`]
                      : [colors.accent, `${colors.accent}CC`]
                  }
                  style={styles.joinButtonGradient}>
                  {joiningLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={colors.primaryDark} />
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.joinButtonText, plan.isParticipating && styles.joinButtonTextActive]}>
                        {plan.isParticipating ? '✓ Ya estoy unido' : plan.isFull ? 'Plan lleno' : '¡Me uno!'}
                      </Text>
                      {!plan.isParticipating && !plan.isFull && (
                        <MaterialCommunityIcons name="hand-wave" size={22} color={colors.primaryDark} />
                      )}
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.disclaimer}>
                Sin compromiso, puedes salirte cuando quieras.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 100,
  },
  closeButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sheetContainer: {
    minHeight: SCREEN_HEIGHT * 0.6,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  floatingEmoji: {
    position: 'absolute',
    top: -60,
    right: 32,
    zIndex: 50,
  },
  emojiCard: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    transform: [{ rotate: '-12deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: `${colors.primary}30`,
  },
  emojiText: {
    fontSize: 36,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  decorativeBlob: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.5,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  underline: {
    height: 12,
    width: '60%',
    backgroundColor: `${colors.primary}40`,
    marginTop: -8,
    borderRadius: 6,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  organizerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  organizerAvatarPlaceholder: {
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
  },
  organizerName: {
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: '#374151',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#4B5563',
    lineHeight: 24,
  },
  attendeesSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
  },
  attendeesGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  attendeesContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeesLeft: {
    gap: 12,
  },
  attendeesLabel: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.white,
    overflow: 'hidden',
  },
  attendeeAvatarImage: {
    width: '100%',
    height: '100%',
  },
  attendeeAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: `${colors.primary}30`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeeAvatarCounter: {
    backgroundColor: `${colors.primary}30`,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -12,
  },
  attendeeAvatarCounterText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  bottomCTA: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  joinButton: {
    borderRadius: 20,
    // Note: removed overflow: 'hidden' to debug clipping, 
    // adding borderRadius to gradient instead
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  joinButtonActive: {
    shadowOpacity: 0.15,
  },
  joinButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 72, // Increased explicit height
    borderRadius: 20, // Match parent
    paddingHorizontal: 24,
  },
  joinButtonText: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    letterSpacing: -0.5,
    includeFontPadding: false, // Essential for Android, harmless for iOS
    textAlignVertical: 'center',
  },
  joinButtonTextActive: {
    color: colors.primary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
});
