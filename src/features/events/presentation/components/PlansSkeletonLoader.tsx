import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkeletonBox } from '../../../../components/SkeletonBox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

const PlanCardSkeleton = () => (
  <View style={[styles.card, { width: CARD_WIDTH }]}>
    {/* Colored top block */}
    <SkeletonBox width="100%" height={80} borderRadius={0} />
    {/* Body */}
    <View style={styles.body}>
      <View style={styles.metaRow}>
        <SkeletonBox width={56} height={18} borderRadius={6} />
        <SkeletonBox width={64} height={14} borderRadius={6} />
      </View>
      <SkeletonBox width="90%" height={14} borderRadius={6} />
      <SkeletonBox width="65%" height={14} borderRadius={6} />
      <SkeletonBox width="50%" height={12} borderRadius={6} />
    </View>
    {/* Footer */}
    <View style={styles.footer}>
      <View style={styles.avatarRow}>
        <SkeletonBox width={24} height={24} borderRadius={12} />
        <SkeletonBox width={24} height={24} borderRadius={12} style={{ marginLeft: -7 }} />
      </View>
      <SkeletonBox width={64} height={30} borderRadius={10} />
    </View>
  </View>
);

export const PlansSkeletonLoader: React.FC = () => (
  <View style={styles.grid}>
    {[0, 1, 2, 3, 4, 5].map(i => <PlanCardSkeleton key={i} />)}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  body: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
