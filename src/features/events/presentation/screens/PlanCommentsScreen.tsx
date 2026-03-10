import React, { useState, useRef, useEffect } from 'react';
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

export const PlanCommentsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { planId, planTitle } = route.params;
  const insets = useSafeAreaInsets();
  const { setHideNavbar } = useNavbar();
  const [inputText, setInputText] = useState('');
  const { user } = useAuthStore();
  const currentUserId = user?.id ?? null;
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    React.useCallback(() => {
      setHideNavbar(true);
      return () => setHideNavbar(false);
    }, [setHideNavbar])
  );

  const { sendMessage, subscribeToPlanChat, fetchPlanById, fetchChatMessages } = usePlanStore();
  const [comments, setComments] = useState<PlanChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const initChat = async () => {
      setLoading(true);
      const planData = await fetchPlanById(planId);
      if (planData) {
        setCreatorId(planData.creatorId);
      }

      const messages = await fetchChatMessages(planId);
      setComments(messages);

      setLoading(false);
      unsubscribe = subscribeToPlanChat(planId, (newMessage) => {
        setComments(prev => {
          if (prev.find(c => c.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      });
    };
    initChat();
    return () => unsubscribe?.();
  }, [planId, fetchPlanById, subscribeToPlanChat, fetchChatMessages]);

  useEffect(() => {
    if (comments.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [comments.length]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => showSubscription.remove();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const text = inputText;
    setInputText('');
    setSending(true);

    // Optimistic update
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
      }
    };

    setComments(prev => [...prev, optimisticMsg]);

    try {
      const msg = await sendMessage(planId, { message: text });
      if (msg) {
        // Replace optimistic message with the real one
        setComments(prev => prev.map(c => c.id === tempId ? msg : c));
      } else {
        // Rollback on error
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

  const renderSystemMessage = (item: PlanChatMessage) => (
    <View style={styles.systemMessageContainer}>
      <Text style={styles.systemMessageText}>{item.message}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: PlanChatMessage }) => {
    if (item.messageType === PlanMessageType.SYSTEM) {
      return renderSystemMessage(item);
    }

    const isOwn = item.senderId === currentUserId;
    const isMsgFromCreator = item.senderId === creatorId;

    return (
      <PlanCommentBubble
        comment={item}
        isOwn={isOwn}
        isCreator={isMsgFromCreator}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111814" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{planTitle || 'Comentarios'}</Text>
          <Text style={styles.headerSubtitle}>
            {comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}
          </Text>
        </View>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="chat-outline" size={56} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>Sin comentarios aun</Text>
              <Text style={styles.emptySubtitle}>Se el primero en comentar en este plan</Text>
            </View>
          }
        />
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
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
          )}
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
  headerSubtitle: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
    marginTop: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
