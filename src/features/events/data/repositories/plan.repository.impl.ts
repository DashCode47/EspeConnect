import { supabase } from '../../../../lib/supabase';
import { Either, left, right } from '../../../../core/utils/either';
import { Failure, ServerFailure } from '../../../../core/errors/failure';
import { sendPushToUser } from '../../../../services/notificationService';
import {
  Plan,
  PlanParticipant,
  PlanChatMessage,
  PlanStatus,
  PlanParticipantRole,
  PlanParticipantStatus,
  PlanMessageType,
} from '../../domain/entities/plan.entity';
import {
  IPlanRepository,
  GetPlansParams,
  CreatePlanRequest,
  SendMessageRequest,
} from '../../domain/repositories/plan.repository';
import { PlanMapper } from '../mappers/plan.mapper';
import { PlanRow, PlanChatMessageRow, PlanParticipantRow } from '../models/event.model';

export class PlanRepositoryImpl implements IPlanRepository {
  async getPlans(params: GetPlansParams = {}): Promise<Either<Failure, Plan[]>> {
    try {
      const {
        status = PlanStatus.ACTIVE,
        category,
        visibility,
        date,
        dateFrom,
        dateTo,
        limit = 50,
        offset = 0,
      } = params;

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      let query = supabase
        .from('plans')
        .select(`
          *,
          creator:profiles!creator_id(id, full_name, avatar_url, career),
          participants:plan_participants(
            id,
            plan_id,
            user_id,
            role,
            status,
            joined_at,
            left_at,
            user:profiles!user_id(id, full_name, avatar_url)
          )
        `)
        .eq('status', status)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (category) query = query.eq('category', category);
      if (visibility) query = query.eq('visibility', visibility);
      if (date) query = query.eq('date', date);
      if (dateFrom) query = query.gte('date', dateFrom);
      if (dateTo) query = query.lte('date', dateTo);

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) return left(new ServerFailure(error.message));

      const plans = (data || []).map((row) => PlanMapper.toEntity(row as unknown as PlanRow, currentUserId));
      return right(plans);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async getPlanById(planId: string): Promise<Either<Failure, Plan>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const { data, error } = await supabase
        .from('plans')
        .select(`
          *,
          creator:profiles!creator_id(id, full_name, avatar_url, career),
          participants:plan_participants(
            id,
            plan_id,
            user_id,
            role,
            status,
            joined_at,
            left_at,
            user:profiles!user_id(id, full_name, avatar_url)
          )
        `)
        .eq('id', planId)
        .single();

      if (error) return left(new ServerFailure(error.message));
      if (!data) return left(new ServerFailure('Plan not found'));

      const plan = PlanMapper.toEntity(data as unknown as PlanRow, currentUserId);
      return right(plan);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async createPlan(planData: CreatePlanRequest): Promise<Either<Failure, Plan>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return left(new ServerFailure('User not authenticated'));

      const dbData = {
        creator_id: user.id,
        title: planData.title,
        description: planData.description,
        category: planData.category,
        date: planData.date,
        start_time: planData.startTime,
        end_time: planData.endTime,
        location_name: planData.locationName,
        latitude: planData.latitude,
        longitude: planData.longitude,
        visibility: planData.visibility,
        max_participants: planData.maxParticipants,
        requires_approval: planData.requiresApproval,
      };

      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert(dbData)
        .select()
        .single();

      if (planError) return left(new ServerFailure(planError.message));

      const { error: participantError } = await supabase
        .from('plan_participants')
        .insert({
          plan_id: plan.id,
          user_id: user.id,
          role: PlanParticipantRole.CREATOR,
          status: PlanParticipantStatus.APPROVED,
        });

      if (participantError) return left(new ServerFailure(participantError.message));

      await this.sendMessage(plan.id, {
        message: `${user.user_metadata?.name || 'Alguien'} creó este plan`,
        messageType: PlanMessageType.SYSTEM,
      });

      return await this.getPlanById(plan.id);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async updatePlan(planId: string, updates: Partial<CreatePlanRequest>): Promise<Either<Failure, Plan>> {
    try {
      const dbUpdates: any = { ...updates };
      if (updates.startTime) {
        dbUpdates.start_time = updates.startTime;
        delete dbUpdates.startTime;
      }
      if (updates.endTime) {
        dbUpdates.end_time = updates.endTime;
        delete dbUpdates.endTime;
      }
      if (updates.locationName) {
        dbUpdates.location_name = updates.locationName;
        delete dbUpdates.locationName;
      }
      if (updates.maxParticipants) {
        dbUpdates.max_participants = updates.maxParticipants;
        delete dbUpdates.maxParticipants;
      }
      if (updates.requiresApproval !== undefined) {
        dbUpdates.requires_approval = updates.requiresApproval;
        delete dbUpdates.requiresApproval;
      }

      const { error } = await supabase
        .from('plans')
        .update(dbUpdates)
        .eq('id', planId);

      if (error) return left(new ServerFailure(error.message));

      return await this.getPlanById(planId);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async deletePlan(planId: string): Promise<Either<Failure, void>> {
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);

      if (error) return left(new ServerFailure(error.message));
      return right(undefined);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async cancelPlan(planId: string): Promise<Either<Failure, void>> {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ status: PlanStatus.CANCELLED })
        .eq('id', planId);

      if (error) return left(new ServerFailure(error.message));
      return right(undefined);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async joinPlan(planId: string): Promise<Either<Failure, void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return left(new ServerFailure('User not authenticated'));

      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('requires_approval, title, creator_id')
        .eq('id', planId)
        .single();

      if (planError) return left(new ServerFailure(planError.message));

      const status = planData.requires_approval
        ? PlanParticipantStatus.PENDING
        : PlanParticipantStatus.APPROVED;

      const { error } = await supabase
        .from('plan_participants')
        .insert({
          plan_id: planId,
          user_id: user.id,
          role: PlanParticipantRole.PARTICIPANT,
          status,
        });

      if (error) return left(new ServerFailure(error.message));

      const joinerName = user.user_metadata?.name || 'Alguien';

      if (status === PlanParticipantStatus.APPROVED) {
        await this.sendMessage(planId, {
          message: `${joinerName} se unió al plan`,
          messageType: PlanMessageType.SYSTEM,
        });
        sendPushToUser(
          planData.creator_id,
          `Nueva participación en "${planData.title}"`,
          `${joinerName} se unió a tu plan`,
        );
      } else {
        sendPushToUser(
          planData.creator_id,
          `Nueva solicitud en "${planData.title}"`,
          `${joinerName} quiere unirse a tu plan`,
        );
      }

      return right(undefined);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async leavePlan(planId: string): Promise<Either<Failure, void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return left(new ServerFailure('User not authenticated'));

      await this.sendMessage(planId, {
        message: `${user.user_metadata?.name || 'Alguien'} salió del plan`,
        messageType: PlanMessageType.SYSTEM,
      });

      const { error } = await supabase
        .from('plan_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('plan_id', planId)
        .eq('user_id', user.id)
        .is('left_at', null);

      if (error) return left(new ServerFailure(error.message));
      return right(undefined);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async getParticipants(planId: string): Promise<Either<Failure, PlanParticipant[]>> {
    try {
      const { data, error } = await supabase
        .from('plan_participants')
        .select(`
          *,
          user:profiles!user_id(id, full_name, avatar_url)
        `)
        .eq('plan_id', planId)
        .is('left_at', null)
        .order('joined_at', { ascending: true });

      if (error) return left(new ServerFailure(error.message));

      const participants = (data || []).map((p) => PlanMapper.toParticipantEntity(p as unknown as PlanParticipantRow));
      return right(participants);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async getChatMessages(planId: string): Promise<Either<Failure, PlanChatMessage[]>> {
    try {
      const { data, error } = await supabase
        .from('plan_chat_messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .eq('plan_id', planId)
        .order('created_at', { ascending: true });

      if (error) return left(new ServerFailure(error.message));

      const messages = (data || []).map((m) => PlanMapper.toChatMessageEntity(m as unknown as PlanChatMessageRow));
      return right(messages);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async sendMessage(planId: string, messageData: SendMessageRequest): Promise<Either<Failure, PlanChatMessage>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return left(new ServerFailure('User not authenticated'));

      const { data, error } = await supabase
        .from('plan_chat_messages')
        .insert({
          plan_id: planId,
          sender_id: user.id,
          message: messageData.message,
          message_type: messageData.messageType || PlanMessageType.TEXT,
        })
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) return left(new ServerFailure(error.message));

      const message = PlanMapper.toChatMessageEntity(data as unknown as PlanChatMessageRow);
      return right(message);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  subscribeToPlanChat(planId: string, onMessage: (message: PlanChatMessage) => void, onError?: (error: Failure) => void): () => void {
    const channel = supabase
      .channel(`plan-chat:${planId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'plan_chat_messages',
          filter: `plan_id=eq.${planId}`,
        },
        async (payload) => {
          try {
            const { data, error } = await supabase
              .from('plan_chat_messages')
              .select(`
                *,
                sender:profiles!sender_id(id, full_name, avatar_url)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) throw error;
            if (data) {
              const message = PlanMapper.toChatMessageEntity(data as unknown as PlanChatMessageRow);
              onMessage(message);
            }
          } catch (error: any) {
            if (onError) onError(new ServerFailure(error.message));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  subscribeToPlans(onUpdate: () => void, onError?: (error: Failure) => void): () => void {
    const channel = supabase
      .channel('plans-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plans',
        },
        () => {
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plan_participants',
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async getMyPlans(): Promise<Either<Failure, Plan[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return left(new ServerFailure('User not authenticated'));

      const { data: participations, error: partError } = await supabase
        .from('plan_participants')
        .select('plan_id')
        .eq('user_id', user.id)
        .is('left_at', null);

      if (partError) return left(new ServerFailure(partError.message));

      const planIds = (participations || []).map(p => p.plan_id);
      if (planIds.length === 0) return right([]);

      const { data, error } = await supabase
        .from('plans')
        .select(`
          *,
          creator:profiles!creator_id(id, full_name, avatar_url, career),
          participants:plan_participants(
            id,
            plan_id,
            user_id,
            role,
            status,
            joined_at,
            left_at,
            user:profiles!user_id(id, full_name, avatar_url)
          )
        `)
        .in('id', planIds)
        .order('date', { ascending: false });

      if (error) return left(new ServerFailure(error.message));

      const plans = (data || []).map((row) => PlanMapper.toEntity(row as unknown as PlanRow, user.id));
      return right(plans);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async approveParticipant(planId: string, userId: string): Promise<Either<Failure, void>> {
    try {
      const { error } = await supabase
        .from('plan_participants')
        .update({ status: PlanParticipantStatus.APPROVED })
        .eq('plan_id', planId)
        .eq('user_id', userId)
        .eq('status', PlanParticipantStatus.PENDING)
        .is('left_at', null);

      if (error) return left(new ServerFailure(error.message));

      const { data: planData } = await supabase
        .from('plans')
        .select('title')
        .eq('id', planId)
        .single();

      await this.sendMessage(planId, {
        message: 'Un nuevo participante fue aprobado al plan',
        messageType: PlanMessageType.SYSTEM,
      });

      if (planData) {
        sendPushToUser(
          userId,
          `¡Solicitud aceptada!`,
          `Tu solicitud para unirte a "${planData.title}" fue aceptada`,
        );
      }

      return right(undefined);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async removeParticipant(planId: string, userId: string): Promise<Either<Failure, void>> {
    try {
      const { data: planData } = await supabase
        .from('plans')
        .select('title')
        .eq('id', planId)
        .single();

      const { error } = await supabase
        .from('plan_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('plan_id', planId)
        .eq('user_id', userId)
        .is('left_at', null);

      if (error) return left(new ServerFailure(error.message));

      await this.sendMessage(planId, {
        message: 'Un participante fue removido del plan',
        messageType: PlanMessageType.SYSTEM,
      });

      if (planData) {
        sendPushToUser(
          userId,
          `Solicitud rechazada`,
          `Tu solicitud para unirte a "${planData.title}" fue rechazada`,
        );
      }

      return right(undefined);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }
}
