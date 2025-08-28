import { executeSupabaseQuery } from '../supabase.js'
import { CreateProcessEventSchema, UpdateProcessEventSchema, ProcessEventsArraySchema } from '../schemas/index.js'

class ProcessEventModel {
  static TABLE_NAME = 'processes_events'
  /**
   * Find all process events
   */
  static async findAll(supabase, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*')
    
    if (options.process_run_id) {
      query = query.eq('process_run_id', options.process_run_id)
    }
    
    if (options.status) {
      query = query.eq('status', options.status)
    }
    
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending ?? true })
    } else {
      query = query.order('created_at', { ascending: true })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Find process event by ID
   */
  static async findById(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('id', id).limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find process events by job ID
   */
  static async findByJobId(supabase, jobId, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*').eq('job_id', jobId)
    
    if (options.status) {
      query = query.eq('status', options.status)
    }
    
    query = query.order('created_at', { ascending: true })
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Get latest event for a job
   */
  static async getLatestByJobId(supabase, jobId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(1)
      .limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Get next sequence number for a job
   */
  static async getNextSeq(supabase, jobId) {
    try {
      const latestEvent = await this.getLatestByJobId(supabase, jobId)
      return latestEvent.seq + 1
    } catch {
      return 1 // First event
    }
  }

  /**
   * Create a new process event
   */
  static async create(supabase, eventData) {
    // Auto-generate sequence number if not provided
    if (!eventData.seq) {
      eventData.seq = await this.getNextSeq(supabase, eventData.job_id)
    }
    
    // Validate input data
    const validatedData = CreateProcessEventSchema.parse(eventData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Create multiple process events (batch)
   */
  static async createBatch(supabase, eventsData) {
    // Validate input data
    const validatedData = ProcessEventsArraySchema.parse(eventsData)
    
    // Auto-generate sequence numbers if needed
    const jobId = validatedData[0]?.job_id
    if (jobId) {
      let nextSeq = await this.getNextSeq(supabase, jobId)
      for (const event of validatedData) {
        if (!event.seq) {
          event.seq = nextSeq++
        }
      }
    }
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Update process event by ID
   */
  static async update(supabase, id, updateData) {
    // Validate input data
    const validatedData = UpdateProcessEventSchema.parse(updateData)
    
    const query = supabase.from(this.TABLE_NAME)
      .update(validatedData)
      .eq('id', id)
      .select()
      .limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Delete process event by ID
   */
  static async delete(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('id', id).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Delete all events for a job
   */
  static async deleteByJobId(supabase, jobId) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('job_id', jobId).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Count events by job ID
   */
  static async countByJobId(supabase, jobId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId)
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Find events by status
   */
  static async findByStatus(supabase, status) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    return executeSupabaseQuery(query)
  }

  /**
   * Get events timeline for a job (ordered by sequence)
   */
  static async getTimelineByJobId(supabase, jobId) {
    return this.findByJobId(supabase, jobId, { orderBy: { field: 'seq', ascending: true } })
  }

  /**
   * Search events by message content
   */
  static async searchByMessage(supabase, searchTerm, options = {}) {
    let query = supabase.from(this.TABLE_NAME)
      .select('*')
      .ilike('message', `%${searchTerm}%`)
    
    if (options.jobId) {
      query = query.eq('job_id', options.jobId)
    }
    
    query = query.order('created_at', { ascending: false })
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }
}

export default ProcessEventModel 