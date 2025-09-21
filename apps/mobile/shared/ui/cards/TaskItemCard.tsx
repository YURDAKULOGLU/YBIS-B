import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import i18n from '../../i18n';

export type TaskItem = {
  title: string;
  due?: string; // ISO
  done?: boolean;
  priority?: 'low' | 'medium' | 'high';
};

export const TaskItemCard: React.FC<{ task: TaskItem; onComplete?: () => void }> = ({ task, onComplete }) => {
  const { tokens } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.textSecondary }] }>
      <Text style={[styles.title, { color: tokens.colors.text }]} numberOfLines={2}>
        {task.done ? '✅ ' : '☐ '} {task.title}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        {task.due ? (
          <Text style={[styles.meta, { color: tokens.colors.textSecondary }]}>📅 {new Date(task.due).toLocaleDateString()}</Text>
        ) : null}
        {task.priority ? (
          <Text style={[styles.meta, { color: tokens.colors.textSecondary }]}>⚑ {task.priority}</Text>
        ) : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="task-complete" onPress={onComplete} style={[styles.cta, { backgroundColor: tokens.colors.success }]}>
        <Text style={styles.ctaText}>{i18n.t('common.complete')}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13, marginTop: 6 },
  cta: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  ctaText: { color: '#fff', fontWeight: '600' },
});

export default TaskItemCard;
