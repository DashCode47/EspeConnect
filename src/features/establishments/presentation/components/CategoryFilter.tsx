import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface CategoryFilterProps {
    categories: Category[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedId, onSelect }) => {
    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {categories.map((category) => {
                    const isSelected = selectedId === category.id;
                    return (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.pill,
                                isSelected ? styles.pillSelected : styles.pillUnselected
                            ]}
                            onPress={() => onSelect(category.id)}
                            activeOpacity={0.7}
                        >
                            {category.id !== 'Todos' && (
                                <MaterialCommunityIcons
                                    name={category.icon}
                                    size={18}
                                    color={isSelected ? colors.white : colors.primary}
                                />
                            )}
                            <Text style={[
                                styles.pillText,
                                isSelected ? styles.pillTextSelected : styles.pillTextUnselected
                            ]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 44,
        borderRadius: 22,
        gap: 8,
    },
    pillSelected: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    pillUnselected: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: `${colors.primary}1A`,
    },
    pillText: {
        fontSize: 14,
        fontFamily: 'LeagueSpartan-SemiBold',
    },
    pillTextSelected: {
        color: colors.white,
    },
    pillTextUnselected: {
        color: '#475569',
    },
});
