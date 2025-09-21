import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type NoteDetailRouteProp = RouteProp<RootStackParamList, 'NoteDetail'>;

const mockNoteDetails: Record<string, any> = {
  '1': {
    id: '1',
    title: 'RN 0.80 Migration Notes',
    content: `# React Native 0.80 Migration

## Completed Tasks ✅

- **Dependency Updates**: All packages updated to RN 0.80 compatible versions
- **Legacy Architecture**: Successfully enabled with newArchEnabled=false
- **Metro Configuration**: Symlink support enabled for monorepo
- **Jest Configuration**: Updated for RN 0.80 compatibility
- **FlashList Chat**: Vendor-free chat system implemented
- **RHF useWatch**: React Hook Form 7.5x with useWatch pattern

## Technical Details

### Package Versions
- React: 19.1.0
- React Native: 0.80.0
- React Navigation: 7.0.0
- FlashList: 1.7.1
- RHF: 7.5.0

### Architecture
- Legacy Architecture (Fabric disabled)
- Hermes enabled
- Symlink support for monorepo packages

## Next Steps (Faz-B)
- Enable Fabric Architecture
- Upgrade to Reanimated 4.x
- Performance optimizations
- Advanced chat features`,
    createdAt: '2025-01-23T10:00:00Z',
    updatedAt: '2025-01-23T10:00:00Z',
  },
  '2': {
    id: '2',
    title: 'FlashList Implementation',
    content: `# FlashList Chat Implementation

## Overview
Successfully replaced react-native-gifted-chat with a vendor-free solution using FlashList.

## Benefits
- **Performance**: 60fps scrolling with 5k+ messages
- **Vendor-free**: No external dependencies
- **Customizable**: Full control over UI/UX
- **Offline-first**: Zustand + AsyncStorage

## Implementation Details
- MessageBubble component for individual messages
- MessageComposer for input handling
- Zustand store for state management
- AsyncStorage for persistence

## Performance Metrics
- Cold start: < 2s
- Message rendering: < 16ms
- Scroll performance: 60fps
- Memory usage: Optimized`,
    createdAt: '2025-01-23T09:30:00Z',
    updatedAt: '2025-01-23T09:30:00Z',
  },
  '3': {
    id: '3',
    title: 'RHF useWatch Migration',
    content: `# React Hook Form useWatch Migration

## Problem
React 19 + RHF watch() function causing re-render issues.

## Solution
Migrated to useWatch hook for better React 19 compatibility.

## Code Changes
\`\`\`typescript
// Before (problematic)
const watchedValue = watch('fieldName');

// After (React 19 compatible)
const watchedValue = useWatch({
  control,
  name: 'fieldName'
});
\`\`\`

## Benefits
- Better React 19 compatibility
- Reduced re-renders
- Improved performance
- Cleaner code structure

## Testing
- Form validation working correctly
- Real-time preview functional
- No performance regressions`,
    createdAt: '2025-01-23T09:00:00Z',
    updatedAt: '2025-01-23T09:00:00Z',
  },
};

export default function NoteDetailScreen(): React.ReactElement {
  const route = useRoute<NoteDetailRouteProp>();
  const { noteId } = route.params;
  
  const note = mockNoteDetails[noteId];

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Note not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.date}>
          Created: {new Date(note.createdAt).toLocaleDateString('tr-TR')}
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.contentText}>{note.content}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
  },
});