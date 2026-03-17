import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Image,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BenefitsStackParamList } from '../../../../navigation/types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Promotion, Establishment } from '../../domain/entities/establishment.entity';
import { BENEFIT_DETAILS } from '../../../../config/constants';
import { useEstablishmentStore } from '../store/establishment.store';
import { BenefitsSkeletonLoader } from '../components/BenefitsSkeletonLoader';

type BenefitsScreenNavigationProp = NativeStackNavigationProp<BenefitsStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ASPECT_RATIOS = [1.25, 1, 0.75, 0.8, 1] as const;

interface MasonryBenefitCardProps {
    promotion: Promotion;
    establishment: Establishment;
    aspectRatio: number;
    badgeRotation?: number;
    onPress: () => void;
}

const MasonryBenefitCard: React.FC<MasonryBenefitCardProps> = ({
    promotion,
    establishment,
    aspectRatio,
    badgeRotation = 0,
    onPress,
}) => {
    const cardWidth = (SCREEN_WIDTH - 48) / 2;
    const imageHeight = cardWidth * aspectRatio;

    const getDiscountLabel = () => {
        if (promotion?.discount !== undefined && promotion?.discount !== null && promotion.discount > 0) {
            return `${promotion.discount}% OFF`;
        }
        if (promotion?.title?.includes('2x1')) return '2x1';
        return null;
    };

    return (
        <TouchableOpacity
            style={[styles.masonryCard, { width: cardWidth }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={[styles.masonryImageContainer, { height: imageHeight }]}>
                {establishment.imageUrl ? (
                    <Image
                        source={{ uri: establishment.imageUrl }}
                        style={styles.masonryImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.masonryImagePlaceholder}>
                        <MaterialCommunityIcons name="store" size={48} color="#ccc" />
                    </View>
                )}

                {getDiscountLabel() && (
                    <View
                        style={[
                            styles.masonryBadge,
                            { transform: [{ rotate: `${badgeRotation}deg` }] },
                        ]}
                    >
                        <Text style={styles.masonryBadgeText}>{getDiscountLabel()}</Text>
                    </View>
                )}

                <View style={styles.masonryGradient} />
            </View>

            <View style={styles.masonryContent}>
                <Text style={styles.masonryTitle} numberOfLines={1}>
                    {establishment.name}
                </Text>
                <Text style={styles.masonrySubtitle} numberOfLines={1}>
                    {promotion.title || 'Promoción especial'}
                </Text>

                <View style={styles.masonryFooter}>
                    {establishment.address ? (
                        <View style={styles.masonryDistance}>
                            <MaterialCommunityIcons name="map-marker" size={14} color="#999" />
                            <Text style={styles.masonryDistanceText} numberOfLines={1}>{establishment.address}</Text>
                        </View>
                    ) : <View />}
                    <View style={styles.masonryActionButton}>
                        <MaterialCommunityIcons name="arrow-right" size={18} color={colors.white} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const BenefitsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<BenefitsScreenNavigationProp>();
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

    const { establishments, isLoading: loading, fetchEstablishments } = useEstablishmentStore();

    const categories = ['Todos', 'Comida', 'Bebidas', 'Entretenimiento', 'Otros'];

    const onRefresh = useCallback(() => {
        fetchEstablishments({ limit: 100 });
    }, [fetchEstablishments]);

    useEffect(() => {
        fetchEstablishments({ limit: 100 });
    }, []);

    const promotionsWithEstablishments = useMemo(() => {
        const allPromotionsData: Array<{ promotion: Promotion; establishment: Establishment }> = [];

        establishments.forEach(establishment => {
            const activePromotions = (establishment.promotions || []).filter(promo => promo.isActive);
            if (activePromotions.length > 0) {
            }

            activePromotions.forEach(promotion => {
                allPromotionsData.push({ promotion, establishment });
            });
        });

        const categoryMap: { [key: string]: string } = {
            'Todos': 'ALL',
            'Comida': 'FOOD',
            'Bebidas': 'DRINKS',
            'Entretenimiento': 'EVENTS',
            'Otros': 'OTHER',
        };

        const categoryFilter = categoryMap[selectedCategory] || 'ALL';

        if (categoryFilter === 'ALL') {
            return allPromotionsData;
        }

        const filtered = allPromotionsData.filter(item => item.promotion.category === categoryFilter);
        return filtered;
    }, [establishments, selectedCategory]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            <View style={[styles.header, { paddingTop: insets.top }]}>
                {navigation.canGoBack() && (
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryDark} />
                    </TouchableOpacity>
                )}
                <View style={[styles.headerTitleContainer, !navigation.canGoBack() && { left: 20 }]}>
                    <Text style={styles.headerSubtitle}>CAMPLUS</Text>
                    <Text style={styles.headerTitle}>Beneficios</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[colors.primary]} />
                }>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categorySlider}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryChip,
                                selectedCategory === category && styles.categoryChipActive,
                            ]}
                            onPress={() => setSelectedCategory(category)}>
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    selectedCategory === category && styles.categoryChipTextActive,
                                ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Todos los beneficios</Text>
                    {loading ? (
                        <BenefitsSkeletonLoader />
                    ) : promotionsWithEstablishments && promotionsWithEstablishments.length > 0 ? (
                        <View style={styles.masonryContainer}>
                            <View style={styles.masonryColumn}>
                                {promotionsWithEstablishments
                                    .filter((_, index) => index % 2 === 0)
                                    .map((item, index) => (
                                        <MasonryBenefitCard
                                            key={`${item.establishment.id}-${item.promotion.id}`}
                                            promotion={item.promotion}
                                            establishment={item.establishment}
                                            aspectRatio={ASPECT_RATIOS[index % ASPECT_RATIOS.length]}
                                            badgeRotation={index % 2 === 0 ? 3 : -2}
                                            onPress={() =>
                                                navigation.navigate(BENEFIT_DETAILS, {
                                                    data: { promotion: item.promotion, establishment: item.establishment },
                                                })
                                            }
                                        />
                                    ))}
                            </View>
                            <View style={styles.masonryColumn}>
                                {promotionsWithEstablishments
                                    .filter((_, index) => index % 2 === 1)
                                    .map((item, index) => (
                                        <MasonryBenefitCard
                                            key={`${item.establishment.id}-${item.promotion.id}`}
                                            promotion={item.promotion}
                                            establishment={item.establishment}
                                            aspectRatio={ASPECT_RATIOS[(index + 2) % ASPECT_RATIOS.length]}
                                            badgeRotation={index % 2 === 0 ? -1 : 2}
                                            onPress={() =>
                                                navigation.navigate(BENEFIT_DETAILS, {
                                                    data: { promotion: item.promotion, establishment: item.establishment },
                                                })
                                            }
                                        />
                                    ))}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="tag-off" size={48} color="#ccc" />
                            <Text style={styles.emptyStateText}>No hay beneficios disponibles</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: 'rgba(246, 248, 247, 0.8)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        zIndex: 10,
    },
    headerTitleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    headerSubtitle: {
        fontSize: 10,
        fontFamily: 'LeagueSpartan-Black',
        color: `${colors.primary}99`,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'LeagueSpartan-Bold',
        color: colors.primaryDark,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    categorySlider: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.white,
        marginRight: 12,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    categoryChipTextActive: {
        color: colors.white,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#131413',
        marginBottom: 16,
    },
    masonryContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    masonryColumn: {
        flex: 1,
        gap: 12,
    },
    masonryCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    masonryImageContainer: {
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
    },
    masonryImage: {
        width: '100%',
        height: '100%',
    },
    masonryImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    masonryBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: colors.accent,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    masonryBadgeText: {
        fontSize: 11,
        fontWeight: '900',
        color: colors.primaryDark,
    },
    masonryGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'transparent',
    },
    masonryContent: {
        padding: 12,
        paddingTop: 8,
    },
    masonryTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.primaryDark,
        marginBottom: 2,
    },
    masonrySubtitle: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.primary,
        marginBottom: 8,
    },
    masonryFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    masonryDistance: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginRight: 8,
        overflow: 'hidden',
    },
    masonryDistanceText: {
        fontSize: 11,
        color: '#999',
        flexShrink: 1,
    },
    masonryActionButton: {
        backgroundColor: colors.primary,
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
});
