import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';

interface TripSectionHeaderProps {
    title: string;
    iconName: string;
    iconColor: string;
    style?: ViewStyle;
}

export const TripSectionHeader: React.FC<TripSectionHeaderProps> = ({
    title,
    iconName,
    iconColor,
    style
}) => {
    return (
        <View style={[styles.sectionHeader, style]}>
            <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 24,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primaryDark,
        letterSpacing: 0.5,
    },
});
