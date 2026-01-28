import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {FONT_WEIGHT, FONT_FAMILY} from '../config/globalStyles';
import {colors} from '../config/colors';
import BannerLines from '../assets/svg/BannerLines';

interface HeaderProps {
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({userName}) => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.subtitleText}>ESPE Connect</Text>
        <Text style={styles.welcomeText}>
          !Hola, {userName ? userName : 'User'}
        </Text>
      </View>
      <BannerLines />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingLeft: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.BOLD,
    color: colors.primaryDark,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: FONT_WEIGHT.MEDIUM,
    fontFamily: FONT_FAMILY.REGULAR,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
