import { useState, useEffect, useCallback } from 'react';
import { PlanChatMessage, PlanMessageType } from '../../domain/entities/plan.entity';
import { usePlanStore } from '../store/plan.store';

interface UsePlanCommentsOptions {
  planId: string | null;
  enabled?: boolean;
  previewLimit?: number;
  realtime?: boolean;
}

export const usePlanComments = ({
  planId,
  enabled = true,
  previewLimit,
  realtime = false,
}: UsePlanCommentsOptions) => {
  const [comments, setComments] = useState<PlanChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { subscribeToPlanChat, sendMessage, fetchChatMessages } = usePlanStore();

  const fetchComments = useCallback(async () => {
    if (!planId || !enabled) return;
    try {
      setLoading(true);
      const data = await fetchChatMessages(planId);
      // Filter only TEXT messages (not SYSTEM) for the comments view
      const textComments = data.filter(m => m.messageType === PlanMessageType.TEXT);
      setComments(previewLimit ? textComments.slice(-previewLimit) : textComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [planId, enabled, previewLimit, fetchChatMessages]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Real-time subscription
  useEffect(() => {
    if (!planId || !enabled || !realtime) return;

    const unsubscribe = subscribeToPlanChat(
      planId,
      (newMessage: PlanChatMessage) => {
        if (newMessage.messageType !== PlanMessageType.TEXT) return;
        setComments(prev => {
          // Deduplicate: optimistic update may have already added it
          if (prev.some(c => c.id === newMessage.id)) return prev;
          const updated = [...prev, newMessage];
          return previewLimit ? updated.slice(-previewLimit) : updated;
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [planId, enabled, realtime, previewLimit, subscribeToPlanChat]);

  const sendComment = useCallback(async (message: string) => {
    if (!planId || !message.trim()) return;
    try {
      setSending(true);
      const sent = await sendMessage(planId, { message: message.trim() });
      if (sent) {
        // Optimistic update: add immediately without waiting for real-time event
        setComments(prev => {
          if (prev.some(c => c.id === sent.id)) return prev;
          const updated = [...prev, sent];
          return previewLimit ? updated.slice(-previewLimit) : updated;
        });
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      throw error;
    } finally {
      setSending(false);
    }
  }, [planId, previewLimit, sendMessage]);

  const totalCount = comments.length;

  return {
    comments,
    loading,
    sending,
    totalCount,
    sendComment,
    refreshComments: fetchComments,
  };
};
