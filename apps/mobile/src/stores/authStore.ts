import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

// Zod v4 schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().url().optional(),
});

export const AuthStateSchema = z.object({
  user: UserSchema.nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
});

// Types from schemas
export type User = z.infer<typeof UserSchema>;
export type AuthState = z.infer<typeof AuthStateSchema>;

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set: (partial: Partial<AuthStore> | ((state: AuthStore) => Partial<AuthStore>)) => void, get: () => AuthStore) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Validate email format with Zod v4
          z.string().email().parse(email);
          
          // TODO: Implement actual API call
          const mockUser: User = {
            id: '1',
            email,
            name: 'Test User',
            avatar: 'https://via.placeholder.com/150',
          };
          
          // Validate user data with Zod v4
          const validatedUser = UserSchema.parse(mockUser);
          
          set({ 
            user: validatedUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          let errorMessage = 'Login failed';
          
          if (error instanceof z.ZodError) {
            errorMessage = `Validation error: ${error.issues[0]?.message}`;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({ 
            error: errorMessage,
            isLoading: false 
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          // TODO: Implement actual logout API call
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false 
          });
        }
      },

      clearError: () => set({ error: null }),
      
      setUser: (user: User) => {
        try {
          const validatedUser = UserSchema.parse(user);
          set({ user: validatedUser, isAuthenticated: true });
        } catch (error) {
          set({ error: 'Invalid user data' });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AuthStore) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Zod v4 validation on rehydration
      onRehydrateStorage: () => (state: AuthStore | undefined) => {
        if (state?.user) {
          try {
            UserSchema.parse(state.user);
          } catch {
            // Clear invalid data
            state.user = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);