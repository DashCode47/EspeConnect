import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../config/colors';
import { FONT_FAMILY } from '../config/globalStyles';

interface NavigationItem {
    key: string;
    icon: string;
    iconActive: string;
    label: string;
}

interface AnimatedNavigatorProps {
    currentRoute: string;
    onNavigate: (route: string) => void;
}

const navigationItems: NavigationItem[] = [
    { key: 'home', icon: 'home-outline', iconActive: 'home', label: 'Inicio' },
    { key: 'establishments', icon: 'storefront-outline', iconActive: 'storefront', label: 'Locales' },
    { key: 'marketplace', icon: 'store-outline', iconActive: 'store', label: 'Market' },
    { key: 'rides', icon: 'car-outline', iconActive: 'car', label: 'Viajes' },
    { key: 'events', icon: 'calendar-outline', iconActive: 'calendar', label: 'Eventos' },
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
                                    size={22}
                                    color={isActive ? colors.white : '#9CA3AF'}
                                />
                                <Text
                                    style={[styles.navLabel, isActive && styles.navLabelActive]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit>
                                    {item.label}
                                </Text>
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
        bottom: 5,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'box-none',
    },
    navContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: '#1E2A25',
        borderRadius: 32,
        paddingVertical: 6,
        paddingHorizontal: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    navItem: {
        paddingHorizontal: 12,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        minWidth: 56,
    },
    navItemActive: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    navLabel: {
        fontSize: 10,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: '#9CA3AF',
        marginTop: 2,
    },
    navLabelActive: {
        color: colors.white,
        fontFamily: FONT_FAMILY.BOLD,
    },
});
