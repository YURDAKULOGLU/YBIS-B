import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Markdown from '../Markdown';
import i18n from '../../i18n';

export type Note = {
  title: string;
  snippet: string; // markdown
};

export const NoteSnippet: React.FC<{ note: Note; onOpen?: () => void; onCopy?: () => void }> = ({ note, onOpen, onCopy }) => {
  const { tokens } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.textSecondary }] }>
      <Text style={[styles.title, { color: tokens.colors.text }]} numberOfLines={1}>
        📝 {note.title}
      </Text>
      <View style={{ marginTop: 6 }}>
        <Markdown color={tokens.colors.textSecondary}>{note.snippet}</Markdown>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="note-open" onPress={onOpen} style={[styles.cta, { backgroundColor: tokens.colors.primary }]}>
          <Text style={styles.ctaText}>{i18n.t('common.open')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="note-copy" onPress={onCopy} style={[styles.cta, { backgroundColor: tokens.colors.secondary }]}>
          <Text style={styles.ctaText}>{i18n.t('common.copy')}</Text>
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
  title: { fontSize: 15, fontWeight: '600' },
  cta: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  ctaText: { color: '#fff', fontWeight: '600' },
});

export default NoteSnippet;
