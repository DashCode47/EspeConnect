import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  dayName: string;
  isToday: boolean;
  hasEvents: boolean;
  eventCount: number;
}

interface CalendarStripProps {
  days: CalendarDay[];
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
}

export const CalendarStrip = ({ days, selectedDate, onDaySelect }: CalendarStripProps) => {
  return (
    <View style={styles.calendarSection}>
      <Text style={styles.calendarTitle}>Calendario Semanal</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarContainer}>
        {days.map(day => {
          const isSelected =
            day.date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];

          return (
            <TouchableOpacity
              key={day.date.toISOString()}
              style={[
                styles.calendarDay,
                day.isToday && isSelected && styles.calendarDayToday,
                isSelected && !day.isToday && styles.calendarDaySelected,
              ]}
              onPress={() => onDaySelect(day.date)}
              activeOpacity={0.7}>
              <Text style={[
                styles.calendarDayName,
                isSelected && styles.calendarDayNameActive,
              ]}>
                {day.dayName}
              </Text>
              <Text style={[
                styles.calendarDayNumber,
                isSelected && styles.calendarDayNumberActive,
              ]}>
                {day.dayNumber}
              </Text>
              {day.hasEvents && isSelected && <View style={styles.calendarDayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarSection: {
    paddingTop: 16,
  },
  calendarTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  calendarContainer: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },
  calendarDay: {
    minWidth: 60,
    height: 72,
    backgroundColor: colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarDayToday: {
    minWidth: 64,
    height: 84,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderColor: colors.primary,
    transform: [{ translateY: -4 }],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarDayName: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  calendarDayNameActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  calendarDayNumber: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  calendarDayNumberActive: {
    color: colors.white,
    fontSize: 28,
  },
  calendarDayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
});
