import { create } from 'zustand';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesState {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  
  addNote: (note) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ notes: [...state.notes, newNote] }));
  },
  
  updateNote: (id, note) => {
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...note, updatedAt: new Date() } : n
      ),
    }));
  },
  
  deleteNote: (id) => {
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
  },
}));
