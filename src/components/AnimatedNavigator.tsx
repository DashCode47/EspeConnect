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
  { key: 'home', icon: 'home', label: 'Inicio' },
  { key: 'matches', icon: 'heart', label: 'Matches' },
  { key: 'posts', icon: 'account-group', label: 'Posts' },
  { key: 'profile', icon: 'account', label: 'Perfil' },
];

const ITEM_WIDTH = width / navigationItems.length;
const INDICATOR_SIZE = 45; // Increased from 40
const INDICATOR_OFFSET = (ITEM_WIDTH - INDICATOR_SIZE) / 2;

export const AnimatedNavigator = ({ currentRoute, onNavigate }: AnimatedNavigatorProps) => {
  const theme = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const itemScales = useRef(navigationItems.map(() => new Animated.Value(1))).current;
  const itemTranslateY = useRef(navigationItems.map(() => new Animated.Value(0))).current;
  const labelOpacity = useRef(navigationItems.map(() => new Animated.Value(0))).current;
  const indicatorScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const index = navigationItems.findIndex(item => item.key === currentRoute);
    Animated.parallel([
      // Animate with momentum and overshoot
      Animated.sequence([
        Animated.spring(translateX, {
          toValue: index * ITEM_WIDTH,// Overshoot
          useNativeDriver: true,
          tension: 120,
          friction: 4,
        }),
        Animated.timing(translateX, {
          toValue: index * ITEM_WIDTH, // Back to center immediately
          duration: 10,
          useNativeDriver: true,
        }),
      ]),
      ...navigationItems.map((_, i) =>
        Animated.parallel([
          Animated.spring(itemScales[i], {
            toValue: i === index ? 1.2 : 1,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }),
          Animated.spring(itemTranslateY[i], {
            toValue: i === index ? -8 : 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
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
    // Animate the pressed item with a bounce effect
    Animated.sequence([
      // First, compress the icon (scale down)
      Animated.parallel([
        Animated.spring(itemScales[index], {
          toValue: 0.5,
          useNativeDriver: true,
          tension: 300,
          friction: 3,
        }),
        Animated.spring(itemTranslateY[index], {
          toValue: 8,
          useNativeDriver: true,
          tension: 300,
          friction: 3,
        }),
      ]),
      // Then, bounce it back up with overshoot
      Animated.parallel([
        Animated.spring(itemScales[index], {
          toValue: 1.5,
          useNativeDriver: true,
          tension: 80,
          friction: 6,
        }),
        Animated.spring(itemTranslateY[index], {
          toValue: -20,
          useNativeDriver: true,
          tension: 80,
          friction: 6,
        }),
      ]),
      // Finally, settle to normal size
      Animated.parallel([
        Animated.spring(itemScales[index], {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
        Animated.spring(itemTranslateY[index], {
          toValue: -8,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
      ]),
    ]).start();

    onNavigate(route);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: '#2d1863' }]}>
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
              backgroundColor: '#4CAF50',
            },
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
                  transform: [
                    { scale: itemScales[index] },
                    { translateY: itemTranslateY[index] },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={28}
                color={currentRoute === item.key ? '#ffffff' : '#a8a8a8'}
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
                  style={[
                    styles.label,
                    {
                      color: '#ffffff',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Animated.View>

              {item.badge && (
                <Animated.View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: '#ff4757',
                      transform: [{ scale: itemScales[index] }],
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </Animated.View>
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
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    height: 80,
    borderRadius: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    top: '35%', // Moved up from 25%
    marginTop: -INDICATOR_SIZE / 2,
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
  },
  labelContainer: {
    position: 'absolute',
    top: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    marginTop: 0,
    fontSize: 11,
    fontWeight: '600',
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
    borderWidth: 2,
    borderColor: '#2d1863',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 