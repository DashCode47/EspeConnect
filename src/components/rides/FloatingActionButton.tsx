import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../config/colors';

interface FloatingActionButtonProps {
  label: string;
  icon: string;
  onPress?: () => void;
}

export const FloatingActionButton = ({ label, icon, onPress }: FloatingActionButtonProps) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { bottom: 24 + insets.bottom }]}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={28}
          color={colors.white}
        />
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    zIndex: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28, // Completamente redondeado (h-14 / 2 = 28)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    height: 56, // h-14 = 56px
    marginBottom: 60,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

