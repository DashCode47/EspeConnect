import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';

export type TabType = 'eventos' | 'planes';

interface EventsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const EventsTabs = ({ activeTab, onTabChange }: EventsTabsProps) => {
  return (
    <View style={styles.tabsContainer}>
      <View style={styles.tabsWrapper}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'eventos' && styles.tabActive]}
          onPress={() => onTabChange('eventos')}
          activeOpacity={0.7}>
          <Text style={[styles.tabText, activeTab === 'eventos' && styles.tabTextActive]}>
            Eventos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'planes' && styles.tabActive]}
          onPress={() => onTabChange('planes')}
          activeOpacity={0.7}>
          <Text style={[styles.tabText, activeTab === 'planes' && styles.tabTextActive]}>
            Planes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(246, 248, 247, 0.95)',
  },
  tabsWrapper: {
    backgroundColor: colors.white,
    padding: 4,
    borderRadius: 100,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#6B7280',
  },
  tabTextActive: {
    color: colors.white,
  },
});
