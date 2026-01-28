import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Text,
} from 'react-native';
import { colors } from '../config/colors';
import { BarraHome } from '../assets/svg/BarraHome';
import { BarraViajes } from '../assets/svg/BarraViajes';
import { BarraBeneficios } from '../assets/svg/BarraBeneficios';
import { BarraEventos } from '../assets/svg/BarraEventos';
import { BarraMarketplace } from '../assets/svg/BarraMarketplace';

const { width } = Dimensions.get('window');

interface NavigationItem {
  key: string;
  IconComponent: React.ComponentType<{ color?: string; size?: number }>;
  label: string;
}

interface AnimatedNavigatorProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const navigationItems: NavigationItem[] = [
  { key: 'home', IconComponent: BarraHome, label: 'Explorar' },
  { key: 'posts', IconComponent: BarraBeneficios, label: 'Beneficios' },
  { key: 'marketplace', IconComponent: BarraMarketplace, label: 'Market' },
  { key: 'rides', IconComponent: BarraViajes, label: 'Viajes' },
  { key: 'events', IconComponent: BarraEventos, label: 'Eventos' },
];

const ITEM_WIDTH = width / navigationItems.length;

export const AnimatedNavigator = ({ currentRoute, onNavigate }: AnimatedNavigatorProps) => {
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const index = navigationItems.findIndex(item => item.key === currentRoute);
    const targetPosition = index * ITEM_WIDTH;
    
    Animated.spring(indicatorPosition, {
      toValue: targetPosition,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [currentRoute]);

  const handlePress = (route: string) => {
    onNavigate(route);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Background indicator for active item */}
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [
                {
                  translateX: indicatorPosition.interpolate({
                    inputRange: [0, (navigationItems.length - 1) * ITEM_WIDTH],
                    outputRange: [0, (navigationItems.length - 1) * ITEM_WIDTH],
                  }),
                },
              ],
            },
          ]}
        />

        {navigationItems.map((item, index) => {
          const isActive = currentRoute === item.key;
          const Icon = item.IconComponent;
          
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.item}
              onPress={() => handlePress(item.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.itemContent,
                  isActive && styles.itemContentActive,
                ]}
              >
                <Icon
                  color={isActive ? colors.primary : '#999'}
                  size={24}
                />
                <Text
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: colors.white,
    position: 'relative',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  indicator: {
    position: 'absolute',
    width: ITEM_WIDTH - 16,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    top: 8,
    left: 8,
    zIndex: 0,
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    width: '100%',
  },
  itemContentActive: {},
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    marginTop: 4,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
