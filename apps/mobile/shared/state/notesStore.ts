import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt?: string;
}

interface NotesState {
  notes: NoteItem[];
  hydrate: () => Promise<void>;
  addNote: (note: NoteItem) => void;
  updateNote: (id: string, patch: Partial<NoteItem>) => void;
}

const STORAGE_KEY = 'ybis.notes.v1';

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ notes: JSON.parse(raw) });
    } catch {}
  },
  addNote: (note) => {
    set((s) => {
      const next = [{ ...note, updatedAt: new Date().toISOString() }, ...s.notes];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { notes: next };
    });
  },
  updateNote: (id, patch) => {
    set((s) => {
      const next = s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n));
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { notes: next };
    });
  },
}));

