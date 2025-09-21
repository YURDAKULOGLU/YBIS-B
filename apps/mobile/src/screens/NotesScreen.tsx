import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type NotesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'RN 0.80 Migration Notes',
    content: 'React Native 0.80 migration completed successfully. Legacy Architecture is working perfectly.',
    createdAt: '2025-01-23T10:00:00Z',
  },
  {
    id: '2',
    title: 'FlashList Implementation',
    content: 'Vendor-free chat system implemented with FlashList. Performance is excellent.',
    createdAt: '2025-01-23T09:30:00Z',
  },
  {
    id: '3',
    title: 'RHF useWatch Migration',
    content: 'React Hook Form updated to 7.5x with useWatch pattern. Forms are working smoothly.',
    createdAt: '2025-01-23T09:00:00Z',
  },
];

export default function NotesScreen(): React.ReactElement {
  const navigation = useNavigation<NotesScreenNavigationProp>();
  const [notes] = useState<Note[]>(mockNotes);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
    >
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent} numberOfLines={2}>
        {item.content}
      </Text>
      <Text style={styles.noteDate}>
        {new Date(item.createdAt).toLocaleDateString('tr-TR')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});