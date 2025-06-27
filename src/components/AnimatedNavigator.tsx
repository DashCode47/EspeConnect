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
const INDICATOR_SIZE = 40;
const INDICATOR_OFFSET = (ITEM_WIDTH - INDICATOR_SIZE) / 2;

export const AnimatedNavigator = ({ currentRoute, onNavigate }: AnimatedNavigatorProps) => {
  const theme = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const itemScales = useRef(navigationItems.map(() => new Animated.Value(1))).current;
  const itemTranslateY = useRef(navigationItems.map(() => new Animated.Value(0))).current;
  const labelOpacity = useRef(navigationItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const index = navigationItems.findIndex(item => item.key === currentRoute);
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: index * ITEM_WIDTH,
        useNativeDriver: true,
        tension: 50,
        friction: 10,
      }),
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
    Animated.sequence([
      Animated.parallel([
        Animated.spring(itemScales[index], {
          toValue: 0.8,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.spring(itemTranslateY[index], {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
      ]),
      Animated.parallel([
        Animated.spring(itemScales[index], {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.spring(itemTranslateY[index], {
          toValue: -8,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
      ]),
    ]).start();

    onNavigate(route);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: theme.colors.elevation.level2 }]}>
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [0, (navigationItems.length - 1) * ITEM_WIDTH],
                    outputRange: [INDICATOR_OFFSET, (navigationItems.length - 1) * ITEM_WIDTH ],
                  }),
                },
              ],
              backgroundColor: theme.colors.primaryContainer,
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
                size={24}
                color={currentRoute === item.key ? theme.colors.primary : theme.colors.onSurfaceVariant}
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
                      color: theme.colors.primary,
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
                      backgroundColor: theme.colors.error,
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
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 0,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    top: '35%',
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
    top: 28,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
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
    fontSize: 10,
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
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 