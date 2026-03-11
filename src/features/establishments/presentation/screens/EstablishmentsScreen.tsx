import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainTabParamList } from '../../../../navigation/types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EstablishmentListItem } from '../components/EstablishmentListItem';
import { CategoryFilter } from '../components/CategoryFilter';
import useHome from '../../../home/presentation/hooks/useHome'; // Using existing hook to fetch establishments
import { Establishment } from '../../domain/entities/establishment.entity';
import EstablishmentModal from '../components/EstablishmentModal';

export const EstablishmentsScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<MainTabParamList, 'establishments'>>();
    const insets = useSafeAreaInsets();
    const { establishments, fetchEstablishments, establishmentsLoading } = useHome();
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

        const mapped = uniqueTypes.map(type => ({
            id: type,
            name: type,
            icon: getIconForType(type)
        }));

        return [{ id: 'Todos', name: 'Todos', icon: 'apps' }, ...mapped];
    }, [establishments]);

    const filteredEstablishments = establishments.filter(est => {
        const matchesCategory = selectedCategory === 'Todos' || est.type === selectedCategory;
        return matchesCategory;
    });

    const handleEstablishmentPress = (establishment: Establishment) => {
        setSelectedEstablishment(establishment);
        setShowModal(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: 60 }]}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerSubtitle}>CAMPLUS</Text>
                    <Text style={styles.headerTitle}>Establecimientos</Text>
                </View>
            </View>

            {/* Categories */}
            <CategoryFilter
                categories={categories}
                selectedId={selectedCategory}
                onSelect={setSelectedCategory}
            />

            {/* List */}
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 100 } // Space for the navbar
                ]}
                showsVerticalScrollIndicator={false}
            >
                {filteredEstablishments.map((establishment) => (
                    <EstablishmentListItem
                        key={establishment.id}
                        establishment={establishment}
                        onPress={() => handleEstablishmentPress(establishment)}
                    />
                ))}
            </ScrollView>

            {/* Decorative Background Elements */}
            <View style={styles.blobBottom} pointerEvents="none" />
            <View style={styles.blobTop} pointerEvents="none" />

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
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: 'rgba(246, 248, 247, 0.8)',
    },
    headerButton: {
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
    scrollContent: {
        padding: 20,
        gap: 24,
    },
    blobBottom: {
        position: 'absolute',
        bottom: -40,
        right: -40,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: `${colors.accent}1A`,
        zIndex: -1,
    },
    blobTop: {
        position: 'absolute',
        top: 80,
        left: -40,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: `${colors.primary}0D`,
        zIndex: -1,
    }
});
