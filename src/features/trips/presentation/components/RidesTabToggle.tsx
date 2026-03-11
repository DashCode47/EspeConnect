import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';

export type TravelMode = 'search' | 'offer';

interface RidesTabToggleProps {
    travelMode: TravelMode;
    onModeChange: (mode: TravelMode) => void;
}

export const RidesTabToggle: React.FC<RidesTabToggleProps> = ({ travelMode, onModeChange }) => {
    return (
        <View style={styles.toggleContainer}>
            <View style={styles.toggleWrapper}>
                <TouchableOpacity
                    style={[styles.toggleOption, travelMode === 'search' && styles.toggleOptionActive]}
                    onPress={() => onModeChange('search')}
                    activeOpacity={0.8}>
                    <Text style={[
                        styles.toggleText,
                        travelMode === 'search' && styles.toggleTextActive
                    ]}>
                        Busco Viaje
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleOption, travelMode === 'offer' && styles.toggleOptionActive]}
                    onPress={() => onModeChange('offer')}
                    activeOpacity={0.8}>
                    <Text style={[
                        styles.toggleText,
                        travelMode === 'offer' && styles.toggleTextActive
                    ]}>
                        Ofrezco Viaje
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    toggleContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    toggleWrapper: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        padding: 6,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    toggleOption: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 20,
    },
    toggleOptionActive: {
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    toggleText: {
        fontSize: 15,
        fontFamily: FONT_FAMILY.BOLD,
        color: '#9CA3AF',
    },
    toggleTextActive: {
        color: colors.primaryDark,
    },
});
