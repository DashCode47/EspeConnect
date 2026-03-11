import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';

interface OfferHeroCardProps {
    onPublish: () => void;
}

export const OfferHeroCard: React.FC<OfferHeroCardProps> = ({ onPublish }) => {
    return (
        <View style={styles.offerHeroCard}>
            {/* Decorative blobs */}
            <View style={styles.heroBlob1} />
            <View style={styles.heroBlob2} />
            <View style={styles.heroBlob3} />

            <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>¿A dónde vas hoy?</Text>
                <Text style={styles.heroSubtitle}>Comparte tu ruta y reduce costos.</Text>

                <TouchableOpacity
                    style={styles.publishButton}
                    onPress={onPublish}
                    activeOpacity={0.9}>
                    <MaterialCommunityIcons name="plus-circle" size={28} color={colors.primary} />
                    <Text style={styles.publishButtonText}>Publicar Nueva Ruta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    offerHeroCard: {
        backgroundColor: colors.primary,
        borderRadius: 32,
        marginHorizontal: 16,
        padding: 32,
        marginBottom: 24,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    heroBlob1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    heroBlob2: {
        position: 'absolute',
        bottom: -60,
        left: -20,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    heroBlob3: {
        position: 'absolute',
        top: 20,
        left: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    heroContent: {
        zIndex: 10,
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 26,
        fontFamily: FONT_FAMILY.BLACK,
        color: colors.white,
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 15,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginBottom: 28,
    },
    publishButton: {
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 20,
        gap: 12,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    publishButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontFamily: FONT_FAMILY.BLACK,
        letterSpacing: -0.2,
    },
});
