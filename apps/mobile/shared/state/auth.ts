import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  login: (user: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  
  login: async (user: any) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ isAuthenticated: true, user });
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('user');
    set({ isAuthenticated: false, user: null });
  },
}));
