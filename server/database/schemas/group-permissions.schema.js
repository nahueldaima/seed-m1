import { z } from 'zod';

// Group Permissions junction table schema
export const GroupPermissionSchema = z.object({
  group_id: z.string().uuid(),
  perm_id: z.number().int()
});

export const CreateGroupPermissionSchema = GroupPermissionSchema;

// For bulk operations
export const GroupPermissionsArraySchema = z.array(GroupPermissionSchema); 