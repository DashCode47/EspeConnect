import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { Establishment } from '../../domain/entities/establishment.entity';

interface EstablishmentCardProps {
    establishment: Establishment;
    onPress: () => void;
}

export const EstablishmentCard: React.FC<EstablishmentCardProps> = ({ establishment, onPress }) => {
    const activePromotionsCount = establishment.promotions?.filter(p => p.isActive).length || 0;

    return (
        <TouchableOpacity style={styles.establishmentCard} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.establishmentCardImageContainer}>
                {establishment.imageUrl ? (
                    <Image
                        source={{ uri: establishment.imageUrl }}
                        style={styles.establishmentCardImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.establishmentCardImagePlaceholder}>
                        <MaterialCommunityIcons name="store" size={32} color={colors.primary} />
                    </View>
                )}
            </View>

            <View style={styles.establishmentCardInfo}>
                <View style={styles.establishmentCardNameRow}>
                    <Text style={styles.establishmentCardName} numberOfLines={1}>
                        {establishment.name}
                    </Text>
                    {activePromotionsCount > 0 && (
                        <View style={styles.benefitsBadge}>
                            <MaterialCommunityIcons name="tag" size={11} color="#fff" />
                            <Text style={styles.benefitsBadgeText}>
                                {activePromotionsCount} beneficio{activePromotionsCount > 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                </View>

                {establishment.description ? (
                    <Text style={styles.establishmentCardDescription} numberOfLines={2}>
                        {establishment.description}
                    </Text>
                ) : null}

                {establishment.address ? (
                    <View style={styles.establishmentCardAddress}>
                        <MaterialCommunityIcons name="map-marker-outline" size={13} color="#999" />
                        <Text style={styles.establishmentCardAddressText} numberOfLines={1}>
                            {establishment.address}
                        </Text>
                    </View>
                ) : null}
            </View>

            <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" style={styles.establishmentCardChevron} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    establishmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 12,
    },
    establishmentCardImageContainer: {
        width: 90,
        height: 90,
        flexShrink: 0,
    },
    establishmentCardImage: {
        width: '100%',
        height: '100%',
    },
    establishmentCardImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F7F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    establishmentCardInfo: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 4,
    },
    establishmentCardNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    establishmentCardName: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.primaryDark,
        flexShrink: 1,
    },
    benefitsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    benefitsBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    establishmentCardDescription: {
        fontSize: 13,
        color: '#777',
        lineHeight: 18,
    },
    establishmentCardAddress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    establishmentCardAddressText: {
        fontSize: 12,
        color: '#999',
        flexShrink: 1,
    },
    establishmentCardChevron: {
        marginRight: 12,
    },
});
