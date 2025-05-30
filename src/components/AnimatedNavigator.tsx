import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface NavigationItem {
  key: string;
  icon: string;
  label: string;
  badge?: number;
}

interface AnimatedNavigatorProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const navigationItems: NavigationItem[] = [
  { key: 'home', icon: 'home', label: 'Inicio' },
  { key: 'matches', icon: 'heart', label: 'Matches' },
  { key: 'posts', icon: 'post', label: 'Posts' },
  { key: 'profile', icon: 'account', label: 'Perfil' },
];

const ITEM_WIDTH = width / navigationItems.length;

export const AnimatedNavigator = ({ currentRoute, onNavigate }: AnimatedNavigatorProps) => {
  const theme = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const itemScale = useRef(navigationItems.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const index = navigationItems.findIndex(item => item.key === currentRoute);
    Animated.spring(translateX, {
      toValue: index * ITEM_WIDTH,
      useNativeDriver: true,
      tension: 50,
      friction: 10
    }).start();
  }, [currentRoute]);

  const handlePress = (route: string, index: number) => {
    // Animate the indicator
    Animated.spring(translateX, {
      toValue: index * ITEM_WIDTH,
      useNativeDriver: true,
      tension: 50,
      friction: 10
    }).start();

    // Animate the pressed item
    Animated.sequence([
      Animated.timing(itemScale[index], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(itemScale[index], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    onNavigate(route);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.elevation.level2 }]}>
      <Animated.View 
        style={[
          styles.indicator, 
          { 
            width: ITEM_WIDTH,
            backgroundColor: theme.colors.primary,
            transform: [{ translateX }]
          }
        ]} 
      />
      
      {navigationItems.map((item, index) => (
        <TouchableOpacity
          key={item.key}
          style={styles.item}
          onPress={() => handlePress(item.key, index)}
        >
          <Animated.View 
            style={[
              styles.itemContent,
              {
                transform: [{ scale: itemScale[index] }]
              }
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={24}
              color={currentRoute === item.key ? theme.colors.primary : theme.colors.onSurfaceDisabled}
            />
            <Text
              variant="labelSmall"
              style={[
                styles.label,
                {
                  color: currentRoute === item.key 
                    ? theme.colors.primary 
                    : theme.colors.onSurfaceDisabled
                }
              ]}
            >
              {item.label}
            </Text>
            
            {item.badge && (
              <Animated.View 
                style={[
                  styles.badge, 
                  { 
                    backgroundColor: theme.colors.error,
                    transform: [{ scale: itemScale[index] }]
                  }
                ]}
              >
                <Text style={styles.badgeText}>{item.badge}</Text>
              </Animated.View>
            )}
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 