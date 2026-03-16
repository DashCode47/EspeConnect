import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkeletonBox } from '../../../../components/SkeletonBox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const MarketplaceCardSkeleton = () => (
  <View style={[styles.card, { width: CARD_WIDTH }]}>
    <SkeletonBox width="100%" height={CARD_WIDTH * 0.85} borderRadius={0} />
    <View style={styles.cardBody}>
      <SkeletonBox width="80%" height={15} borderRadius={6} />
      <SkeletonBox width="50%" height={13} borderRadius={6} />
      <View style={styles.cardFooter}>
        <SkeletonBox width={64} height={20} borderRadius={6} />
        <SkeletonBox width={32} height={32} borderRadius={16} />
      </View>
    </View>
  </View>
);

export const PostsSkeletonLoader: React.FC = () => (
  <View style={styles.container}>
    {/* Search bar */}
    <SkeletonBox width="100%" height={46} borderRadius={12} style={{ marginBottom: 12 }} />
    {/* Category chips */}
    <View style={styles.chipsRow}>
      {[80, 70, 90, 75].map((w, i) => (
        <SkeletonBox key={i} width={w} height={34} borderRadius={20} />
      ))}
    </View>
    {/* Grid */}
    <View style={styles.grid}>
      <MarketplaceCardSkeleton />
      <MarketplaceCardSkeleton />
      <MarketplaceCardSkeleton />
      <MarketplaceCardSkeleton />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardBody: {
    padding: 10,
    gap: 7,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});
