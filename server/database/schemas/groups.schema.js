import { z } from 'zod';

// Groups table schema
export const GroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  filters: z.array(z.string()).nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export const CreateGroupSchema = GroupSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const UpdateGroupSchema = GroupSchema.partial().omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
}); 