import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { EventStackParamList } from '../../../../navigation/types';
import { PlanCommentBubble } from '../components/PlanCommentBubble';
import { PlanChatMessage, PlanMessageType } from '../../domain/entities/plan.entity';
import { useNavbar } from '../../../../contexts/NavbarContext';
import { usePlanStore } from '../store/plan.store';
import { useAuthStore } from '../../../auth/presentation/store/auth.store';

type Props = NativeStackScreenProps<EventStackParamList, 'PlanComments'>;

const BOTTOM_THRESHOLD_PX = 80;

export const PlanCommentsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { planId, planTitle } = route.params;
  const insets = useSafeAreaInsets();
  const { setHideNavbar } = useNavbar();
  const [inputText, setInputText] = useState('');
  const { user } = useAuthStore();
  const currentUserId = user?.id ?? null;
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const { sendMessage, subscribeToPlanChat, fetchPlanById, fetchChatMessages } = usePlanStore();
  const [comments, setComments] = useState<PlanChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Prevents state updates after the component unmounts
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Track scroll position to show "new messages" badge instead of force-scrolling
  const isAtBottomRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  // Distinguish initial load messages from messages arriving while you're reading
  const initialLoadDoneRef = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      setHideNavbar(true);
      return () => setHideNavbar(false);
    }, [setHideNavbar])
  );

  // ── Initial load + realtime subscription ───────────────────────────────────
  // Every time the screen mounts it fetches fresh messages, so no polling or
  // AppState listener is needed — re-entering the screen handles "catch-up".
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    // `cancelled` is set synchronously on cleanup, before any async step can
    // open the Supabase channel. This guarantees the channel is never opened
    // if the user enters and exits before initChat() finishes.
    let cancelled = false;
    initialLoadDoneRef.current = false;

    const initChat = async () => {
      setLoading(true);

      const planData = await fetchPlanById(planId);
      if (cancelled) return;
      if (planData) setCreatorId(planData.creatorId);

      const messages = await fetchChatMessages(planId);
      if (cancelled) return;
      setComments(messages);
      setLoading(false);
      initialLoadDoneRef.current = true;

      // Only open the channel if we're still on this screen
      unsubscribe = subscribeToPlanChat(planId, (newMessage) => {
        if (!mountedRef.current) return;
        setComments(prev => {
          if (prev.some(c => c.id === newMessage.id)) return prev;
          if (newMessage.messageType === PlanMessageType.TEXT && !isAtBottomRef.current) {
            setNewMessagesCount(c => c + 1);
          }
          return [...prev, newMessage];
        });
      });
    };

    initChat();

    return () => {
      cancelled = true;    // Stop initChat mid-flight — channel won't be opened
      unsubscribe?.();     // Close channel if it was already opened
    };
  }, [planId, fetchPlanById, subscribeToPlanChat, fetchChatMessages]);

  // ── Auto-scroll: only when already at bottom ────────────────────────────────
  useEffect(() => {
    if (comments.length > 0 && isAtBottomRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [comments.length]);

  // ── Scroll to bottom on keyboard show ──────────────────────────────────────
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (isAtBottomRef.current) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });
    return () => sub.remove();
  }, []);

  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    const atBottom = distanceFromBottom < BOTTOM_THRESHOLD_PX;
    isAtBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
    if (atBottom && newMessagesCount > 0) setNewMessagesCount(0);
  }, [newMessagesCount]);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setNewMessagesCount(0);
  }, []);

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const text = inputText;
    setInputText('');
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: PlanChatMessage = {
      id: tempId,
      planId,
      senderId: currentUserId || '',
      message: text,
      messageType: PlanMessageType.TEXT,
      createdAt: new Date().toISOString(),
      user: {
        id: currentUserId || '',
        name: user?.name || 'Yo',
        avatarUrl: user?.avatarUrl || null,
      },
    };

    setComments(prev => [...prev, optimisticMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const msg = await sendMessage(planId, { message: text });
      if (msg) {
        setComments(prev => prev.map(c => c.id === tempId ? msg : c));
      } else {
        setComments(prev => prev.filter(c => c.id !== tempId));
        setInputText(text);
      }
    } catch {
      setComments(prev => prev.filter(c => c.id !== tempId));
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: PlanChatMessage }) => {
    if (item.messageType === PlanMessageType.SYSTEM) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.message}</Text>
        </View>
      );
    }
    return (
      <PlanCommentBubble
        comment={item}
        isOwn={item.senderId === currentUserId}
        isCreator={item.senderId === creatorId}
      />
    );
  };

  const textCommentCount = comments.filter(c => c.messageType === PlanMessageType.TEXT).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111814" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{planTitle || 'Comentarios'}</Text>
          <View style={styles.headerSubtitleRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerSubtitle}>
              {textCommentCount} {textCommentCount === 1 ? 'comentario' : 'comentarios'} · En vivo
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <FlatList
            ref={flatListRef}
            data={comments}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            extraData={comments}
            contentContainerStyle={[
              styles.listContent,
              comments.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="chat-outline" size={56} color="#E5E7EB" />
                <Text style={styles.emptyTitle}>Sin comentarios aún</Text>
                <Text style={styles.emptySubtitle}>Sé el primero en comentar en este plan</Text>
              </View>
            }
          />

          {/* New messages badge — only shown when scrolled up */}
          {!isAtBottom && newMessagesCount > 0 && (
            <TouchableOpacity style={styles.newMessagesBadge} onPress={scrollToBottom} activeOpacity={0.85}>
              <MaterialCommunityIcons name="arrow-down" size={16} color={colors.white} />
              <Text style={styles.newMessagesBadgeText}>
                {newMessagesCount} {newMessagesCount === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Escribe un comentario..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          activeOpacity={0.7}
        >
          {sending
            ? <ActivityIndicator size="small" color="#FFFFFF" />
            : <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#111814',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#374151',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  systemMessageContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  systemMessageText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  newMessagesBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  newMessagesBadgeText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#111814',
    maxHeight: 80,
    padding: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
