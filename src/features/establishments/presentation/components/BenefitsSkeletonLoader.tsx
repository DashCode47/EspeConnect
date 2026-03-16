import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkeletonBox } from '../../../../components/SkeletonBox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// Varying heights to mimic the masonry layout
const LEFT_HEIGHTS  = [CARD_WIDTH * 1.25, CARD_WIDTH * 0.75, CARD_WIDTH * 1.0];
const RIGHT_HEIGHTS = [CARD_WIDTH * 1.0,  CARD_WIDTH * 1.25, CARD_WIDTH * 0.75];

export const BenefitsSkeletonLoader: React.FC = () => (
  <View style={styles.container}>
    {/* Category chips */}
    <View style={styles.chipsRow}>
      {[70, 90, 80, 75].map((w, i) => (
        <SkeletonBox key={i} width={w} height={34} borderRadius={20} />
      ))}
    </View>

    {/* Masonry grid */}
    <View style={styles.masonry}>
      {/* Left column */}
      <View style={styles.column}>
        {LEFT_HEIGHTS.map((h, i) => (
          <View key={i} style={[styles.card, { width: CARD_WIDTH }]}>
            <SkeletonBox width="100%" height={h} borderRadius={0} />
            <View style={styles.cardBody}>
              <SkeletonBox width="75%" height={14} borderRadius={6} />
              <SkeletonBox width="50%" height={12} borderRadius={6} />
            </View>
          </View>
        ))}
      </View>
      {/* Right column */}
      <View style={styles.column}>
        {RIGHT_HEIGHTS.map((h, i) => (
          <View key={i} style={[styles.card, { width: CARD_WIDTH }]}>
            <SkeletonBox width="100%" height={h} borderRadius={0} />
            <View style={styles.cardBody}>
              <SkeletonBox width="80%" height={14} borderRadius={6} />
              <SkeletonBox width="45%" height={12} borderRadius={6} />
            </View>
          </View>
        ))}
      </View>
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
  masonry: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
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
    gap: 6,
  },
});
