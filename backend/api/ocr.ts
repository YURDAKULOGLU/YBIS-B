import { Hono, Context } from 'hono';
import { z } from 'zod';

const app = new Hono();

const OCRRequestSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageData: z.string().optional(), // base64
  language: z.string().default('tr'),
});

const OCRResponseSchema = z.object({
  success: z.boolean(),
  text: z.string().optional(),
  confidence: z.number().optional(),
  message: z.string(),
});

app.post('/ocr', async (c: Context) => {
  try {
    const body = await c.req.json();
    const request = OCRRequestSchema.parse(body);
    
    // TODO: Implement OCR functionality
    const response = {
      success: false,
      message: 'NOT_IMPLEMENTED: OCR processing',
    };
    
    return c.json(OCRResponseSchema.parse(response));
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400);
  }
});

export default app;
