import { z } from 'zod';

// User Profiles table schema (extends Supabase Auth users)
export const UserProfileSchema = z.object({
  id: z.string().uuid(), // references auth.users
  display_name: z.string().nullable().optional(),
  is_superadmin: z.boolean().default(false),
  mongo_filters: z.record(z.any()).default({}), // jsonb field
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export const CreateUserProfileSchema = UserProfileSchema.omit({ 
  created_at: true, 
  updated_at: true 
});

export const UpdateUserProfileSchema = UserProfileSchema.partial().omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
}); 