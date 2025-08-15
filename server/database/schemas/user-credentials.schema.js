import { z } from 'zod';

export const UserCredentialSchema = z.object({
  user_id: z.string().uuid(),
  aws_access_key: z.string().nullable().optional(),
  aws_secret_key: z.string().nullable().optional(),
  mongo_username: z.string().nullable().optional(),
  mongo_password: z.string().nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export const CreateUserCredentialSchema = UserCredentialSchema.omit({
  created_at: true,
  updated_at: true
});

export const UpdateUserCredentialSchema = UserCredentialSchema.partial().omit({
  user_id: true,
  created_at: true,
  updated_at: true
});
