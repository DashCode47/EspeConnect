import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { Establishment } from '../../domain/entities/establishment.entity';

interface EstablishmentCategoriesProps {
    establishments: Establishment[];
}

export const EstablishmentCategories: React.FC<EstablishmentCategoriesProps> = ({ establishments }) => {
    const navigation = useNavigation<any>();

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

        return uniqueTypes.map(type => ({
            id: type,
            name: type,
            icon: getIconForType(type)
        }));
    }, [establishments]);

    const handleSeeAll = () => {
        // Navigate to establishments tab with no category
        navigation.navigate('establishments', { categoryId: undefined });
    };

    if (categories.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Establecimientos</Text>
                <TouchableOpacity onPress={handleSeeAll}>
                    <Text style={styles.seeAllText}>Ver todos</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={styles.categoryItem}
                        onPress={() => navigation.navigate('establishments', { categoryId: category.id })}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons
                                name={category.icon}
                                size={28}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={styles.categoryName} numberOfLines={1}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.primaryDark,
    },
    seeAllText: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        color: `${colors.primary}99`,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 20,
        paddingBottom: 4,
    },
    categoryItem: {
        alignItems: 'center',
        gap: 10,
        minWidth: 70,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: `${colors.primary}0D`,
    },
    categoryName: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: colors.primaryDark,
        textAlign: 'center',
    },
});
