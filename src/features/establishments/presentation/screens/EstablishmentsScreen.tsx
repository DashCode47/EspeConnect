import React, { useState, useEffect, useMemo } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainTabParamList } from '../../../../navigation/types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryFilter } from '../components/CategoryFilter';
import useHome from '../../../home/presentation/hooks/useHome';
import { Establishment } from '../../domain/entities/establishment.entity';
import EstablishmentModal from '../components/EstablishmentModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ASPECT_RATIOS = [1.25, 1, 0.75, 0.8, 1] as const;

interface MasonryEstablishmentCardProps {
    establishment: Establishment;
    aspectRatio: number;
    onPress: () => void;
}

const MasonryEstablishmentCard: React.FC<MasonryEstablishmentCardProps> = ({
    establishment,
    aspectRatio,
    onPress,
}) => {
    const cardWidth = (SCREEN_WIDTH - 48) / 2;
    const imageHeight = cardWidth * aspectRatio;
    const promotionCount = (establishment.promotions || []).filter(p => p.isActive).length;

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
                {promotionCount > 0 && (
                    <View style={styles.masonryBadge}>
                        <Text style={styles.masonryBadgeText}>
                            {promotionCount} BENEFICIO{promotionCount > 1 ? 'S' : ''}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.masonryContent}>
                <Text style={styles.masonryTitle} numberOfLines={1}>
                    {establishment.name}
                </Text>
                {establishment.type && (
                    <Text style={styles.masonrySubtitle} numberOfLines={1}>
                        {establishment.type}
                    </Text>
                )}
                <View style={styles.masonryFooter}>
                    <View style={styles.masonryDistance}>
                        <MaterialCommunityIcons name="map-marker" size={12} color="#999" />
                        <Text style={styles.masonryDistanceText} numberOfLines={1}>
                            {establishment.address || 'Frente a la ESPE'}
                        </Text>
                    </View>
                    <View style={styles.masonryActionButton}>
                        <MaterialCommunityIcons name="arrow-right" size={16} color={colors.white} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const EstablishmentsScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<MainTabParamList, 'establishments'>>();
    const insets = useSafeAreaInsets();
    const { establishments, fetchEstablishments } = useHome();
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [showModal, setShowModal] = useState(false);
    const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);

    useEffect(() => {
        if (route.params?.categoryId) {
            setSelectedCategory(route.params.categoryId);
        } else {
            setSelectedCategory('Todos');
        }
    }, [route.params?.categoryId]);

    useEffect(() => {
        fetchEstablishments({ limit: 100 });
    }, []);

    const categories = useMemo(() => {
        const uniqueTypes = [...new Set(establishments.map(e => e.type))].filter(Boolean) as string[];
        const getIconForType = (type: string) => {
            const lowerType = type.toLowerCase();
            if (lowerType.includes('caf')) return 'coffee';
            if (lowerType.includes('rest')) return 'silverware-fork-knife';
            if (lowerType.includes('comercio')) return 'store';
            if (lowerType.includes('entrete')) return 'controller-classic';
            if (lowerType.includes('estéti')) return 'content-cut';
            if (lowerType.includes('moda')) return 'tshirt-crew';
            if (lowerType.includes('tecno')) return 'laptop';
            return 'store';
        };
        const mapped = uniqueTypes.map(type => ({ id: type, name: type, icon: getIconForType(type) }));
        return [{ id: 'Todos', name: 'Todos', icon: 'apps' }, ...mapped];
    }, [establishments]);

    const filteredEstablishments = establishments.filter(est =>
        selectedCategory === 'Todos' || est.type === selectedCategory
    );

    const leftColumn = filteredEstablishments.filter((_, i) => i % 2 === 0);
    const rightColumn = filteredEstablishments.filter((_, i) => i % 2 === 1);

    const handleEstablishmentPress = (establishment: Establishment) => {
        setSelectedEstablishment(establishment);
        setShowModal(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f6f8f7" />

            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerSubtitle}>CAMPLUS</Text>
                    <Text style={styles.headerTitle}>Establecimientos</Text>
                </View>
            </View>

            <CategoryFilter
                categories={categories}
                selectedId={selectedCategory}
                onSelect={setSelectedCategory}
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.masonryContainer}>
                    <View style={styles.masonryColumn}>
                        {leftColumn.map((establishment, index) => (
                            <MasonryEstablishmentCard
                                key={establishment.id}
                                establishment={establishment}
                                aspectRatio={ASPECT_RATIOS[index % ASPECT_RATIOS.length]}
                                onPress={() => handleEstablishmentPress(establishment)}
                            />
                        ))}
                    </View>
                    <View style={styles.masonryColumn}>
                        {rightColumn.map((establishment, index) => (
                            <MasonryEstablishmentCard
                                key={establishment.id}
                                establishment={establishment}
                                aspectRatio={ASPECT_RATIOS[(index + 2) % ASPECT_RATIOS.length]}
                                onPress={() => handleEstablishmentPress(establishment)}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            {selectedEstablishment && (
                <EstablishmentModal
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    establishment={selectedEstablishment}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f8f7',
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: 'rgba(246, 248, 247, 0.8)',
    },
    headerTitleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    headerSubtitle: {
        fontSize: 10,
        fontFamily: FONT_FAMILY.BLACK,
        color: `${colors.primary}99`,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.primaryDark,
    },
    scrollContent: {
        padding: 16,
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
        top: 10,
        right: 10,
        backgroundColor: colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    masonryBadgeText: {
        fontSize: 9,
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.primaryDark,
    },
    masonryContent: {
        padding: 12,
        paddingTop: 8,
    },
    masonryTitle: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.primaryDark,
        marginBottom: 2,
    },
    masonrySubtitle: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.MEDIUM,
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
        fontSize: 10,
        fontFamily: FONT_FAMILY.REGULAR,
        color: '#999',
        flexShrink: 1,
    },
    masonryActionButton: {
        backgroundColor: colors.primary,
        width: 26,
        height: 26,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
