import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { Promotion, Establishment } from '../../domain/entities/establishment.entity';

interface BenefitCardProps {
    promotion: Promotion;
    establishment: Establishment;
    onPress: () => void;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ promotion, establishment, onPress }) => {
    // Determine badge color and text
    const isSpecial = promotion.discount && promotion.discount >= 20;
    const badgeColor = isSpecial ? colors.accent : colors.primary;
    const badgeBg = isSpecial ? `${colors.accent}33` : `${colors.primary}1A`;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.row}>
                {/* Image Section (1/3) */}
                <View style={styles.imageWrapper}>
                    {promotion.imageUrl || establishment.imageUrl ? (
                        <Image
                            source={{ uri: promotion.imageUrl || establishment.imageUrl }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholder}>
                            <MaterialCommunityIcons name="ticket-percent" size={32} color={`${colors.primary}33`} />
                        </View>
                    )}
                </View>

                {/* Content Section (2/3) */}
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={styles.brandName} numberOfLines={1}>
                            {establishment.name}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                            <Text style={[styles.badgeText, { color: badgeColor }]}>
                                {(promotion.title || 'BENEFICIO').toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.description} numberOfLines={2}>
                        {promotion.description || 'Consulta los detalles en el establecimiento.'}
                    </Text>

                    <View style={styles.footer}>
                        <Text style={styles.actionText}>VER BENEFICIO</Text>
                        <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: `${colors.primary}0D`,
        marginBottom: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        height: 120,
    },
    imageWrapper: {
        width: '33%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '67%',
        padding: 16,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    brandName: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan-Bold',
        color: colors.primaryDark,
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: 'LeagueSpartan-Bold',
    },
    description: {
        fontSize: 13,
        fontFamily: 'LeagueSpartan-Regular',
        color: '#64748B',
        lineHeight: 18,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 10,
        fontFamily: 'LeagueSpartan-Bold',
        color: colors.primary,
        letterSpacing: 0.5,
    },
});
