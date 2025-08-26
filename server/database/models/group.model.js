import { executeSupabaseQuery } from '../supabase.js'
import { GroupSchema, CreateGroupSchema, UpdateGroupSchema } from '../schemas/index.js'

class GroupModel {

  // declare variables
  static TABLE_NAME = 'groups'

  /**
   * Find all groups
   */
  static async findAll(supabase, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*')
    
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending ?? true })
    } else {
      query = query.order('name', { ascending: true })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Find group by ID
   */
  static async findById(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('id', id).limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find groups by name (partial match)
   */
  static async findByName(supabase, name) {
    const query = supabase.from(this.TABLE_NAME).select('*').ilike('name', `%${name}%`)
    return executeSupabaseQuery(query)
  }

  /**
   * Find group by exact name
   */
  static async findByExactName(supabase, name) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('name', name).limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Create a new group
   */
  static async create(supabase, groupData) {
    // Validate input data
    const validatedData = CreateGroupSchema.parse(groupData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Update group by ID
   */
  static async update(supabase, id, updateData) {
    // Validate input data
    const validatedData = UpdateGroupSchema.parse(updateData)
    
    // Add updated_at timestamp
    validatedData.updated_at = new Date()
    
    const query = supabase.from(this.TABLE_NAME)
      .update(validatedData)
      .eq('id', id)
      .select()
    return executeSupabaseQuery(query)
  }

  /**
   * Delete group by ID
   */
  static async delete(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('id', id).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Check if group exists
   */
  static async exists(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).select('id').eq('id', id)
    
    try {
      await executeSupabaseQuery(query)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if group name exists
   */
  static async nameExists(supabase, name, excludeId = null) {
    let query = supabase.from(this.TABLE_NAME).select('id').eq('name', name)
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    try {
      const result = await executeSupabaseQuery(query)
      return result && result.length > 0
    } catch {
      return false
    }
  }

  /**
   * Update group filters
   */
  static async updateFilters(supabase, id, filters) {
    return this.update(supabase, id, { filters })
  }

  /**
   * Count total groups
   */
  static async count(supabase) {
    const query = supabase.from(this.TABLE_NAME).select('*', { count: 'exact', head: true })
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Find groups with filters
   */
  static async findWithFilters(supabase) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .not('filters', 'is', null)
      .order('name', { ascending: true })
    return executeSupabaseQuery(query)
  }

  /**
   * Search groups by name and description
   */
  static async search(supabase, searchTerm, options = {}) {
    let query = supabase.from(this.TABLE_NAME)
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending ?? true })
    } else {
      query = query.order('name', { ascending: true })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Get groups with their user count
   */
  static async findWithUserCount(supabase) {
    const query = supabase.from(this.TABLE_NAME)
      .select(`
        *,
        user_groups(count)
      `)
      .order('name', { ascending: true })
    return executeSupabaseQuery(query)
  }

  /**
   * Get groups with their permission count
   */
  static async findWithPermissionCount(supabase) {
    const query = supabase.from(this.TABLE_NAME)
      .select(`
        *,
        group_permissions(count)
      `)
      .order('name', { ascending: true })
    return executeSupabaseQuery(query)
  }
}

export default GroupModel 