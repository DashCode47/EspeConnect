import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';

interface HeaderProps {
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({userName}) => {
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <Text style={styles.welcomeText}>
        Welcome, {userName ? userName : 'User'}! 👋
      </Text>
      <Text style={styles.subtitleText}>
        Discover what's happening at ESPE today
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#4169E1',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
}); 