import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useTheme } from '../shared/theme/ThemeProvider';
import { useNotesStore } from '../shared/state/notesStore';
import { useRoute } from '@react-navigation/native';
import Markdown from '../shared/ui/Markdown';
import i18n from '../shared/i18n';

const NoteDetail: React.FC = () => {
  const { tokens } = useTheme();
  const route = useRoute<any>();
  const id = route.params?.id as string;
  const { notes, updateNote } = useNotesStore();
  const note = useMemo(() => notes.find((n) => n.id === id), [notes, id]);
  const [edit, setEdit] = useState(true);
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  const save = () => {
    if (!id) return;
    updateNote(id, { title, content });
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.background }]}> 
      <View style={styles.row}>
        <Text style={[styles.title, { color: tokens.colors.text }]}>{i18n.t('notes.detail', { defaultValue: 'Note Detail' })}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="toggle-edit" onPress={() => setEdit((v) => !v)}>
          <Text style={{ color: tokens.colors.primary, fontWeight: '600' }}>{edit ? i18n.t('common.render', { defaultValue: 'Render' }) : i18n.t('common.edit', { defaultValue: 'Edit' })}</Text>
        </Pressable>
      </View>
      {edit ? (
        <View style={{ gap: 8 }}>
          <TextInput
            accessibilityLabel="note-title"
            value={title}
            onChangeText={setTitle}
            placeholder={i18n.t('notes.titlePlaceholder', { defaultValue: 'Title' })}
            style={[styles.input, { color: tokens.colors.text, borderColor: tokens.colors.textSecondary }]}
          />
          <TextInput
            accessibilityLabel="note-content"
            value={content}
            onChangeText={setContent}
            placeholder={i18n.t('notes.contentPlaceholder', { defaultValue: 'Write...' })}
            multiline
            style={[styles.textarea, { color: tokens.colors.text, borderColor: tokens.colors.textSecondary }]}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="note-save" onPress={save} style={[styles.saveBtn, { backgroundColor: tokens.colors.success }]}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>{i18n.t('common.save', { defaultValue: 'Save' })}</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <Text style={[styles.noteTitle, { color: tokens.colors.text }]}>{title}</Text>
          <Markdown>{content}</Markdown>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, padding: 10 },
  textarea: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, padding: 10, minHeight: 200, textAlignVertical: 'top' },
  saveBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  noteTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
});

export default NoteDetail;
