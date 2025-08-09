import { z } from 'zod';

// Processes table schema
export const ProcessSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  default_meta: z.record(z.any()).nullable().optional(), // jsonb field
  account: z.string().nullable().optional(),
  mongo_filters: z.record(z.any()).default({}), // jsonb field
  created_at: z.date().optional(),
  updated_at: z.date().optional()
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