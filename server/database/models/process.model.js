import { executeSupabaseQuery } from '../supabase.js'
import { CreateProcessSchema, UpdateProcessSchema } from '../schemas/index.js'


class ProcessModel {
  static TABLE_NAME = 'processes'
  /**
   * Find all processes
   */
  static async findAll(supabase, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*')
    
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
   * Find process by ID
   */
  static async findById(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('id', id).limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find processes by name (partial match)
   */
  static async findByName(supabase, name) {
    const query = supabase.from(this.TABLE_NAME).select('*').ilike('name', `%${name}%`)
    return executeSupabaseQuery(query)
  }

  /**
   * Create a new process
   */
  static async create(supabase, processData) {
    // Validate input data
    const validatedData = CreateProcessSchema.parse(processData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Update process by ID
   */
  static async update(supabase, id, updateData) {
    // Validate input data
    const validatedData = UpdateProcessSchema.parse(updateData)
    
    const query = supabase.from(this.TABLE_NAME)
      .update(validatedData)
      .eq('id', id)
      .select()
      .limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Delete process by ID
   */
  static async delete(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('id', id).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Check if process exists
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
   * Count total processes
   */
  static async count(supabase) {
    const query = supabase.from(this.TABLE_NAME).select('*', { count: 'exact', head: true })
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Find processes with mongo filters
   */
  static async findWithMongoFilters(supabase) {
    const query = supabase.from(this.TABLE_NAME).select('*').not('mongo_filters', 'is', null)
    return executeSupabaseQuery(query)
  }
}

export default ProcessModel 