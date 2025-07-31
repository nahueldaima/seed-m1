import { z } from 'zod';

// MongoDB Collections table schema
export const MongoCollectionSchema = z.object({
  id: z.string().uuid(),
  collection_key: z.string().min(1), // Key used in code/API
  mongo_collection_name: z.string().min(1), // Actual MongoDB collection name
  description: z.string().nullable().optional(),
  search_fields: z.array(z.string()).default([]), // jsonb field
  display_field: z.string().min(1), // Field to display in UI dropdowns
  enabled: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export const CreateMongoCollectionSchema = MongoCollectionSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const UpdateMongoCollectionSchema = MongoCollectionSchema.partial().omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
}); 