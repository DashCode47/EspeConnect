import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {FONT_WEIGHT, FONT_FAMILY} from '../config/globalStyles';
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
    fontSize: 32,
    fontWeight: FONT_WEIGHT.BOLD,
    color: 'black',
    marginTop: 35,
  },
  subtitleText: {
    fontSize: 30,
    fontWeight: FONT_WEIGHT.BOLD,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#01613f',
  },
});
