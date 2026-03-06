import { supabase } from '../lib/supabase';
import {
  Plan,
  PlanParticipant,
  PlanChatMessage,
  CreatePlanRequest,
  UpdatePlanRequest,
  GetPlansParams,
  SendMessageRequest,
  PlanStatus,
  PlanParticipantRole,
  PlanParticipantStatus,
  PlanMessageType,
} from '../types/plan.types';

class PlanService {
  /**
   * Helper function to map profile data from snake_case to camelCase
   */
  private mapProfile(profile: any): any {
    if (!profile) return null;
    return {
      id: profile.id,
      name: profile.full_name || '',
      avatarUrl: profile.avatar_url || null,
      career: profile.career || '',
    };
  }

  /**
   * Helper function to map plan data including nested profiles
   */
  private mapPlanData(plan: any): any {
    return {
      ...plan,
      creator: this.mapProfile(plan.creator),
      participants: plan.participants?.map((p: any) => ({
        ...p,
        user: this.mapProfile(p.user),
      })) || [],
    };
  }

  /**
   * Get all plans with filters
   */
  async getPlans(params: GetPlansParams = {}): Promise<Plan[]> {
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

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      let query = supabase
        .from('plans')
        .select(`
          *,
          creator:profiles!creator_id(id, full_name, avatar_url, career),
          participants:plan_participants(
            id,
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

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }
      if (visibility) {
        query = query.eq('visibility', visibility);
      }
      if (date) {
        query = query.eq('date', date);
      }
      if (dateFrom) {
        query = query.gte('date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('date', dateTo);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      // Map and enhance plans with computed fields
      return (data || []).map(plan => {
        const mappedPlan = this.mapPlanData(plan);
        const activeParticipants = mappedPlan.participants?.filter((p: any) => p.left_at === null) || [];
        const approvedParticipants = activeParticipants.filter((p: any) => p.status === PlanParticipantStatus.APPROVED);
        const participantsCount = approvedParticipants.length;
        const isParticipating = approvedParticipants.some((p: any) => p.user_id === currentUserId);
        const isRequested = !isParticipating && activeParticipants.some((p: any) => p.user_id === currentUserId && p.status === PlanParticipantStatus.PENDING);
        const isCreator = mappedPlan.creator_id === currentUserId;
        const isFull = mappedPlan.max_participants ? participantsCount >= mappedPlan.max_participants : false;

        return {
          ...mappedPlan,
          participantsCount,
          isParticipating,
          isRequested,
          isCreator,
          isFull,
        };
      });
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  /**
   * Get a single plan by ID
   */
  async getPlanById(planId: string): Promise<Plan> {
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

      if (error) throw error;
      if (!data) throw new Error('Plan not found');

      // Map profile data
      const mappedPlan = this.mapPlanData(data);

      // Enhance with computed fields
      const activeParticipants = mappedPlan.participants?.filter((p: any) => p.left_at === null) || [];
      const approvedParticipants = activeParticipants.filter((p: any) => p.status === PlanParticipantStatus.APPROVED);
      const participantsCount = approvedParticipants.length;
      const isParticipating = approvedParticipants.some((p: any) => p.user_id === currentUserId);
      const isRequested = !isParticipating && activeParticipants.some((p: any) => p.user_id === currentUserId && p.status === PlanParticipantStatus.PENDING);
      const isCreator = mappedPlan.creator_id === currentUserId;
      const isFull = mappedPlan.max_participants ? participantsCount >= mappedPlan.max_participants : false;

      return {
        ...mappedPlan,
        participantsCount,
        isParticipating,
        isRequested,
        isCreator,
        isFull,
      };
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  }

  /**
   * Create a new plan
   */
  async createPlan(planData: CreatePlanRequest): Promise<Plan> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the plan
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert({
          creator_id: user.id,
          ...planData,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Add creator as participant (always APPROVED)
      const { error: participantError } = await supabase
        .from('plan_participants')
        .insert({
          plan_id: plan.id,
          user_id: user.id,
          role: PlanParticipantRole.CREATOR,
          status: PlanParticipantStatus.APPROVED,
        });

      if (participantError) throw participantError;

      // Send system message
      await this.sendMessage(plan.id, {
        message: `${user.user_metadata?.name || 'Alguien'} creó este plan`,
        message_type: PlanMessageType.SYSTEM,
      });

      return await this.getPlanById(plan.id);
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  /**
   * Update a plan
   */
  async updatePlan(planId: string, updates: UpdatePlanRequest): Promise<Plan> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;

      return await this.getPlanById(planId);
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  /**
   * Delete a plan (only creator can do this)
   */
  async deletePlan(planId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  /**
   * Join a plan
   */
  async joinPlan(planId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Verify user exists in profiles table
      const { data: userRecord, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (userError || !userRecord) {
        throw new Error('User profile not found. Please complete your profile first.');
      }

      // Check if already participating or requested
      const { data: existing } = await supabase
        .from('plan_participants')
        .select('id, left_at, status')
        .eq('plan_id', planId)
        .eq('user_id', user.id)
        .is('left_at', null)
        .single();

      if (existing) {
        throw new Error(existing.status === PlanParticipantStatus.PENDING
          ? 'Ya tienes una solicitud pendiente para este plan'
          : 'Ya estás participando en este plan');
      }

      // Fetch plan to check requires_approval
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('requires_approval')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      const status = planData.requires_approval
        ? PlanParticipantStatus.PENDING
        : PlanParticipantStatus.APPROVED;

      // Join the plan
      const { error } = await supabase
        .from('plan_participants')
        .insert({
          plan_id: planId,
          user_id: user.id,
          role: PlanParticipantRole.PARTICIPANT,
          status,
        });

      if (error) throw error;

      // Only send system message if immediately approved
      if (status === PlanParticipantStatus.APPROVED) {
        await this.sendMessage(planId, {
          message: `${user.user_metadata?.name || 'Alguien'} se unió al plan`,
          message_type: PlanMessageType.SYSTEM,
        });
      }
    } catch (error) {
      console.error('Error joining plan:', error);
      throw error;
    }
  }

  /**
   * Leave a plan
   */
  async leavePlan(planId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Send system message before leaving (RLS requires active participant)
      await this.sendMessage(planId, {
        message: `${user.user_metadata?.name || 'Alguien'} salió del plan`,
        message_type: PlanMessageType.SYSTEM,
      });

      // Update participation with left_at timestamp
      const { error } = await supabase
        .from('plan_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('plan_id', planId)
        .eq('user_id', user.id)
        .is('left_at', null);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving plan:', error);
      throw error;
    }
  }

  /**
   * Get participants of a plan
   */
  async getParticipants(planId: string): Promise<PlanParticipant[]> {
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

      if (error) throw error;

      // Map profile data for participants
      return (data || []).map(p => ({
        ...p,
        user: this.mapProfile(p.user),
      }));
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }
  }

  /**
   * Get chat messages for a plan
   */
  async getChatMessages(planId: string): Promise<PlanChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('plan_chat_messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .eq('plan_id', planId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Map profile data for senders
      return (data || []).map(m => ({
        ...m,
        sender: this.mapProfile(m.sender),
      }));
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  /**
   * Send a message in plan chat
   */
  async sendMessage(planId: string, messageData: SendMessageRequest): Promise<PlanChatMessage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('plan_chat_messages')
        .insert({
          plan_id: planId,
          sender_id: user.id,
          message: messageData.message,
          message_type: messageData.message_type || PlanMessageType.TEXT,
        })
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Map profile data for sender
      return {
        ...data,
        sender: this.mapProfile(data.sender),
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for a plan's chat
   */
  subscribeToPlanChat(
    planId: string,
    onMessage: (message: PlanChatMessage) => void,
    onError?: (error: Error) => void
  ) {
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
            // Fetch the complete message with joined data
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
              // Map profile data for sender
              const mappedMessage = {
                ...data,
                sender: this.mapProfile(data.sender),
              };
              onMessage(mappedMessage);
            }
          } catch (error) {
            if (onError) onError(error as Error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Subscribe to real-time updates for plans list
   */
  subscribeToPlans(
    onUpdate: () => void,
    onError?: (error: Error) => void
  ) {
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

  /**
   * Get plans created by or joined by the current user
   */
  async getMyPlans(): Promise<Plan[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get plan IDs where user is an active participant (includes creator)
      const { data: participations, error: partError } = await supabase
        .from('plan_participants')
        .select('plan_id')
        .eq('user_id', user.id)
        .is('left_at', null);

      if (partError) throw partError;

      const planIds = (participations || []).map(p => p.plan_id);
      if (planIds.length === 0) return [];

      const { data, error } = await supabase
        .from('plans')
        .select(`
          *,
          creator:profiles!creator_id(id, full_name, avatar_url, career),
          participants:plan_participants(
            id,
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

      if (error) throw error;

      return (data || []).map(plan => {
        const mappedPlan = this.mapPlanData(plan);
        const activeParticipants = mappedPlan.participants?.filter((p: any) => p.left_at === null) || [];
        const approvedParticipants = activeParticipants.filter((p: any) => p.status === PlanParticipantStatus.APPROVED);
        const participantsCount = approvedParticipants.length;
        const isParticipating = approvedParticipants.some((p: any) => p.user_id === user.id);
        const isRequested = !isParticipating && activeParticipants.some((p: any) => p.user_id === user.id && p.status === PlanParticipantStatus.PENDING);
        const isCreator = mappedPlan.creator_id === user.id;
        const isFull = mappedPlan.max_participants ? participantsCount >= mappedPlan.max_participants : false;

        return {
          ...mappedPlan,
          participantsCount,
          isParticipating,
          isRequested,
          isCreator,
          isFull,
        };
      });
    } catch (error) {
      console.error('Error fetching my plans:', error);
      throw error;
    }
  }

  /**
   * Approve a pending participant (creator action)
   */
  async approveParticipant(planId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('plan_participants')
        .update({ status: PlanParticipantStatus.APPROVED })
        .eq('plan_id', planId)
        .eq('user_id', userId)
        .eq('status', PlanParticipantStatus.PENDING)
        .is('left_at', null);

      if (error) throw error;

      await this.sendMessage(planId, {
        message: 'Un nuevo participante fue aprobado al plan',
        message_type: PlanMessageType.SYSTEM,
      });
    } catch (error) {
      console.error('Error approving participant:', error);
      throw error;
    }
  }

  /**
   * Remove a participant from a plan (creator action)
   */
  async removeParticipant(planId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('plan_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('plan_id', planId)
        .eq('user_id', userId)
        .is('left_at', null);

      if (error) throw error;

      await this.sendMessage(planId, {
        message: 'Un participante fue removido del plan',
        message_type: PlanMessageType.SYSTEM,
      });
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }
}

export const planService = new PlanService();
