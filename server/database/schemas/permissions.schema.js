import { z } from 'zod';

// Permissions table schema
export const PermissionSchema = z.object({
  id: z.number().int(),
  code: z.string().min(1),
  description: z.string().nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export const CreatePermissionSchema = PermissionSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const UpdatePermissionSchema = PermissionSchema.partial().omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
}); 