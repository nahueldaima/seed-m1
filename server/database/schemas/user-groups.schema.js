import { z } from 'zod';

// User Groups junction table schema
export const UserGroupSchema = z.object({
  user_id: z.string().uuid(),
  group_id: z.string().uuid()
});

export const CreateUserGroupSchema = UserGroupSchema;

// For bulk operations
export const UserGroupsArraySchema = z.array(UserGroupSchema); 