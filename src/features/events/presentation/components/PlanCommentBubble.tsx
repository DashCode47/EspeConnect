import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { PlanChatMessage } from '../../domain/entities/plan.entity';

interface PlanCommentBubbleProps {
  comment: PlanChatMessage;
  isOwn: boolean;
  isCreator?: boolean;
}

export const PlanCommentBubble: React.FC<PlanCommentBubbleProps> = ({
  comment,
  isOwn,
  isCreator = false,
}) => {
  const timeStr = new Date(comment.createdAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, isOwn && styles.containerOwn]}>
      {!isOwn && (
        <View style={styles.avatarWrapper}>
          {comment.user?.avatarUrl ? (
            <Image source={{ uri: comment.user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={16} color={colors.primary} />
            </View>
          )}
        </View>
      )}

      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && (
          <View style={styles.nameRow}>
            <Text style={styles.senderName}>{comment.user?.name || 'Usuario'}</Text>
            {isCreator && (
              <View style={styles.creatorBadge}>
                <MaterialCommunityIcons name="crown" size={10} color={colors.accent} />
              </View>
            )}
          </View>
        )}
        <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
          {comment.message}
        </Text>
        <Text style={[styles.timeText, isOwn && styles.timeTextOwn]}>{timeStr}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  avatarWrapper: {
    marginBottom: 2,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleOther: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  senderName: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  creatorBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(247, 182, 52, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#1F2937',
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
