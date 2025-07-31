import { z } from 'zod';
import { JobStatusEnum } from './enums.schema.js';

// Processes Runs table schema
export const ProcessRunSchema = z.object({
  id: z.string().uuid(), // job_id
  process_id: z.string().uuid(),
  filters: z.array(z.any()).default([]), // jsonb field - values from MongoDB collections
  status: JobStatusEnum.default('STARTED'),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  duration_ms: z.number().int().nullable().optional(), // generated field
  meta: z.record(z.any()).default({}), // jsonb field
  created_by: z.string().uuid().nullable().optional() // references auth.users
});

export const CreateProcessRunSchema = ProcessRunSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true, 
  duration_ms: true 
});

export const UpdateProcessRunSchema = ProcessRunSchema.partial().omit({ 
  id: true, 
  created_at: true, 
  duration_ms: true 
}); 