import { z } from 'zod';

// Processes table schema
export const ProcessSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  default_meta: z.record(z.any()).nullable().optional(), // jsonb field
  mongo_filters: z.record(z.any()).default({}), // jsonb field
  created_at: z.date().optional(),
  account: z.string().nullable().optional(),
  updated_at: z.date().optional(),
  log_group: z.string().nullable().optional(),
  log_stream: z.string().nullable().optional(),
  environment: z.string().nullable().optional(),
  cron_details: z.string().nullable().optional()
});

export const CreateProcessSchema = ProcessSchema.omit({ 
  id: true, 
  created_at: true,
  updated_at: true 
});

export const UpdateProcessSchema = ProcessSchema.partial().omit({ 
  id: true, 
  created_at: true,
  updated_at: true 
}); 