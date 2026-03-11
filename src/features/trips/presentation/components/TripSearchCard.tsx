import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';

interface TripSearchCardProps {
    origin: string;
    setOrigin: (origin: string) => void;
    destination: string;
    setDestination: (destination: string) => void;
    onSearch: () => void;
}

export const TripSearchCard: React.FC<TripSearchCardProps> = ({
    origin,
    setOrigin,
    destination,
    setDestination,
    onSearch,
}) => {
    return (
        <View style={styles.searchCard}>
            {/* Decorative blob */}
            <View style={styles.decorativeBlob} />

            <View style={styles.searchCardContent}>
                {/* Origin Input */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="circle-outline" size={20} color={colors.primary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Origen (ej. Universidad)"
                        placeholderTextColor="#9CA3AF"
                        value={origin}
                        onChangeText={setOrigin}
                    />
                </View>

                {/* Connector dots */}
                <View style={styles.inputConnector} />

                {/* Destination Input */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="map-marker" size={20} color={colors.accent} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Destino (ej. Centro)"
                        placeholderTextColor="#9CA3AF"
                        value={destination}
                        onChangeText={setDestination}
                    />
                </View>

                {/* Search Button */}
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={onSearch}
                    activeOpacity={0.8}>
                    <MaterialCommunityIcons name="magnify" size={20} color={colors.white} />
                    <Text style={styles.searchButtonText}>Buscar Ruta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    searchCard: {
        backgroundColor: colors.white,
        borderRadius: 24,
        marginHorizontal: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 6,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    decorativeBlob: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: `${colors.primary}08`,
    },
    searchCardContent: {
        gap: 0,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    inputConnector: {
        width: 2,
        height: 12,
        backgroundColor: '#E5E7EB',
        marginLeft: 26,
        marginVertical: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: colors.primaryDark,
        padding: 0,
    },
    searchButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
        marginTop: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
    searchButtonText: {
        color: colors.white,
        fontSize: 16,
        fontFamily: FONT_FAMILY.BOLD,
    },
});
