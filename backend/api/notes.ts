import { Hono, Context } from 'hono';
import { z } from 'zod';
import { Ok, Err } from '../src/shared/tools/schemas';
import { validateIdempotencyKey, checkAndSet, storeResult, getStoredResult } from '../src/shared/utils/idempotency';
import { checkRateLimit } from '../src/shared/utils/rateLimit';

const app = new Hono();

const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  folderId: z.string().optional(),
  isArchived: z.boolean(),
  isStarred: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const NoteListRequestSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  isArchived: z.boolean().optional(),
  isStarred: z.boolean().optional(),
});

const NoteCreateRequestSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000),
  tags: z.array(z.string()).optional(),
  folderId: z.string().optional(),
});

const NoteUpdateRequestSchema = z.object({
  noteId: z.string(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(50000).optional(),
  tags: z.array(z.string()).optional(),
  folderId: z.string().optional(),
  isArchived: z.boolean().optional(),
  isStarred: z.boolean().optional(),
});

const NoteDeleteRequestSchema = z.object({
  noteId: z.string(),
});

const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().optional(),
  color: z.string().optional(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Mock storage (in production, use actual database)
const notes: Array<z.infer<typeof NoteSchema>> = [];
const folders: Array<z.infer<typeof FolderSchema>> = [];

// List notes
app.post('/list', async (c: Context) => {
  try {
    const userId = 'current-user-id'; // Get from auth
    
    const rateLimitResult = await checkRateLimit(userId, 'tool', 100, 600);
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = NoteListRequestSchema.parse(body);
    
    let filteredNotes = notes;
    
    if (request.folderId) {
      filteredNotes = filteredNotes.filter(note => note.folderId === request.folderId);
    }
    
    if (request.tags && request.tags.length > 0) {
      filteredNotes = filteredNotes.filter(note => 
        note.tags && request.tags!.some(tag => note.tags!.includes(tag))
      );
    }
    
    if (request.search) {
      const searchLower = request.search.toLowerCase();
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
      );
    }
    
    if (request.isArchived !== undefined) {
      filteredNotes = filteredNotes.filter(note => note.isArchived === request.isArchived);
    }
    
    if (request.isStarred !== undefined) {
      filteredNotes = filteredNotes.filter(note => note.isStarred === request.isStarred);
    }
    
    const totalCount = filteredNotes.length;
    const paginatedNotes = filteredNotes
      .slice(request.offset, request.offset + request.limit);
    
    return c.json(Ok({
      notes: paginatedNotes,
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
    return c.json(Err('INTERNAL_ERROR', 'Failed to list notes'), 500);
  }
});

// Create note
app.post('/create', async (c: Context) => {
  try {
    const userId = 'current-user-id';
    
    const rateLimitResult = await checkRateLimit(userId, 'tool', 20, 600);
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = NoteCreateRequestSchema.parse(body);
    
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
    const newNote: z.infer<typeof NoteSchema> = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: request.title,
      content: request.content,
      tags: request.tags || [],
      folderId: request.folderId,
      isArchived: false,
      isStarred: false,
      createdAt: now,
      updatedAt: now,
    };
    
    notes.push(newNote);
    
    const response = Ok({ note: newNote });
    
    if (idempotencyKey) {
      await storeResult(idempotencyKey, response);
    }
    
    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to create note'), 500);
  }
});

// Update note
app.post('/update', async (c: Context) => {
  try {
    const userId = 'current-user-id';
    
    const rateLimitResult = await checkRateLimit(userId, 'tool', 50, 600);
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = NoteUpdateRequestSchema.parse(body);
    
    const noteIndex = notes.findIndex(note => note.id === request.noteId);
    if (noteIndex === -1) {
      return c.json(Err('NOTE_NOT_FOUND', 'Note not found'), 404);
    }
    
    const note = notes[noteIndex];
    const updatedNote = {
      ...note,
      ...(request.title && { title: request.title }),
      ...(request.content !== undefined && { content: request.content }),
      ...(request.tags !== undefined && { tags: request.tags }),
      ...(request.folderId !== undefined && { folderId: request.folderId }),
      ...(request.isArchived !== undefined && { isArchived: request.isArchived }),
      ...(request.isStarred !== undefined && { isStarred: request.isStarred }),
      updatedAt: new Date().toISOString(),
    };
    
    notes[noteIndex] = updatedNote;
    
    return c.json(Ok({ note: updatedNote }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to update note'), 500);
  }
});

// Delete note
app.post('/delete', async (c: Context) => {
  try {
    const userId = 'current-user-id';
    
    const rateLimitResult = await checkRateLimit(userId, 'tool', 20, 600);
    if (!rateLimitResult.allowed) {
      return c.json(Err('RATE_LIMIT_EXCEEDED', 'Too many requests'), 429);
    }

    const body = await c.req.json();
    const request = NoteDeleteRequestSchema.parse(body);
    
    const noteIndex = notes.findIndex(note => note.id === request.noteId);
    if (noteIndex === -1) {
      return c.json(Err('NOTE_NOT_FOUND', 'Note not found'), 404);
    }
    
    const deletedNote = notes.splice(noteIndex, 1)[0];
    
    return c.json(Ok({ note: deletedNote }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(Err('VALIDATION_ERROR', error.issues[0]?.message || 'Invalid request'), 400);
    }
    return c.json(Err('INTERNAL_ERROR', 'Failed to delete note'), 500);
  }
});

// Get note by ID
app.get('/:noteId', async (c: Context) => {
  try {
    const noteId = c.req.param('noteId');
    const note = notes.find(n => n.id === noteId);
    
    if (!note) {
      return c.json(Err('NOTE_NOT_FOUND', 'Note not found'), 404);
    }
    
    return c.json(Ok({ note }));
  } catch (error) {
    return c.json(Err('INTERNAL_ERROR', 'Failed to get note'), 500);
  }
});

// Folder management endpoints
app.get('/folders', async (c: Context) => {
  return c.json(Ok({ folders }));
});

app.post('/folders', async (c: Context) => {
  try {
    const body = await c.req.json();
    const { name, parentId, color } = body;
    
    const now = new Date().toISOString();
    const newFolder: z.infer<typeof FolderSchema> = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      parentId,
      color,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    
    folders.push(newFolder);
    return c.json(Ok({ folder: newFolder }));
  } catch (error) {
    return c.json(Err('INTERNAL_ERROR', 'Failed to create folder'), 500);
  }
});

// Tag management
app.get('/tags', async (c: Context) => {
  const allTags = new Set<string>();
  notes.forEach(note => {
    if (note.tags) {
      note.tags.forEach(tag => allTags.add(tag));
    }
  });
  
  return c.json(Ok({ tags: Array.from(allTags) }));
});

export default app;
