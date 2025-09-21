import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Zod v4 schemas for notes
export const NoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().max(50000),
  tags: z.array(z.string()).default([]),
  isArchived: z.boolean().default(false),
  isStarred: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

export type Note = z.infer<typeof NoteSchema>;

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedTags: string[];
}

interface NotesActions {
  // CRUD operations
  addNote: (title: string, content: string, tags?: string[]) => void;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'isStarred' | 'isArchived'>>) => void;
  deleteNote: (id: string) => void;
  
  // Search and filter
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  
  // Bulk operations
  archiveNotes: (ids: string[]) => void;
  starNotes: (ids: string[]) => void;
  deleteNotes: (ids: string[]) => void;
  
  // Sync operations (for future API integration)
  syncNotes: () => Promise<void>;
  
  // Utility
  clearError: () => void;
  getFilteredNotes: () => Note[];
  getAllTags: () => string[];
}

type NotesStore = NotesState & NotesActions;

export const useNotesStore = create<NotesStore>()(
  persist(
    (set: (partial: Partial<NotesStore> | ((state: NotesStore) => Partial<NotesStore>)) => void, get: () => NotesStore) => ({
      // State
      notes: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedTags: [],

      // CRUD Actions
      addNote: (title: string, content: string, tags: string[] = []) => {
        const now = new Date().toISOString();
        const newNote: Note = {
          id: nanoid(),
          title,
          content,
          tags,
          isArchived: false,
          isStarred: false,
          createdAt: now,
          updatedAt: now,
        };

        try {
          const validatedNote = NoteSchema.parse(newNote);
        set((state: NotesStore) => ({
          notes: [validatedNote, ...state.notes],
        }));
        } catch (error) {
          set({ error: 'Failed to create note: Invalid data' });
        }
      },

      updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'isStarred' | 'isArchived'>>) => {
        set((state: NotesStore) => ({
          notes: state.notes.map((note: Note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note
          ),
        }));
      },

      deleteNote: (id: string) => {
        set((state: NotesStore) => ({
          notes: state.notes.filter((note: Note) => note.id !== id),
        }));
      },

      // Search and filter
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      
      setSelectedTags: (tags: string[]) => set({ selectedTags: tags }),

      // Bulk operations
      archiveNotes: (ids: string[]) => {
        set((state: NotesStore) => ({
          notes: state.notes.map((note: Note) =>
            ids.includes(note.id)
              ? { ...note, isArchived: true, updatedAt: new Date().toISOString() }
              : note
          ),
        }));
      },

      starNotes: (ids: string[]) => {
        set((state: NotesStore) => ({
          notes: state.notes.map((note: Note) =>
            ids.includes(note.id)
              ? { ...note, isStarred: true, updatedAt: new Date().toISOString() }
              : note
          ),
        }));
      },

      deleteNotes: (ids: string[]) => {
        set((state: NotesStore) => ({
          notes: state.notes.filter((note: Note) => !ids.includes(note.id)),
        }));
      },

      // Sync (placeholder for API integration)
      syncNotes: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Implement API sync
          await new Promise<void>(resolve => setTimeout(resolve, 1000)); // Mock delay
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Sync failed',
            isLoading: false,
          });
        }
      },

      // Utility functions
      clearError: () => set({ error: null }),

      getFilteredNotes: () => {
        const { notes, searchQuery, selectedTags } = get();
        
        return notes.filter((note: Note) => {
          // Search filter
          const matchesSearch = !searchQuery || 
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Tags filter
          const matchesTags = selectedTags.length === 0 ||
            selectedTags.some((tag: string) => note.tags.includes(tag));
          
          return matchesSearch && matchesTags && !note.isArchived;
        });
      },

      getAllTags: () => {
        const { notes } = get();
        const allTags = notes.flatMap((note: Note) => note.tags);
        return [...new Set(allTags)].sort();
      },
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: NotesStore) => ({
        notes: state.notes,
      }),
      // Validate notes on rehydration
      onRehydrateStorage: () => (state: NotesStore | undefined) => {
        if (state?.notes) {
          try {
            state.notes = state.notes.filter((note: Note) => {
              try {
                NoteSchema.parse(note);
                return true;
              } catch {
                return false; // Remove invalid notes
              }
            });
          } catch {
            state.notes = [];
          }
        }
      },
    }
  )
);
