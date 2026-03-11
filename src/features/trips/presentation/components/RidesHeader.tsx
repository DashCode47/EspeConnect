import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';

interface RidesHeaderProps {
  topInset: number;
  onInfoPress: () => void;
}

export const RidesHeader: React.FC<RidesHeaderProps> = ({ topInset, onInfoPress }) => {
  return (
    <View style={[styles.header, { paddingTop: topInset }]}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerSubtitle}>CAMPLUS</Text>
        <Text style={styles.headerTitle}>Viajes Compartidos</Text>
      </View>
      <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
        <MaterialCommunityIcons name="shield-check" size={20} color={colors.primary} />
      </TouchableOpacity>
      <View style={styles.headerSpacer} />
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
  infoButton: {
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
    zIndex: 10,
  },
  headerSpacer: {
    width: 40,
  },
});
