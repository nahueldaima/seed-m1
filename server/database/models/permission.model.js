import { executeSupabaseQuery } from '../supabase.js'
import { CreatePermissionSchema, UpdatePermissionSchema } from '../schemas/index.js'



class PermissionModel {
  static TABLE_NAME = 'permissions'
  /**
   * Find all permissions
   */
  static async findAll(supabase, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*')
    
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending ?? true })
    } else {
      query = query.order('code', { ascending: true })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Find permission by ID
   */
  static async findById(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('id', id).limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find permission by code
   */
  static async findByCode(supabase, code) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('code', code).limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find permissions by code (partial match)
   */
  static async findByCodePattern(supabase, codePattern) {
    const query = supabase.from(this.TABLE_NAME).select('*').ilike('code', `%${codePattern}%`)
    return executeSupabaseQuery(query)
  }

  /**
   * Create a new permission
   */
  static async create(supabase, permissionData) {
    // Validate input data
    const validatedData = CreatePermissionSchema.parse(permissionData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Update permission by ID
   */
  static async update(supabase, id, updateData) {
    // Validate input data
    const validatedData = UpdatePermissionSchema.parse(updateData)
    
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
   * Delete permission by ID
   */
  static async delete(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('id', id).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Check if permission exists
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
   * Check if permission code exists
   */
  static async codeExists(supabase, code, excludeId = null) {
    let query = supabase.from(this.TABLE_NAME).select('id').eq('code', code)
    
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
   * Count total permissions
   */
  static async count(supabase) {
    const query = supabase.from(this.TABLE_NAME).select('*', { count: 'exact', head: true })
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Search permissions by code and description
   */
  static async search(supabase, searchTerm, options = {}) {
    let query = supabase.from(this.TABLE_NAME)
      .select('*')
      .or(`code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending ?? true })
    } else {
      query = query.order('code', { ascending: true })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Get permissions by multiple IDs
   */
  static async findByIds(supabase, ids) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .in('id', ids)
      .order('code', { ascending: true })
    return executeSupabaseQuery(query)
  }

  /**
   * Get permissions by multiple codes
   */
  static async findByCodes(supabase, codes) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .in('code', codes)
      .order('code', { ascending: true })
    return executeSupabaseQuery(query)
  }

  /**
   * Get permissions with their group count
   */
  static async findWithGroupCount(supabase) {
    const query = supabase.from(this.TABLE_NAME)
      .select(`
        *,
        group_permissions(count)
      `)
      .order('code', { ascending: true })
    return executeSupabaseQuery(query)
  }

  /**
   * Create multiple permissions (batch)
   */
  static async createBatch(supabase, permissionsData) {
    // Validate input data
    const validatedData = permissionsData.map(data => CreatePermissionSchema.parse(data))
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Get permission hierarchy by code prefix
   */
  static async findByPrefix(supabase, prefix) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .like('code', `${prefix}%`)
      .order('code', { ascending: true })
    return executeSupabaseQuery(query)
  }
}

export default PermissionModel 