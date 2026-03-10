import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeStack } from './HomeStack';
import { AnimatedNavigator } from '../components/AnimatedNavigator';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MarketplaceStack } from './MarketplaceStack';
import { RideStack } from './RideStack';
import { EventStack } from './EventStack';
import { BenefitsNavigator } from './BenefitsNavigator';
import { useNavbar } from '../contexts/NavbarContext';
import { EstablishmentsScreen } from '../features/establishments/presentation/screens/EstablishmentsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
    const insets = useSafeAreaInsets();
    const [currentRoute, setCurrentRoute] = useState('home');
    const { hideNavbar } = useNavbar();

    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { display: 'none' }
                }}
                screenListeners={{
                    focus: (e) => {
                        const routeName = e.target?.split('-')[0];
                        if (routeName) {
                            setCurrentRoute(routeName);
                        }
                    },
                }}
                tabBar={(props) => {
                    // Hide navbar when hideNavbar is true
                    if (hideNavbar) {
                        return null;
                    }

                    return (
                        <View style={{
                            position: 'absolute',
                            bottom: insets.bottom > 0 ? insets.bottom : 0,
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            pointerEvents: 'box-none',
                        }}>
                            <AnimatedNavigator
                                currentRoute={currentRoute}
                                onNavigate={(route) => {
                                    props.navigation.navigate(route);
                                }}
                            />
                        </View>
                    );
                }}
            >
                <Tab.Screen
                    name="home"
                    component={HomeStack}
                />
                <Tab.Screen
                    name="establishments"
                    component={EstablishmentsScreen}
                />
                <Tab.Screen
                    name="posts"
                    component={BenefitsNavigator}
                />
                <Tab.Screen
                    name="marketplace"
                    component={MarketplaceStack}
                />
                <Tab.Screen
                    name="events"
                    component={EventStack}
                />
                <Tab.Screen
                    name="rides"
                    component={RideStack}
                />
            </Tab.Navigator>
        </View>
    );
}; 
