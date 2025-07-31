import { z } from 'zod';
import { JobStatusEnum } from './enums.schema.js';

// Processes Events table schema
export const ProcessEventSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(), // references processes_runs
  seq: z.number().int(),
  created_at: z.date().optional(),
  message: z.string().nullable().optional(),
  status: JobStatusEnum.nullable().optional(),
  details: z.record(z.any()).default({}) // jsonb field
});

export const CreateProcessEventSchema = ProcessEventSchema.omit({ 
  id: true, 
  created_at: true 
});

export const UpdateProcessEventSchema = ProcessEventSchema.partial().omit({ 
  id: true, 
  job_id: true, 
  seq: true, 
  created_at: true 
});

// For batch operations
export const ProcessEventsArraySchema = z.array(CreateProcessEventSchema); 