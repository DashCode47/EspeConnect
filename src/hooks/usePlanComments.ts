import { useState, useEffect, useCallback, useRef } from 'react';
import { PlanChatMessage } from '../types/plan.types';
import { planService } from '../services/plan.service';

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
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchComments = useCallback(async () => {
    if (!planId || !enabled) return;
    try {
      setLoading(true);
      const data = await planService.getChatMessages(planId);
      // Filter only TEXT messages (not SYSTEM) for the comments view
      const textComments = data.filter(m => m.message_type === 'TEXT');
      setComments(previewLimit ? textComments.slice(-previewLimit) : textComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [planId, enabled, previewLimit]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Real-time subscription
  useEffect(() => {
    if (!planId || !enabled || !realtime) return;

    unsubscribeRef.current = planService.subscribeToPlanChat(
      planId,
      (newMessage) => {
        if (newMessage.message_type !== 'TEXT') return;
        setComments(prev => {
          // Deduplicate: optimistic update may have already added it
          if (prev.some(c => c.id === newMessage.id)) return prev;
          const updated = [...prev, newMessage];
          return previewLimit ? updated.slice(-previewLimit) : updated;
        });
      },
    );

    return () => {
      unsubscribeRef.current?.();
    };
  }, [planId, enabled, realtime, previewLimit]);

  const sendComment = useCallback(async (message: string) => {
    if (!planId || !message.trim()) return;
    try {
      setSending(true);
      const sent = await planService.sendMessage(planId, { message: message.trim() });
      // Optimistic update: add immediately without waiting for real-time event
      setComments(prev => {
        if (prev.some(c => c.id === sent.id)) return prev;
        const updated = [...prev, sent];
        return previewLimit ? updated.slice(-previewLimit) : updated;
      });
    } catch (error) {
      console.error('Error sending comment:', error);
      throw error;
    } finally {
      setSending(false);
    }
  }, [planId, previewLimit]);

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
