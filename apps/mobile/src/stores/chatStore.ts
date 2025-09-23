import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid';
import type { Message as CoreMessage } from '@ybis/core';

export interface ChatMessage extends CoreMessage {
  senderId: string;
  senderName: string;
  isOwn: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'failed';
  type: 'text' | 'image' | 'file';
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string) => void;
  addMessage: (
    message: Omit<ChatMessage, 'id' | 'timestamp'> &
      Partial<Pick<ChatMessage, 'id' | 'timestamp'>>
  ) => void;
  updateMessageStatus: (id: string, status: ChatMessage['status']) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,

      sendMessage: (content: string) => {
        const tempId = nanoid();
        const newMessage: ChatMessage = {
          id: tempId,
          content,
          role: 'user',
          timestamp: Date.now(),
          senderId: 'current-user',
          senderName: 'Sen',
          isOwn: true,
          status: 'sending',
          type: 'text',
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
          isLoading: true,
          error: null,
        }));

        // Simulate API call
        setTimeout(() => {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === tempId ? { ...msg, status: 'sent' } : msg
            ),
            isLoading: false,
          }));
        }, 1000);
      },

      addMessage: (messageData) => {
        const newMessage: ChatMessage = {
          ...messageData,
          id: messageData.id ?? nanoid(),
          timestamp: messageData.timestamp ?? Date.now(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      updateMessageStatus: (id: string, status: ChatMessage['status']) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, status } : msg
          ),
        }));
      },

      clearMessages: () => {
        set({ messages: [], error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);