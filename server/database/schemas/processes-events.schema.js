import { z } from 'zod';
import { EventsStatusEnum } from './enums.schema.js';

// Processes Events table schema
export const ProcessEventSchema = z.object({
  id: z.string().uuid(),
  uuid: z.string(),
  last_event: z.boolean().default(false),
  process_run_id: z.string(), // references processes_runs
  thread_id: z.string(),
  environment: z.string(),
  status: EventsStatusEnum.nullable().optional(),
  created_at: z.date().optional(),
  message: z.string().nullable().optional(),
  details: z.record(z.any()).default({}) // jsonb field
});

export const CreateProcessEventSchema = ProcessEventSchema.omit({ 
  id: true, 
  created_at: true 
});

export const UpdateProcessEventSchema = ProcessEventSchema.partial().omit({ 
  id: true, 
  process_run_id: true,
  process_id: true,
  thread_id: true,
  created_at: true 
});

// For batch operations
export const ProcessEventsArraySchema = z.array(CreateProcessEventSchema); 