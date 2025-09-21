import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNotesStore } from '../shared/state/notesStore';
import { useTheme } from '../shared/theme/ThemeProvider';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import i18n from '../shared/i18n';

const NotesList: React.FC = () => {
  const { tokens } = useTheme();
  const { notes, hydrate } = useNotesStore();
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.background }]}> 
      <Text style={[styles.title, { color: tokens.colors.text }]}>{i18n.t('notes.title')}</Text>
      {notes.length === 0 ? (
        <Text style={{ color: tokens.colors.textSecondary }}>{i18n.t('notes.empty', { defaultValue: 'No notes yet' })}</Text>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`open-note-${item.id}`}
              onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
              style={[styles.item, { borderColor: tokens.colors.textSecondary }]}
            >
              <Text style={{ color: tokens.colors.text, fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: tokens.colors.textSecondary }} numberOfLines={1}>{item.content}</Text>
            </Pressable>
          )}
        />
      )}
      <Text style={{ marginTop: 8, color: tokens.colors.textSecondary }}>{i18n.t('notes.sync', { defaultValue: 'Sync: OK' })}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  item: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
});

export default NotesList;
