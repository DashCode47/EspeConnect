import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
    TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
    const insets = useSafeAreaInsets();
    const { establishments, fetchEstablishments, establishmentsLoading } = useHome();
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);

    useEffect(() => {
        fetchEstablishments();
    }, []);

    const categories = [
        { id: 'Todos', name: 'Todos', icon: 'apps' },
        { id: 'Cafeterías', name: 'Cafeterías', icon: 'coffee' },
        { id: 'Bibliotecas', name: 'Bibliotecas', icon: 'book-open-variant' },
        { id: 'Gimnasios', name: 'Gimnasios', icon: 'dumbbell' },
        { id: 'Librerías', name: 'Librerías', icon: 'library' },
    ];

    const filteredEstablishments = establishments.filter(est => {
        // Since establishment doesn't have category directly, we check if any promotion matches or just use the name for now
        // For the mock purpose, we can use a hardcoded category if needed or just skip the category filter check
        const matchesCategory = selectedCategory === 'Todos'; // Simplified for now
        const matchesSearch = est.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleEstablishmentPress = (establishment: Establishment) => {
        setSelectedEstablishment(establishment);
        setShowModal(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerSubtitle}>CAMPLUS</Text>
                    <Text style={styles.headerTitle}>Establecimientos</Text>
                </View>
                <TouchableOpacity style={styles.headerButton}>
                    <MaterialCommunityIcons name="magnify" size={24} color={colors.primary} />
                </TouchableOpacity>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
