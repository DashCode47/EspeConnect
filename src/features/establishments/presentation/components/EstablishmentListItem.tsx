import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { Establishment } from '../../domain/entities/establishment.entity';

interface EstablishmentListItemProps {
    establishment: Establishment;
    onPress: () => void;
}

export const EstablishmentListItem: React.FC<EstablishmentListItemProps> = ({ establishment, onPress }) => {
    // Mocking some data for the premium feel if not in entity
    const rating = 4.8;
    const isRecommended = Math.random() > 0.5; // Mocking for UI demonstration
    const distance = "5 min"; // Mocking
    const isOpen = true; // Mocking

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                {establishment.imageUrl ? (
                    <Image
                        source={{ uri: establishment.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <MaterialCommunityIcons name="store" size={48} color={`${colors.primary}33`} />
                    </View>
                )}

                {isRecommended && (
                    <View style={styles.badgeRecommended}>
                        <Text style={styles.badgeText}>RECOMENDADO</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.bookmarkButton}>
                    <MaterialCommunityIcons name="bookmark" size={20} color={colors.white} />
                </TouchableOpacity>

                <View style={styles.ratingBadge}>
                    <MaterialCommunityIcons name="star" size={14} color={colors.accent} />
                    <Text style={styles.ratingText}>{rating}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.name} numberOfLines={1}>{establishment.name}</Text>
                    <Text style={styles.category} numberOfLines={1}>CAFETERÍA</Text>
                </View>

                <View style={styles.footerRow}>
                    <View style={styles.statusContainer}>
                        <MaterialCommunityIcons
                            name={isOpen ? "clock-outline" : "lock-outline"}
                            size={16}
                            color={isOpen ? colors.primary : '#94A3B8'}
                        />
                        <Text style={[
                            styles.statusText,
                            { color: isOpen ? colors.primary : '#94A3B8' }
                        ]}>
                            {isOpen ? "Abierto ahora" : "Cerrado"}
                        </Text>
                    </View>

                    <View style={styles.distanceContainer}>
                        <MaterialCommunityIcons name="map-marker-distance" size={16} color="#94A3B8" />
                        <Text style={styles.distanceText}>A {distance}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#105B39',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
        borderWidth: 1,
        borderColor: `${colors.primary}08`,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeRecommended: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.primaryDark,
        letterSpacing: -0.2,
    },
    bookmarkButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontFamily: 'LeagueSpartan-Bold',
        color: colors.primaryDark,
    },
    content: {
        padding: 20,
        gap: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 20,
        fontFamily: 'LeagueSpartan-Bold',
        color: colors.primaryDark,
        flex: 1,
        marginRight: 8,
    },
    category: {
        fontSize: 11,
        fontFamily: 'LeagueSpartan-Bold',
        color: `${colors.primary}B3`,
        textTransform: 'uppercase',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: 14,
        fontFamily: 'LeagueSpartan-SemiBold',
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    distanceText: {
        fontSize: 14,
        fontFamily: 'LeagueSpartan-Medium',
        color: '#64748B',
    },
});
