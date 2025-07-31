import { executeSupabaseQuery } from '../supabase.js'
import { CreateUserProfileSchema, UpdateUserProfileSchema } from '../schemas/index.js'


class UserProfileModel {
  static TABLE_NAME = 'user_profiles'
  /**
   * Find all user profiles
   */
  static async findAll(supabase, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*')
    
    if (options.isSuperadmin !== undefined) {
      query = query.eq('is_superadmin', options.isSuperadmin)
    }
    
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending ?? true })
    } else {
      query = query.order('created_at', { ascending: false })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Find user profile by ID (user ID from auth.users)
   */
  static async findById(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('id', id).limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find user profiles by display name (partial match)
   */
  static async findByDisplayName(supabase, displayName) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .ilike('display_name', `%${displayName}%`)
    return executeSupabaseQuery(query)
  }

  /**
   * Find if user is superadmin
   */
  static async findIsUserIsSuperadmin(supabase, userId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .eq('id', userId)
      .eq('is_superadmin', true)
      .limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find all regular users (non-superadmin)
   */
  static async findRegularUsers(supabase) {
    return this.findAll(supabase, { isSuperadmin: false })
  }

  /**
   * Create a new user profile
   */
  static async create(supabase, userProfileData) {
    // Validate input data
    const validatedData = CreateUserProfileSchema.parse(userProfileData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Update user profile by ID
   */
  static async update(supabase, id, updateData) {
    // Validate input data
    const validatedData = UpdateUserProfileSchema.parse(updateData)
    
    // Add updated_at timestamp
    validatedData.updated_at = new Date()
    
    const query = supabase.from(this.TABLE_NAME)
      .update(validatedData)
      .eq('id', id)
      .select()
      .limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Delete user profile by ID
   */
  static async delete(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('id', id).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Check if user profile exists
   */
  static async exists(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).select('id').eq('id', id).limit(1)
    
    try {
      await executeSupabaseQuery(query)
      return true
    } catch {
      return false
    }
  }

  /**
   * Set user as superadmin
   */
  static async setSuperadmin(supabase, id, isSuperadmin = true) {
    return this.update(supabase, id, { is_superadmin: isSuperadmin })
  }

  /**
   * Update user's mongo filters
   */
  static async updateMongoFilters(supabase, id, mongoFilters) {
    return this.update(supabase, id, { mongo_filters: mongoFilters })
  }

  /**
   * Update display name
   */
  static async updateDisplayName(supabase, id, displayName) {
    return this.update(supabase, id, { display_name: displayName })
  }

  /**
   * Count total user profiles
   */
  static async count(supabase) {
    const query = supabase.from(this.TABLE_NAME).select('*', { count: 'exact', head: true })
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Count superadmin users
   */
  static async countSuperadmins(supabase) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('is_superadmin', true)
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Find users with mongo filters
   */
  static async findWithMongoFilters(supabase) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .not('mongo_filters', 'is', null)
      .neq('mongo_filters', '{}')
    return executeSupabaseQuery(query)
  }

  /**
   * Create or update user profile (upsert)
   */
  static async upsert(supabase, userProfileData) {
    // Validate input data
    const validatedData = CreateUserProfileSchema.parse(userProfileData)
    
    const query = supabase.from(this.TABLE_NAME)
      .upsert(validatedData, { onConflict: 'id' })
      .select()
      .limit(1)
    return executeSupabaseQuery(query)
  }
}

export default UserProfileModel 