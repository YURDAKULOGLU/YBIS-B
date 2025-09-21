import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import i18n from '../../i18n';

export type Event = {
  title: string;
  start: string; // ISO
  end?: string; // ISO
  location?: string;
};

export const EventCard: React.FC<{ event: Event; onOpen?: () => void; onSnooze?: () => void; onCancel?: () => void; }> = ({ event, onOpen, onSnooze, onCancel }) => {
  const { tokens } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.textSecondary }] }>
      <Text style={[styles.title, { color: tokens.colors.text }]} numberOfLines={1}>
        {event.title}
      </Text>
      <Text style={[styles.meta, { color: tokens.colors.textSecondary }]}>⏰ {new Date(event.start).toLocaleString()}</Text>
      {event.location ? (
        <Text style={[styles.meta, { color: tokens.colors.textSecondary }]}>📍 {event.location}</Text>
      ) : null}
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="event-open" onPress={onOpen} style={[styles.cta, { backgroundColor: tokens.colors.primary }]}>
          <Text style={styles.ctaText}>{i18n.t('common.open')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="event-snooze" onPress={onSnooze} style={[styles.cta, { backgroundColor: tokens.colors.secondary }]}>
          <Text style={styles.ctaText}>{i18n.t('common.snooze')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="event-cancel" onPress={onCancel} style={[styles.cta, { backgroundColor: tokens.colors.error }]}>
          <Text style={styles.ctaText}>{i18n.t('common.cancel')}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  meta: { fontSize: 13 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cta: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  ctaText: { color: '#fff', fontWeight: '600' },
});

export default EventCard;
