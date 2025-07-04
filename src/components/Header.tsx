import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { FONT_WEIGHT, FONT_FAMILY } from '../config/globalStyles';

interface HeaderProps {
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({userName}) => {

  return (
    <View style={styles.header}>
      <Text style={styles.subtitleText}>
       ESPE Connect
      </Text>
      <Text style={styles.welcomeText}>
        Hola, {userName ? userName : 'User'}! 👋
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.BOLD,
    color: 'black',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 30,
    fontWeight: FONT_WEIGHT.BOLD,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#2ECC71',
  },
}); 