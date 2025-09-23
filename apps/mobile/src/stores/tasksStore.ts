import { create } from 'zustand';
import { apiClient, apiHelpers } from '../services/api';
import type { Task, TaskCreate, TaskUpdate } from '@ybis/core';

type TaskPriority = Task['priority'];

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  byPriority: Record<TaskPriority, number>;
}

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  stats: TaskStats;
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

const createEmptyStats = (): TaskStats => ({
  total: 0,
  completed: 0,
  pending: 0,
  inProgress: 0,
  byPriority: {
    low: 0,
    medium: 0,
    high: 0,
  },
});

const computeStats = (tasks: Task[]): TaskStats => {
  return tasks.reduce<TaskStats>((acc, task) => {
    acc.total += 1;

    if (task.status === 'completed') {
      acc.completed += 1;
    } else if (task.status === 'in_progress') {
      acc.inProgress += 1;
    } else if (task.status === 'pending') {
      acc.pending += 1;
    }

    const priority = task.priority ?? 'medium';
    acc.byPriority[priority] += 1;

    return acc;
  }, createEmptyStats());
};

export const useTasksStore = create<TasksStore>((set, get) => ({
  // State
  tasks: [],
  isLoading: false,
  error: null,
  stats: createEmptyStats(),

  // Actions
  loadTasks: async (filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      const result = await apiHelpers.withErrorHandling<{ tasks?: Task[] } | Task[]>(() =>
        apiClient.tasks.listTasks({
          ...filters,
          priority: filters.priority as 'low' | 'medium' | 'high' | undefined
        })
      );

      if (result.success && result.data) {
        const tasks = (result.data as { tasks?: Task[] }).tasks ??
          (Array.isArray(result.data) ? (result.data as Task[]) : []);

        set({
          tasks,
          stats: computeStats(tasks),
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
      
      const result = await apiHelpers.withErrorHandling<{ task: Task }>(() =>
        apiClient.tasks.createTask(taskData, idempotencyKey)
      );

      if (result.success && result.data) {
        const newTask = result.data.task as Task;
        set(state => {
          const tasks = [newTask, ...state.tasks];
          return {
            tasks,
            stats: computeStats(tasks),
            isLoading: false,
          };
        });
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
      const result = await apiHelpers.withErrorHandling<{ task: Task }>(() =>
        apiClient.tasks.updateTask({ taskId, ...updates })
      );

      if (result.success && result.data) {
        const updatedTask = result.data.task as Task;
        set(state => {
          const tasks = state.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          );
          return {
            tasks,
            stats: computeStats(tasks),
            isLoading: false,
          };
        });
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
      const result = await apiHelpers.withErrorHandling<void>(() =>
        apiClient.tasks.deleteTask({ taskId })
      );

      if (result.success) {
        set(state => {
          const tasks = state.tasks.filter(task => task.id !== taskId);
          return {
            tasks,
            stats: computeStats(tasks),
            isLoading: false,
          };
        });
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
      const result = await apiHelpers.withErrorHandling<{ task: Task }>(() =>
        apiClient.tasks.completeTask({ taskId, completed })
      );

      if (result.success && result.data) {
        const updatedTask = result.data.task as Task;
        set(state => {
          const tasks = state.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          );
          return {
            tasks,
            stats: computeStats(tasks),
            isLoading: false,
          };
        });
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
      const result = await apiHelpers.withErrorHandling<TaskStats>(() =>
        apiClient.tasks.getTaskStats()
      );

      if (result.success && result.data) {
        const stats = result.data as Partial<TaskStats>;
        set({ stats: { ...createEmptyStats(), ...stats } });
      }
    } catch (error) {
      console.error('Failed to load task stats:', error);
    }
  },

  clearError: () => set({ error: null }),
  clearTasks: () => set({ tasks: [], stats: createEmptyStats() }),
}));