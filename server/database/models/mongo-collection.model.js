import { executeSupabaseQuery } from '../supabase.js'
import { MongoCollectionSchema, CreateMongoCollectionSchema, UpdateMongoCollectionSchema } from '../schemas/index.js'



class MongoCollectionModel {
  static TABLE_NAME = 'mongo_collections'
  /**
   * Find all mongo collections
   */
  static async findAll(supabase, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*')
    
    if (options.enabled !== undefined) {
      query = query.eq('enabled', options.enabled)
    }
    
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending ?? true })
    } else {
      query = query.order('collection_key', { ascending: true })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Find mongo collection by ID
   */
  static async findById(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('id', id).limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find mongo collection by collection key
   */
  static async findByKey(supabase, collectionKey) {
    const query = supabase.from(this.TABLE_NAME).select('*').eq('collection_key', collectionKey).limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find mongo collection by mongo collection name
   */
  static async findByMongoName(supabase, mongoCollectionName) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .eq('mongo_collection_name', mongoCollectionName)
      .limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Find enabled mongo collections
   */
  static async findEnabled(supabase) {
    return this.findAll(supabase, { enabled: true })
  }

  /**
   * Find disabled mongo collections
   */
  static async findDisabled(supabase) {
    return this.findAll(supabase, { enabled: false })
  }

  /**
   * Create a new mongo collection
   */
  static async create(supabase, mongoCollectionData) {
    // Validate input data
    const validatedData = CreateMongoCollectionSchema.parse(mongoCollectionData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Update mongo collection by ID
   */
  static async update(supabase, id, updateData) {
    // Validate input data
    const validatedData = UpdateMongoCollectionSchema.parse(updateData)
    
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
   * Delete mongo collection by ID
   */
  static async delete(supabase, id) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('id', id).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Check if mongo collection exists
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
   * Check if collection key exists
   */
  static async keyExists(supabase, collectionKey, excludeId = null) {
    let query = supabase.from(this.TABLE_NAME).select('id').eq('collection_key', collectionKey)
    
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
   * Check if mongo collection name exists
   */
  static async mongoNameExists(supabase, mongoCollectionName, excludeId = null) {
    let query = supabase.from(this.TABLE_NAME).select('id').eq('mongo_collection_name', mongoCollectionName)
    
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
   * Enable mongo collection
   */
  static async enable(supabase, id) {
    return this.update(supabase, id, { enabled: true })
  }

  /**
   * Disable mongo collection
   */
  static async disable(supabase, id) {
    return this.update(supabase, id, { enabled: false })
  }

  /**
   * Toggle enabled status
   */
  static async toggleEnabled(supabase, id) {
    const collection = await this.findById(supabase, id)
    return this.update(supabase, id, { enabled: !collection.enabled })
  }

  /**
   * Update search fields
   */
  static async updateSearchFields(supabase, id, searchFields) {
    return this.update(supabase, id, { search_fields: searchFields })
  }

  /**
   * Update display field
   */
  static async updateDisplayField(supabase, id, displayField) {
    return this.update(supabase, id, { display_field: displayField })
  }

  /**
   * Count total mongo collections
   */
  static async count(supabase) {
    const query = supabase.from(this.TABLE_NAME).select('*', { count: 'exact', head: true })
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Count enabled mongo collections
   */
  static async countEnabled(supabase) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('enabled', true)
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Search mongo collections by key, name, or description
   */
  static async search(supabase, searchTerm, options = {}) {
    let query = supabase.from(this.TABLE_NAME)
      .select('*')
      .or(`collection_key.ilike.%${searchTerm}%,mongo_collection_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    
    if (options.enabled !== undefined) {
      query = query.eq('enabled', options.enabled)
    }
    
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending ?? true })
    } else {
      query = query.order('collection_key', { ascending: true })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Get collection key to mongo name mapping
   */
  static async getKeyToNameMapping(supabase) {
    const collections = await this.findEnabled(supabase)
    const mapping = {}
    collections.forEach(collection => {
      mapping[collection.collection_key] = collection.mongo_collection_name
    })
    return mapping
  }

  /**
   * Get all collection keys
   */
  static async getAllKeys(supabase, enabledOnly = true) {
    const collections = enabledOnly ? await this.findEnabled(supabase) : await this.findAll(supabase)
    return collections.map(collection => collection.collection_key)
  }

  /**
   * Find collections by search field
   */
  static async findBySearchField(supabase, searchField) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*')
      .contains('search_fields', [searchField])
      .eq('enabled', true)
    return executeSupabaseQuery(query)
  }
}

export default MongoCollectionModel 