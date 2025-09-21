import { Hono, Context } from 'hono';
import { z } from 'zod';
import { Ok, Err } from '../src/shared/tools/schemas';
import { validateIdempotencyKey, checkAndSet, storeResult, getStoredResult } from '../src/shared/utils/idempotency';
import { checkRateLimit } from '../src/shared/utils/rateLimit';

const app = new Hono();

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  completed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const TaskListRequestSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  completed: z.boolean().optional(),
});

const TaskCreateRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
});

const TaskUpdateRequestSchema = z.object({
  taskId: z.string(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
});

const TaskDeleteRequestSchema = z.object({
  taskId: z.string(),
});

const TaskCompleteRequestSchema = z.object({
  taskId: z.string(),
  completed: z.boolean(),
});

// Mock task storage (in production, use actual database)
const tasks: Array<z.infer<typeof TaskSchema>> = [];

// List tasks
app.post('/list', async (c: Context) => {
  try {
    const userId = 'current-user-id'; // Get from auth
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(userId, 'tool', 100, 600); // 100 requests per 10 minutes
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = TaskListRequestSchema.parse(body);
    
    let filteredTasks = tasks;
    
    if (request.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === request.priority);
    }
    
    if (request.completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.completed === request.completed);
    }
    
    const totalCount = filteredTasks.length;
    const paginatedTasks = filteredTasks
      .slice(request.offset, request.offset + request.limit);
    
    return c.json(Ok({
      tasks: paginatedTasks,
      pagination: {
        total: totalCount,
        limit: request.limit,
        offset: request.offset,
        hasMore: request.offset + request.limit < totalCount,
      },
    }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to list tasks'), 500);
  }
});

// Create task
app.post('/create', async (c: Context) => {
  try {
    const userId = 'current-user-id'; // Get from auth
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(userId, 'tool', 10, 600); // 10 creates per 10 minutes
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = TaskCreateRequestSchema.parse(body);
    
    // Idempotency check
    const idempotencyKey = c.req.header('X-Idempotency-Key');
    if (idempotencyKey) {
      if (!validateIdempotencyKey(idempotencyKey)) {
        return c.json(Err('INVALID_IDEMPOTENCY_KEY', 'Invalid idempotency key format'), 400);
      }
      
      const isFirst = await checkAndSet(idempotencyKey);
      if (!isFirst) {
        const storedResult = await getStoredResult(idempotencyKey);
        if (storedResult) {
          return c.json(storedResult);
        }
      }
    }
    
    const now = new Date().toISOString();
    const newTask: z.infer<typeof TaskSchema> = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: request.title,
      description: request.description,
      priority: request.priority,
      dueDate: request.dueDate,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    
    tasks.push(newTask);
    
    const response = Ok({ task: newTask });
    
    // Store idempotent result
    if (idempotencyKey) {
      await storeResult(idempotencyKey, response);
    }
    
    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to create task'), 500);
  }
});

// Update task
app.post('/update', async (c: Context) => {
  try {
    const userId = 'current-user-id'; // Get from auth
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(userId, 'tool', 50, 600); // 50 updates per 10 minutes
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = TaskUpdateRequestSchema.parse(body);
    
    const taskIndex = tasks.findIndex(task => task.id === request.taskId);
    if (taskIndex === -1) {
      return c.json(Err('TASK_NOT_FOUND', 'Task not found'), 404);
    }
    
    const task = tasks[taskIndex];
    const updatedTask = {
      ...task,
      ...(request.title && { title: request.title }),
      ...(request.description !== undefined && { description: request.description }),
      ...(request.priority && { priority: request.priority }),
      ...(request.dueDate !== undefined && { dueDate: request.dueDate }),
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    
    return c.json(Ok({ task: updatedTask }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to update task'), 500);
  }
});

// Delete task
app.post('/delete', async (c: Context) => {
  try {
    const userId = 'current-user-id'; // Get from auth
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(userId, 'tool', 20, 600); // 20 deletes per 10 minutes
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = TaskDeleteRequestSchema.parse(body);
    
    const taskIndex = tasks.findIndex(task => task.id === request.taskId);
    if (taskIndex === -1) {
      return c.json(Err('TASK_NOT_FOUND', 'Task not found'), 404);
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    
    return c.json(Ok({ task: deletedTask }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to delete task'), 500);
  }
});

// Complete/uncomplete task
app.post('/complete', async (c: Context) => {
  try {
    const userId = 'current-user-id'; // Get from auth
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(userId, 'tool', 100, 600); // 100 completions per 10 minutes
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = TaskCompleteRequestSchema.parse(body);
    
    const taskIndex = tasks.findIndex(task => task.id === request.taskId);
    if (taskIndex === -1) {
      return c.json(Err('TASK_NOT_FOUND', 'Task not found'), 404);
    }
    
    const task = tasks[taskIndex];
    const updatedTask = {
      ...task,
      completed: request.completed,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    
    return c.json(Ok({ task: updatedTask }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to update task completion'), 500);
  }
});

export default app;
