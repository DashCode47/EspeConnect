import React, { useRef, useEffect } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
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
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (categories.length > 0) {
            const index = categories.findIndex(c => c.id === selectedId);
            if (index !== -1) {
                flatListRef.current?.scrollToIndex({
                    index,
                    animated: true,
                    viewPosition: 0.5 // Centers the item
                });
            }
        }
    }, [selectedId, categories]);

    const renderItem = ({ item: category }: { item: Category }) => {
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
    };

    return (
        <View style={styles.outerContainer}>
            <FlatList
                ref={flatListRef}
                data={categories}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
                onScrollToIndexFailed={(info) => {
                    // Fallback if the list isn't ready
                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
                    }, 100);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: 'transparent',
    },
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
        marginRight: 12, // Gap replacement for FlatList if legacy RN
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
