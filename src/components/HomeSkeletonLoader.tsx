import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles } from '../config/globalStyles';

const { width } = Dimensions.get('window');

const SkeletonBox: React.FC<{
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}> = ({ width: boxWidth = '100%', height, borderRadius = 8, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
      style={[
        {
          width: boxWidth,
          height,
          borderRadius,
          backgroundColor: '#E0E0E0',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const HomeSkeletonLoader: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{
        paddingBottom: globalStyles.getBottomSafeArea(insets) + 20,
      }}
      showsVerticalScrollIndicator={false}>
      {/* Header Placeholder */}
      <View style={styles.headerPlaceholder}>
        <View style={styles.headerContent}>
          <SkeletonBox width={48} height={48} borderRadius={24} />
          <SkeletonBox width={128} height={20} borderRadius={8} />
        </View>
        <SkeletonBox width={32} height={32} borderRadius={16} />
      </View>

      {/* Banner Placeholder */}
      <View style={styles.bannerPlaceholder}>
        <SkeletonBox width={width - 40} height={160} borderRadius={12} />
      </View>

      {/* Promotions Card Placeholders */}
      <View style={styles.promotionsContainer}>
        <SkeletonBox width={(width - 60) / 3} height={96} borderRadius={12} />
        <SkeletonBox width={(width - 60) / 3} height={96} borderRadius={12} />
        <SkeletonBox width={(width - 60) / 3} height={96} borderRadius={12} />
      </View>

      {/* Section Title Placeholder */}
      <View style={styles.sectionTitlePlaceholder}>
        <SkeletonBox width={192} height={24} borderRadius={8} />
      </View>

      {/* Marketplace Post Placeholders */}
      <View style={styles.postsContainer}>
        {/* Marketplace Card 1 */}
        <View style={styles.marketplaceCard}>
          <SkeletonBox width="100%" height={180} borderRadius={8} />
          <View style={styles.cardContent}>
            <SkeletonBox width="75%" height={20} borderRadius={8} />
            <SkeletonBox width="50%" height={16} borderRadius={8} />
            <SkeletonBox width="33%" height={16} borderRadius={8} />
          </View>
        </View>

        {/* Marketplace Card 2 */}
        <View style={styles.marketplaceCard}>
          <SkeletonBox width="100%" height={180} borderRadius={8} />
          <View style={styles.cardContent}>
            <SkeletonBox width="80%" height={20} borderRadius={8} />
            <SkeletonBox width="83%" height={16} borderRadius={8} />
            <SkeletonBox width="25%" height={16} borderRadius={8} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  headerPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerPlaceholder: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  promotionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 8,
  },
  sectionTitlePlaceholder: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
  },
  postsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  marketplaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  cardContent: {
    gap: 8,
  },
});

