import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
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
  { key: 'home', icon: 'home-outline', label: 'Inicio' },
  // { key: 'carreers', icon: 'heart-outline', label: 'Carreras' },
  { key: 'posts', icon: 'account-group-outline', label: 'Posts' },
  { key: 'events', icon: 'calendar-outline', label: 'Eventos' },
  { key: 'rides', icon: 'car-outline', label: 'Rides' },
  { key: 'profile', icon: 'account-outline', label: 'Perfil' },
];

const ITEM_WIDTH = width / navigationItems.length;
const INDICATOR_SIZE = 32;
const INDICATOR_OFFSET = (ITEM_WIDTH - INDICATOR_SIZE) / 2;

export const AnimatedNavigator = ({ currentRoute, onNavigate }: AnimatedNavigatorProps) => {
  const theme = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const itemScales = useRef(navigationItems.map(() => new Animated.Value(1))).current;
  const itemOpacity = useRef(navigationItems.map(() => new Animated.Value(0.6))).current;
  const labelOpacity = useRef(navigationItems.map(() => new Animated.Value(0))).current;
  const indicatorScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const index = navigationItems.findIndex(item => item.key === currentRoute);
    
    Animated.parallel([
      // Smooth indicator movement
      Animated.spring(translateX, {
        toValue: index * ITEM_WIDTH,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      // Update item states
      ...navigationItems.map((_, i) =>
        Animated.parallel([
          Animated.spring(itemScales[i], {
            toValue: i === index ? 1.1 : 1,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
          }),
          Animated.timing(itemOpacity[i], {
            toValue: i === index ? 1 : 0.6,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(labelOpacity[i], {
            toValue: i === index ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [currentRoute]);

  const handlePress = (route: string, index: number) => {
    // Subtle press animation
    Animated.sequence([
      Animated.spring(itemScales[index], {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
      Animated.spring(itemScales[index], {
        toValue: 1.1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    onNavigate(route);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Background indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [0, (navigationItems.length - 1) * ITEM_WIDTH],
                    outputRange: [INDICATOR_OFFSET, (navigationItems.length - 1) * ITEM_WIDTH],
                  }),
                },
              ],
            },
          ]}
        />

        {navigationItems.map((item, index) => (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => handlePress(item.key, index)}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.itemContent,
                {
                  transform: [{ scale: itemScales[index] }],
                  opacity: itemOpacity[index],
                },
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={24}
                color={currentRoute === item.key ? '#ffffff' : '#8E8E93'}
              />
              
              <Animated.View
                style={[
                  styles.labelContainer,
                  {
                    opacity: labelOpacity[index],
                  },
                ]}
              >
                <Text
                  variant="labelSmall"
                  style={styles.label}
                >
                  {item.label}
                </Text>
              </Animated.View>

              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  indicator: {
    position: 'absolute',
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: 16,
    top: '50%',
    marginTop: -INDICATOR_SIZE / 2,
    backgroundColor: '#007AFF',
    zIndex: -1,
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  labelContainer: {
    position: 'absolute',
    top: 28,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
}); 