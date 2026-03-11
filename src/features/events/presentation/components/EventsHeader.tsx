import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';

interface EventsHeaderProps {
  onCreatePress: () => void;
}

export const EventsHeader = ({ onCreatePress }: EventsHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerSubtitle}>CAMPLUS</Text>
        <Text style={styles.headerTitle}>Eventos y Planes</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onCreatePress}>
        <MaterialCommunityIcons name="plus" size={24} color={colors.primaryDark} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(246, 248, 247, 0.8)',
    justifyContent: 'flex-end',
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.BLACK,
    color: `${colors.primary}99`,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
