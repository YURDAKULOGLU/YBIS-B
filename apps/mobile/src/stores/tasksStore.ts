import { create } from 'zustand';
import { apiClient, apiHelpers } from '../services/api';
import type { Task, TaskCreate, TaskUpdate } from '@ybis/core';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    byPriority: Record<string, number>;
  } | null;
}

interface TasksActions {
  loadTasks: (filters?: { priority?: string; completed?: boolean; limit?: number; offset?: number }) => Promise<void>;
  createTask: (task: TaskCreate) => Promise<void>;
  updateTask: (taskId: string, updates: TaskUpdate) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string, completed: boolean) => Promise<void>;
  loadStats: () => Promise<void>;
  clearError: () => void;
  clearTasks: () => void;
}

type TasksStore = TasksState & TasksActions;

export const useTasksStore = create<TasksStore>((set, get) => ({
  // State
  tasks: [],
  isLoading: false,
  error: null,
  stats: null,

  // Actions
  loadTasks: async (filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      const result = await apiHelpers.withErrorHandling(() =>
        apiClient.tasks.listTasks({
          ...filters,
          priority: filters.priority as 'low' | 'medium' | 'high' | undefined
        })
      );

      if (result.success && result.data) {
        set({ 
          tasks: result.data.tasks || result.data,
          isLoading: false 
        });
      } else {
        throw new Error(result.error || 'Failed to load tasks');
      }
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  createTask: async (taskData: TaskCreate) => {
    set({ isLoading: true, error: null });

    try {
      const idempotencyKey = apiHelpers.generateIdempotencyKey('task');
      
      const result = await apiHelpers.withErrorHandling(() =>
        apiClient.tasks.createTask(taskData, idempotencyKey)
      );

      if (result.success && result.data) {
        const newTask = result.data.task;
        set(state => ({
          tasks: [newTask, ...state.tasks],
          isLoading: false,
        }));
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  updateTask: async (taskId: string, updates: TaskUpdate) => {
    set({ isLoading: true, error: null });

    try {
      const result = await apiHelpers.withErrorHandling(() =>
        apiClient.tasks.updateTask({ taskId, ...updates })
      );

      if (result.success && result.data) {
        const updatedTask = result.data.task;
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId ? updatedTask : task
          ),
          isLoading: false,
        }));
      } else {
        throw new Error(result.error || 'Failed to update task');
      }
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  deleteTask: async (taskId: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await apiHelpers.withErrorHandling(() =>
        apiClient.tasks.deleteTask({ taskId })
      );

      if (result.success) {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== taskId),
          isLoading: false,
        }));
      } else {
        throw new Error(result.error || 'Failed to delete task');
      }
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  completeTask: async (taskId: string, completed: boolean) => {
    set({ isLoading: true, error: null });

    try {
      const result = await apiHelpers.withErrorHandling(() =>
        apiClient.tasks.completeTask({ taskId, completed })
      );

      if (result.success && result.data) {
        const updatedTask = result.data.task;
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId ? updatedTask : task
          ),
          isLoading: false,
        }));
      } else {
        throw new Error(result.error || 'Failed to update task status');
      }
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  loadStats: async () => {
    try {
      const result = await apiHelpers.withErrorHandling(() =>
        apiClient.tasks.getTaskStats()
      );

      if (result.success && result.data) {
        set({ stats: result.data });
      }
    } catch (error) {
      console.error('Failed to load task stats:', error);
    }
  },

  clearError: () => set({ error: null }),
  clearTasks: () => set({ tasks: [], stats: null }),
}));