import {
  Plan,
  PlanCategory,
  PlanVisibility,
  PlanStatus,
  PlanParticipant,
  PlanParticipantRole,
  PlanParticipantStatus,
  PlanChatMessage,
  PlanMessageType,
} from '../../domain/entities/plan.entity';
import {
  ProfileRow,
  PlanParticipantRow,
  PlanRow,
  PlanChatMessageRow,
} from '../models/event.model';

export class PlanMapper {
  static toEntity(row: PlanRow, currentUserId?: string | null): Plan {
    const activeParticipants = row.participants?.filter(p => !p.left_at) || [];
    const approvedParticipants = activeParticipants.filter(p => p.status === PlanParticipantStatus.APPROVED);
    
    const participantsCount = approvedParticipants.length;
    const isParticipating = approvedParticipants.some(p => p.user_id === currentUserId);
    const isRequested = !isParticipating && activeParticipants.some(p => p.user_id === currentUserId && p.status === PlanParticipantStatus.PENDING);
    const isCreator = row.creator_id === currentUserId;
    const isFull = row.max_participants ? participantsCount >= row.max_participants : false;

    return {
      id: row.id,
      creatorId: row.creator_id,
      title: row.title,
      description: row.description,
      category: row.category as PlanCategory,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      locationName: row.location_name,
      latitude: row.latitude,
      longitude: row.longitude,
      visibility: row.visibility as PlanVisibility,
      maxParticipants: row.max_participants,
      status: row.status as PlanStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      requiresApproval: row.requires_approval,
      creator: {
        id: row.creator.id,
        name: row.creator.full_name ?? '',
        avatarUrl: row.creator.avatar_url ?? null,
        career: row.creator.career ?? '',
      },
      participants: row.participants?.map(p => this.toParticipantEntity(p)),
      participantsCount,
      isParticipating,
      isRequested,
      isCreator,
      isFull,
    };
  }

  static toParticipantEntity(row: PlanParticipantRow): PlanParticipant {
    return {
      id: row.id,
      planId: row.plan_id,
      userId: row.user_id,
      role: row.role as PlanParticipantRole,
      status: row.status as PlanParticipantStatus,
      joinedAt: row.joined_at,
      leftAt: row.left_at,
      user: {
        id: row.user.id,
        name: row.user.full_name ?? '',
        avatarUrl: row.user.avatar_url ?? null,
      },
    };
  }

  static toChatMessageEntity(row: PlanChatMessageRow): PlanChatMessage {
    return {
      id: row.id,
      planId: row.plan_id,
      senderId: row.sender_id,
      message: row.message,
      messageType: row.message_type as PlanMessageType,
      createdAt: row.created_at,
      user: row.sender ? {
        id: row.sender.id,
        name: row.sender.full_name ?? '',
        avatarUrl: row.sender.avatar_url ?? null,
      } : undefined,
    };
  }
}
