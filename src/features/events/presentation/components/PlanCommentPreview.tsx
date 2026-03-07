import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { PlanChatMessage } from '../../domain/entities/plan.entity';

interface PlanCommentPreviewProps {
  comments: PlanChatMessage[];
  loading: boolean;
  canComment: boolean;
  onViewAll: () => void;
  onJoinToComment?: () => void;
}

export const PlanCommentPreview: React.FC<PlanCommentPreviewProps> = ({
  comments,
  loading,
  canComment,
  onViewAll,
  onJoinToComment,
}) => {
  if (!canComment) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="comment-text-outline" size={18} color="#9CA3AF" />
          <Text style={styles.sectionTitle}>Comentarios</Text>
        </View>
        <TouchableOpacity
          style={styles.lockedContainer}
          onPress={onJoinToComment}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="lock-outline" size={24} color="#D1D5DB" />
          <Text style={styles.lockedText}>Unete al plan para ver y escribir comentarios</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="comment-text-outline" size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>Comentarios</Text>
        <TouchableOpacity style={styles.viewAllInline} onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>
            {comments.length > 0 ? `Ver todos (${comments.length})` : 'Abrir'}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={15} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      ) : comments.length === 0 ? (
        <TouchableOpacity style={styles.emptyContainer} onPress={onViewAll} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chat-plus-outline" size={32} color="#D1D5DB" />
          <Text style={styles.emptyText}>Se el primero en comentar</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.commentsPreview}>
          {comments.slice(-3).map((comment) => (
            <View key={comment.id} style={styles.previewItem}>
              {comment.user?.avatarUrl ? (
                <Image source={{ uri: comment.user.avatarUrl }} style={styles.miniAvatar} />
              ) : (
                <View style={styles.miniAvatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={12} color={colors.primary} />
                </View>
              )}
              <View style={styles.previewContent}>
                <Text style={styles.previewName} numberOfLines={1}>
                  {comment.user?.name || 'Usuario'}
                </Text>
                <Text style={styles.previewMessage} numberOfLines={1}>
                  {comment.message}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#111814',
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#FFFFFF',
  },
  loader: {
    paddingVertical: 20,
  },
  lockedContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
  },
  lockedText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  commentsPreview: {
    gap: 10,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  miniAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewName: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#374151',
  },
  previewMessage: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#6B7280',
  },
  viewAllInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: colors.primary,
  },
});
