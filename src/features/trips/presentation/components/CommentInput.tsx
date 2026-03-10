import React from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Avatar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';

interface CommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  userAvatar?: string | null;
  userName?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const CommentInput = ({
  value,
  onChangeText,
  onSubmit,
  userAvatar,
  userName,
  placeholder = 'Añade un comentario...',
  disabled = false,
}: CommentInputProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          {userAvatar ? (
            <Avatar.Image
              size={40}
              source={{ uri: userAvatar }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={40}
              label={userName?.charAt(0).toUpperCase() || 'U'}
              style={styles.avatar}
            />
          )}
          
          <TextInput
            mode="outlined"
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            style={styles.input}
            contentStyle={styles.inputContent}
            outlineStyle={styles.inputOutline}
            placeholderTextColor="#888888"
            editable={!disabled}
            multiline
          />
          
          <TouchableOpacity
            style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
            onPress={onSubmit}
            disabled={disabled || !value.trim()}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={disabled || !value.trim() ? '#CCCCCC' : colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 12,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    maxHeight: 100,
    fontSize: 14,
  },
  inputContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  inputOutline: {
    borderColor: '#E0E0E0',
    borderRadius: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});

