import { createClient } from '@supabase/supabase-js'

/**
 * Get Supabase client for authenticated requests
 */
export function getSupabaseClient(token) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )
}

/**
 * Execute Supabase query with error handling
 */
export async function executeSupabaseQuery(queryBuilder) {
  try {
    const {status, statusText, error, data, count} = await queryBuilder
    
    console.log('executeSupabaseQuery', {status, statusText, error, data, count})
    if (error) {
      console.error('Supabase query error:', error)
      throw createError({
        statusCode: status || 400,
        statusMessage: error.message || statusText
      })
    }
    
    return data ? data : { count: count }
  } catch (error) {
    console.error('Database operation failed:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Database operation failed'
    })
  }
}