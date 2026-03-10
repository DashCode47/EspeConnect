import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../config/colors';

interface NavigationItem {
    key: string;
    icon: string;
    iconActive: string;
}

interface AnimatedNavigatorProps {
    currentRoute: string;
    onNavigate: (route: string) => void;
}

const navigationItems: NavigationItem[] = [
    { key: 'home', icon: 'home-outline', iconActive: 'home' },
    { key: 'establishments', icon: 'storefront-outline', iconActive: 'storefront' },
    { key: 'posts', icon: 'ticket-percent-outline', iconActive: 'ticket-percent' },
    { key: 'marketplace', icon: 'store-outline', iconActive: 'store' },
    { key: 'rides', icon: 'car-outline', iconActive: 'car' },
    { key: 'events', icon: 'calendar-outline', iconActive: 'calendar' },
];

export const AnimatedNavigator = ({ currentRoute, onNavigate }: AnimatedNavigatorProps) => {
    // Animation refs for each item
    const scaleAnims = useRef(
        navigationItems.map(() => new Animated.Value(1))
    ).current;

    useEffect(() => {
        // Animate scale for active item
        navigationItems.forEach((item, index) => {
            const isActive = item.key === currentRoute;
            Animated.spring(scaleAnims[index], {
                toValue: isActive ? 1 : 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        });
    }, [currentRoute]);

    const handlePress = (route: string, index: number) => {
        // Quick scale animation on press
        Animated.sequence([
            Animated.timing(scaleAnims[index], {
                toValue: 0.9,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnims[index], {
                toValue: 1,
                useNativeDriver: true,
                tension: 200,
                friction: 10,
            }),
        ]).start();

        onNavigate(route);
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.navContainer}>
                {navigationItems.map((item, index) => {
                    const isActive = currentRoute === item.key;

                    return (
                        <Animated.View
                            key={item.key}
                            style={[
                                { transform: [{ scale: scaleAnims[index] }] },
                            ]}>
                            <TouchableOpacity
                                style={[
                                    styles.navItem,
                                    isActive && styles.navItemActive,
                                ]}
                                onPress={() => handlePress(item.key, index)}
                                activeOpacity={0.7}>
                                <MaterialCommunityIcons
                                    name={isActive ? item.iconActive : item.icon}
                                    size={24}
                                    color={isActive ? colors.white : '#9CA3AF'}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'box-none',
    },
    navContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#1E2A25',
        borderRadius: 32,
        paddingVertical: 6,
        paddingLeft: 8,
        paddingRight: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    navItem: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navItemActive: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
});
