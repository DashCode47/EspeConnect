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
        const activeParticipants = mappedPlan.participants?.filter(p => p.left_at === null) || [];
        const participantsCount = activeParticipants.length;
        const isParticipating = activeParticipants.some(p => p.user_id === currentUserId);
        const isCreator = mappedPlan.creator_id === currentUserId;
        const isFull = mappedPlan.max_participants ? participantsCount >= mappedPlan.max_participants : false;

        return {
          ...mappedPlan,
          participantsCount,
          isParticipating,
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
      const activeParticipants = mappedPlan.participants?.filter(p => p.left_at === null) || [];
      const participantsCount = activeParticipants.length;
      const isParticipating = activeParticipants.some(p => p.user_id === currentUserId);
      const isCreator = mappedPlan.creator_id === currentUserId;
      const isFull = mappedPlan.max_participants ? participantsCount >= mappedPlan.max_participants : false;

      return {
        ...mappedPlan,
        participantsCount,
        isParticipating,
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

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('plan_participants')
        .insert({
          plan_id: plan.id,
          user_id: user.id,
          role: PlanParticipantRole.CREATOR,
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

      // Check if already participating
      const { data: existing } = await supabase
        .from('plan_participants')
        .select('id, left_at')
        .eq('plan_id', planId)
        .eq('user_id', user.id)
        .is('left_at', null)
        .single();

      if (existing) {
        throw new Error('Already participating in this plan');
      }

      // Join the plan
      const { error } = await supabase
        .from('plan_participants')
        .insert({
          plan_id: planId,
          user_id: user.id,
          role: PlanParticipantRole.PARTICIPANT,
        });

      if (error) throw error;

      // Send system message
      await this.sendMessage(planId, {
        message: `${user.user_metadata?.name || 'Alguien'} se unió al plan`,
        message_type: PlanMessageType.SYSTEM,
      });
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

      // Update participation with left_at timestamp
      const { error } = await supabase
        .from('plan_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('plan_id', planId)
        .eq('user_id', user.id)
        .is('left_at', null);

      if (error) throw error;

      // Send system message
      await this.sendMessage(planId, {
        message: `${user.user_metadata?.name || 'Alguien'} salió del plan`,
        message_type: PlanMessageType.SYSTEM,
      });
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
}

export const planService = new PlanService();
