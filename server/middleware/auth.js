import { createClient } from '@supabase/supabase-js'
import { getHeader, setHeader, createError } from 'h3' 
import {getSupabaseClient} from '~/server/database/supabase'
import { GroupModel } from '~/server/database/models'

/* ─────────────────────────  Rate-limit helpers  ───────────────────────── */
const authFailures = new Map()
const WINDOW_MS = 60 * 60 * 1000   // 1 h
const MAX_FAILURES = 5

const clientIP = (event) =>
  event.node.req.headers['x-forwarded-for']?.split(',')[0]?.trim()
  ?? event.node.req.socket?.remoteAddress
  ?? 'unknown'

const isLimited = (ip) => {
  const rec = authFailures.get(ip)
  if (!rec) return false
  if (Date.now() > rec.reset) { authFailures.delete(ip); return false }
  return rec.count >= MAX_FAILURES
}

const bumpFailures = (ip) => {
  const now = Date.now()
  const rec = authFailures.get(ip) || { count: 0, reset: now + WINDOW_MS }
  if (now > rec.reset) { rec.count = 0; rec.reset = now + WINDOW_MS }
  rec.count += 1
  authFailures.set(ip, rec)
}

/* ────────────────────────  Token validation (#3)  ─────────────────────── */

const validateAPIToken = async (token) => {

  const localSupabase = createClient(
    process.env.SUPABASE_URL,
    token
  )
  // do a dummy query to check if the token is valid
  const data = await GroupModel.findAll(localSupabase, { limit: 1 });
  
  if (!data?.length) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid authentication token'
    })
  }

  return localSupabase;
}

const serverSupabaseUser = async (token) => {
  let supabase = getSupabaseClient(token);
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user || user?.role !== 'authenticated') {
    throw createError({ statusCode: 401, statusMessage: 'Invalid authentication token' })
  }
  return {supabase, user};
}

/* ─────────────────────────  Main middleware  ──────────────────────────── */
export default defineEventHandler(async (event) => {
  let url = event.node.req.url || '';

  // cut url on 200 chars for safety
  url = url.slice(0, 200)

  // Only act on /api/** routes
  if (!url.startsWith('/api/')) return

  // Skip Nuxt Icon routes served by @nuxt/icon
  // e.g. /api/_nuxt_icon/heroicons.json?icons=...
  if (url.startsWith('/api/_nuxt_icon')) return


  // Robust matching with RegExp
  let isPublic = false;
  let isPrivate = false;
  let isInternal = false;
  try {
    isPublic = /^\/api\/public(\/|$)/.test(url)
    isPrivate = /^\/api\/private(\/|$)/.test(url)
    isInternal = /^\/api\/internal(\/|$)/.test(url)
  } catch (error) {
    console.log(error)
    throw createError({ statusCode: 401, statusMessage: 'Invalid authentication token' })
  }

  const ip = clientIP(event)
  if (isLimited(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many authentication attempts' })
  }

  try {
    /* ────────────────  PUBLIC  ──────────────── */
    if (isPublic) return

    /* ────────────────  PRIVATE  ─────────────── */
    if (isPrivate) {
      const authHeader = getHeader(event, 'authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        throw createError({ statusCode: 401, statusMessage: 'Missing or invalid authorization header' })
      }
      // this is an anonymous user, it has token on an supabase admin level
      event.context.supabase = await validateAPIToken(authHeader.slice(7));
      event.context.isAuthenticated = true
      return
    }

    /* ────────────────  INTERNAL  ────────────── */
    if (isInternal) {
      const authHeader = getHeader(event, 'authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        throw createError({ statusCode: 401, statusMessage: 'Missing or invalid authorization header' })
      }
      // this is the authenticated user on the client side, it has token on a user level
      let {user, supabase} =  await serverSupabaseUser(authHeader.slice(7));
      event.context.user = user;
      event.context.supabase = supabase;
      event.context.isAuthenticated = true
      return
    }

    throw createError({ statusCode: 404, statusMessage: 'Route not found' })
  } catch (err) {
    if (err.statusCode === 401) {
      setHeader(event, 'WWW-Authenticate', 'Bearer realm="supabase", charset="UTF-8"') // #WWW
      bumpFailures(ip)                                                                  // rate-limit
    }
    throw createError({ statusCode: err?.statusCode, statusMessage: err?.message || 'Authentication error' })
  }
})