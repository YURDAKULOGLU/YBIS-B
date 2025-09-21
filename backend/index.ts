import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import chat from './api/chat';
import gmail from './api/gmail';
import calendar from './api/calendar';
import tasks from './api/tasks';
import ocr from './api/ocr';
import analyze from './api/analyze';
import calculate from './api/calculate';
import generate from './api/generate';
import transform from './api/transform';
import notes from './api/notes';
import rt from './api/rt';
import voice from './api/voice';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/', (c: Context) => {
  return c.json({ 
    message: 'YBIS Backend API', 
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
app.route('/api/chat', chat);
app.route('/api/gmail', gmail);
app.route('/api/calendar', calendar);
app.route('/api/tasks', tasks);
app.route('/api/ocr', ocr);
app.route('/api/analyze', analyze);
app.route('/api/calculate', calculate);
app.route('/api/generate', generate);
app.route('/api/transform', transform);
app.route('/api/notes', notes);
app.route('/api/rt', rt);
app.route('/api/voice', voice);

// 404 handler
app.notFound((c: Context) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err: Error, c: Context) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = process.env.PORT || 3000;

export default {
  port,
  fetch: app.fetch,
};
