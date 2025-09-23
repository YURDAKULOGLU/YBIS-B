import { create } from 'zustand';
import type { Message } from '@ybis/core';

interface MessagesState {
  messages: Message[];
  addMessage: (
    message: Omit<Message, 'id' | 'timestamp'> &
      Partial<Pick<Message, 'id' | 'timestamp'>>
  ) => void;
  clearMessages: () => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  messages: [],

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: message.id ?? Date.now().toString(),
      timestamp: message.timestamp ?? Date.now(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },
  
  clearMessages: () => set({ messages: [] }),
}));
