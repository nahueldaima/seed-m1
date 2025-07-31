import { executeSupabaseQuery } from '../supabase.js'
import { CreateProcessRunSchema, UpdateProcessRunSchema,  } from '../schemas/index.js'
import { JOB_STATUS } from '../schemas/enums.schema.js'


class ProcessRunModel {

  static TABLE_NAME = 'processes_runs'
  /**
   * Find all process runs
   */
  static async findAll(supabase, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*')
    
    if (options.status) {
      query = query.eq('status', options.status)
    }
    
    if (options.processId) {
      query = query.eq('process_id', options.processId)
    }
    
    if (options.createdBy) {
      query = query.eq('created_by', options.createdBy)
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
   * Find process run by ID (job_id)
   */
  static async findById(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('id', id).limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find process runs by process ID
   */
  static async findByProcessId(supabase, processId, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*').eq('process_id', processId)
    
    if (options.status) {
      query = query.eq('status', options.status)
    }
    
    query = query.order('created_at', { ascending: false })
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Find process runs by status
   */
  static async findByStatus(supabase, status) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    return executeSupabaseQuery(query)
  }

  /**
   * Find running jobs
   */
  static async findRunning(supabase) {
    return this.findByStatus(supabase, JOB_STATUS.RUNNING)
  }

  /**
   * Find started jobs
   */
  static async findStarted(supabase) {
    return this.findByStatus(supabase, JOB_STATUS.STARTED)
  }

  /**
   * Create a new process run
   */
  static async create(supabase, processRunData) {
    // Validate input data
    const validatedData = CreateProcessRunSchema.parse(processRunData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Update process run by ID
   */
  static async update(supabase, id, updateData) {
    // Validate input data
    const validatedData = UpdateProcessRunSchema.parse(updateData)
    
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
   * Update status of process run
   */
  static async updateStatus(supabase, id, status) {
    return this.update(supabase, id, { status })
  }

  /**
   * Mark process run as running
   */
  static async markAsRunning(supabase, id) {
    return this.updateStatus(supabase, id, JOB_STATUS.RUNNING)
  }

  /**
   * Mark process run as success
   */
  static async markAsSuccess(supabase, id, duration_ms = null) {
    const updateData = { status: JOB_STATUS.SUCCESS }
    if (duration_ms !== null) {
      updateData.duration_ms = duration_ms
    }
    return this.update(supabase, id, updateData)
  }

  /**
   * Mark process run as failed
   */
  static async markAsFailed(supabase, id, duration_ms = null) {
    const updateData = { status: JOB_STATUS.FAIL }
    if (duration_ms !== null) {
      updateData.duration_ms = duration_ms
    }
    return this.update(supabase, id, updateData)
  }

  /**
   * Delete process run by ID
   */
  static async delete(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('id', id).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Count process runs by status
   */
  static async countByStatus(supabase, status) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Get process run statistics
   */
  static async getStatistics(supabase) {
    const stats = {}
    for (const status of Object.values(JOB_STATUS)) {
      stats[status.toLowerCase()] = await this.countByStatus(supabase, status)
    }
    stats.total = Object.values(stats).reduce((sum, count) => sum + count, 0)
    return stats
  }

  /**
   * Find process runs by user
   */
  static async findByUser(supabase, userId, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*').eq('created_by', userId)
    
    if (options.status) {
      query = query.eq('status', options.status)
    }
    
    query = query.order('created_at', { ascending: false })
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }
}

export default ProcessRunModel 