import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from '../../../../components/SkeletonBox';

const TripCardSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <SkeletonBox width={40} height={40} borderRadius={20} />
      <View style={styles.headerText}>
        <SkeletonBox width="60%" height={15} borderRadius={6} />
        <SkeletonBox width="40%" height={13} borderRadius={6} />
      </View>
      <SkeletonBox width={64} height={30} borderRadius={10} />
    </View>
    <View style={styles.routeRow}>
      <View style={styles.routeDot} />
      <SkeletonBox width="70%" height={13} borderRadius={6} />
    </View>
    <View style={styles.routeRow}>
      <View style={[styles.routeDot, styles.routeDotEnd]} />
      <SkeletonBox width="55%" height={13} borderRadius={6} />
    </View>
    <View style={styles.cardFooter}>
      <SkeletonBox width={80} height={13} borderRadius={6} />
      <SkeletonBox width={56} height={13} borderRadius={6} />
      <SkeletonBox width={64} height={13} borderRadius={6} />
    </View>
  </View>
);

export const RidesSkeletonLoader: React.FC = () => (
  <View style={styles.container}>
    {/* Tab toggle */}
    <SkeletonBox width="100%" height={46} borderRadius={14} style={{ marginBottom: 16 }} />
    {/* Search inputs */}
    <SkeletonBox width="100%" height={46} borderRadius={12} style={{ marginBottom: 10 }} />
    <SkeletonBox width="100%" height={46} borderRadius={12} style={{ marginBottom: 20 }} />
    {/* Cards */}
    <TripCardSkeleton />
    <TripCardSkeleton />
    <TripCardSkeleton />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  routeDotEnd: {
    backgroundColor: '#D1D5DB',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
