import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import i18n from '../../i18n';
import Markdown from '../Markdown';

export type Email = {
  subject: string;
  from: string;
  date?: string; // ISO
  preview?: string; // markdown/plain
};

export const EmailSnippet: React.FC<{ email: Email; onRead?: () => void; onSummarize?: () => void }> = ({ email, onRead, onSummarize }) => {
  const { tokens } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.textSecondary }]}>
      <Text style={[styles.subject, { color: tokens.colors.text }]} numberOfLines={2}>
        ✉️ {email.subject}
      </Text>
      <Text style={[styles.meta, { color: tokens.colors.textSecondary }]} numberOfLines={1}>
        {email.from} {email.date ? `• ${new Date(email.date).toLocaleString()}` : ''}
      </Text>
      {email.preview ? (
        <View style={{ marginTop: 6 }}>
          <Markdown color={tokens.colors.textSecondary}>{email.preview}</Markdown>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="email-read" onPress={onRead} style={[styles.cta, { backgroundColor: tokens.colors.primary }]}>
          <Text style={styles.ctaText}>{i18n.t('common.read')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="email-summarize" onPress={onSummarize} style={[styles.cta, { backgroundColor: tokens.colors.secondary }]}>
          <Text style={styles.ctaText}>{i18n.t('common.summarize')}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
  subject: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 4 },
  cta: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  ctaText: { color: '#fff', fontWeight: '600' },
});

export default EmailSnippet;
