import { executeSupabaseQuery } from '../supabase.js';
import { CreateUserCredentialSchema, UpdateUserCredentialSchema } from '../schemas/index.js';

class UserCredentialModel {
  static TABLE_NAME = 'user_credentials';

  static async findByUserId(supabase, userId) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('user_id', userId).limit(1);
    return executeSupabaseQuery(query);
  }

  static async upsert(supabase, userId, credentialData) {
    const payload = { user_id: userId, ...credentialData };
    const validatedData = CreateUserCredentialSchema.parse(payload);
    const query = supabase.from(this.TABLE_NAME)
      .upsert(validatedData, { onConflict: 'user_id' })
      .eq('user_id', userId)
      .select()
    return executeSupabaseQuery(query);
  }

  static async update(supabase, userId, updateData) {
    const validatedData = UpdateUserCredentialSchema.parse(updateData);
    validatedData.updated_at = new Date();
    const query = supabase.from(this.TABLE_NAME)
      .update(validatedData)
      .eq('user_id', userId)
      .select()
    return executeSupabaseQuery(query);
  }
}

export default UserCredentialModel;
