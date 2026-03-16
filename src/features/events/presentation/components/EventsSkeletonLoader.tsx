import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SkeletonBox } from '../../../../components/SkeletonBox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EventListItemSkeleton = () => (
  <View style={styles.listItem}>
    <SkeletonBox width={52} height={52} borderRadius={14} />
    <View style={styles.listItemContent}>
      <SkeletonBox width="70%" height={16} borderRadius={6} />
      <SkeletonBox width="45%" height={13} borderRadius={6} />
      <SkeletonBox width="55%" height={13} borderRadius={6} />
    </View>
    <SkeletonBox width={60} height={32} borderRadius={10} />
  </View>
);

const FeaturedCardSkeleton = () => (
  <View style={styles.featuredCard}>
    <SkeletonBox width="100%" height={140} borderRadius={0} />
    <View style={styles.featuredBody}>
      <SkeletonBox width="80%" height={16} borderRadius={6} />
      <SkeletonBox width="55%" height={13} borderRadius={6} />
    </View>
  </View>
);

export const EventsSkeletonLoader: React.FC = () => (
  <View style={styles.container}>
    {/* Calendar strip */}
    <View style={styles.calendarStrip}>
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <View key={i} style={styles.dayCol}>
          <SkeletonBox width={32} height={13} borderRadius={6} />
          <SkeletonBox width={38} height={38} borderRadius={19} />
        </View>
      ))}
    </View>

    {/* Featured horizontal scroll */}
    <View style={styles.section}>
      <SkeletonBox width={140} height={20} borderRadius={6} style={{ marginBottom: 12 }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
        <View style={styles.featuredRow}>
          <FeaturedCardSkeleton />
          <FeaturedCardSkeleton />
        </View>
      </ScrollView>
    </View>

    {/* Event list */}
    <View style={styles.section}>
      <SkeletonBox width={120} height={20} borderRadius={6} style={{ marginBottom: 12 }} />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  section: {
    marginBottom: 24,
  },
  featuredRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featuredCard: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  featuredBody: {
    padding: 12,
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  listItemContent: {
    flex: 1,
    gap: 6,
  },
});
