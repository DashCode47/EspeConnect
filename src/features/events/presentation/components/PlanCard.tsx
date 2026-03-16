import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Plan, PlanCategory, PlanParticipant } from '../../domain/entities/plan.entity';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';

interface PlanCardProps {
  plan: Plan;
  onPress: () => void;
  onJoin: () => void;
}

const getCategoryConfig = (category: PlanCategory) => {
  const configs: Record<PlanCategory, { color: string; emoji: string; accent: string }> = {
    [PlanCategory.CAFE]:    { color: '#FFF3D4', emoji: '☕', accent: '#F59E0B' },
    [PlanCategory.FIESTA]:  { color: '#FFE4F3', emoji: '🎉', accent: '#EC4899' },
    [PlanCategory.ESTUDIO]: { color: '#DBEAFE', emoji: '📚', accent: '#3B82F6' },
    [PlanCategory.DEPORTE]: { color: '#DCFCE7', emoji: '⚽', accent: '#22C55E' },
    [PlanCategory.CINE]:    { color: '#EDE9FE', emoji: '🎬', accent: '#8B5CF6' },
    [PlanCategory.MUSICA]:  { color: '#F3E8FF', emoji: '🎵', accent: '#A855F7' },
    [PlanCategory.VIAJE]:   { color: '#FFEDD5', emoji: '✈️', accent: '#F97316' },
    [PlanCategory.COMIDA]:  { color: '#FEE2E2', emoji: '🍕', accent: '#EF4444' },
    [PlanCategory.OTRO]:    { color: '#F1F5F9', emoji: '⭐', accent: '#94A3B8' },
  };
  return configs[category] || configs[PlanCategory.OTRO];
};

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

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onPress, onJoin }) => {
  const cat = getCategoryConfig(plan.category);
  const activeParticipants = (plan.participants as PlanParticipant[])?.filter(p => p.leftAt === null) || [];
  const participantAvatars = activeParticipants.slice(0, 3);
  const additionalCount = Math.max((plan.participantsCount || 0) - 3, 0);
  const hasParticipants = (plan.participantsCount || 0) > 0;

  const formatTime = (t: string) => t.slice(0, 5);
  const timeDisplay = plan.endTime
    ? `${formatTime(plan.startTime)} – ${formatTime(plan.endTime)}`
    : formatTime(plan.startTime);

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>

      {/* ── Colored top block ── */}
      <View style={[styles.top, { backgroundColor: cat.color }]}>
        <Text style={styles.emoji}>{cat.emoji}</Text>

        {/* Participant badge — top right corner */}
        <View style={[styles.countBadge, plan.isFull && styles.countBadgeFull]}>
          <MaterialCommunityIcons
            name={plan.isFull ? 'fire' : 'account-group'}
            size={11}
            color={plan.isFull ? colors.white : colors.primary}
          />
          <Text style={[styles.countText, plan.isFull && styles.countTextFull]}>
            {plan.participantsCount}{plan.maxParticipants ? `/${plan.maxParticipants}` : ''}
          </Text>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>
        {/* Category + time row */}
        <View style={styles.metaTop}>
          <View style={[styles.catChip, { backgroundColor: cat.accent + '20' }]}>
            <Text style={[styles.catLabel, { color: cat.accent }]}>
              {getCategoryLabel(plan.category)}
            </Text>
          </View>
          <Text style={styles.time}>{formatDate(plan.date)} · {timeDisplay}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {plan.title}
        </Text>

        {/* Location */}
        {plan.locationName && (
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={11} color="#9CA3AF" />
            <Text style={styles.locationText} numberOfLines={1}>{plan.locationName}</Text>
          </View>
        )}
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        {/* Avatars */}
        <View style={styles.avatarsRow}>
          {hasParticipants ? (
            <>
              {participantAvatars.map((p: PlanParticipant, index: number) =>
                p.user?.avatarUrl ? (
                  <Image
                    key={p.id}
                    source={{ uri: p.user.avatarUrl }}
                    style={[styles.avatar, index > 0 && styles.avatarOverlap]}
                  />
                ) : (
                  <View
                    key={p.id}
                    style={[styles.avatar, styles.avatarEmpty, index > 0 && styles.avatarOverlap]}>
                    <MaterialCommunityIcons name="account" size={12} color="#CBD5E1" />
                  </View>
                )
              )}
              {additionalCount > 0 && (
                <Text style={styles.moreCount}>+{additionalCount}</Text>
              )}
            </>
          ) : (
            <Text style={styles.beFirst}>Sé el primero</Text>
          )}
        </View>

        {/* Join button */}
        {plan.isCreator ? (
          <View style={[styles.btn, styles.btnCreator]}>
            <Text style={[styles.btnText, styles.btnTextCreator]}>Tu Plan</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.btn,
              plan.isParticipating && styles.btnJoined,
              plan.isRequested  && styles.btnRequested,
              plan.isFull && !plan.isParticipating && !plan.isRequested && styles.btnFull,
            ]}
            onPress={onJoin}
            disabled={plan.isFull && !plan.isParticipating && !plan.isRequested}
            activeOpacity={0.8}>
            <Text style={[
              styles.btnText,
              plan.isParticipating && styles.btnTextJoined,
              plan.isRequested  && styles.btnTextRequested,
              plan.isFull && !plan.isParticipating && !plan.isRequested && styles.btnTextFull,
            ]}>
              {plan.isParticipating ? '✓ Unido'
                : plan.isRequested  ? '⏳ Pedido'
                : plan.isFull       ? 'Lleno'
                : '¡Me uno!'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  // ── Top colored block ──────────────────
  top: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  countBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeFull: {
    backgroundColor: '#EF4444',
  },
  countText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  countTextFull: {
    color: colors.white,
  },

  // ── Body ──────────────────────────────
  body: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 4,
  },
  metaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  catChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catLabel: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    letterSpacing: 0.2,
  },
  time: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  title: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    lineHeight: 17,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
    flex: 1,
  },

  // ── Footer ────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  avatarOverlap: {
    marginLeft: -7,
  },
  avatarEmpty: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCount: {
    marginLeft: 4,
    fontSize: 10,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: '#94A3B8',
  },
  beFirst: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#CBD5E1',
    fontStyle: 'italic',
  },

  // ── Join button ───────────────────────
  btn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  btnCreator: {
    backgroundColor: `${colors.primary}12`,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnJoined: {
    backgroundColor: `${colors.primary}15`,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnRequested: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnFull: {
    backgroundColor: '#F1F5F9',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  btnTextCreator: { color: colors.primary },
  btnTextJoined:  { color: colors.primary },
  btnTextRequested: { color: '#B45309' },
  btnTextFull:    { color: '#94A3B8' },
});
