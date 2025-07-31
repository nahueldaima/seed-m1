import {getSupabaseClient} from '~/server/database/supabase'
import { UserProfileModel, UserGroupModel } from '~/server/database/models'
import { createError }   from 'h3'

/**
 * Small helper – true if arrays share at least one common element.
 */
const arraysIntersect = (a = [], b = []) => a.some((v) => b.includes(v))

/**
 * Fetches the complete permission picture for a user in a single round-trip.
 * Relying on the "service-role" key (or any key with bypass-RLS claims) so we
 * can read the RBAC tables regardless of RLS policies.
 */
const fetchUserAuthorisation = async (supabaseAdmin, userId) => {
  // 1. Super-admin flag
  const findUserIfIsSuperAdmin = await UserProfileModel.findIsUserIsSuperadmin(supabaseAdmin, userId)

  if (findUserIfIsSuperAdmin?.length) return { isSuper: true, perms: [] }

  // 2. Groups + permissions + filters (nested select)
  const groups= await UserGroupModel.groupsAndPermissionsByUserId(supabaseAdmin, userId)

  // Flatten → array of { code, filters }
  const perms = []
  groups?.forEach(({ groups: g }) => {
    const filters = g?.filters || null
    g?.group_permissions?.forEach((gp) => {
      const code = gp.permissions?.code
      if (code) perms.push({ code, filters })
    })
  })

  return { isSuper: false, perms }
}

/**
 * Main entry – throws 403 if user lacks any requested permission.
 */
export const checkRequestedPermissions = async (event) => {
  const requested = event.requestedClaims
  const supabase  = event.context?.supabase;
  const user      = event.context?.user

  if (!supabase || !requested || !user?.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden – insufficient permissions' })
  }

  let authorisation
  try {
    authorisation = await fetchUserAuthorisation(supabase, user.id)
  } catch (err) {
    console.error('[permissions] authorisation fetch failed', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to evaluate permissions' })
  }

  // Super-admins automatically pass
  if (authorisation.isSuper) return

  const hasPermission = (claim) => {
    const { code, filters } =
      typeof claim === 'string' ? { code: claim, filters: null } : claim

    // Look for at least one group that grants the code and matches filters
    return authorisation.perms.some(({ code: permCode, filters: groupFilters }) => {
      if (permCode !== code) return false
      // If either side has no filters, it counts as a match
      if (!filters || !filters.length || !groupFilters || !groupFilters.length) return true
      return arraysIntersect(filters, groupFilters)
    })
  }

  const allAllowed = Array.isArray(requested) && requested.every(hasPermission);
  if (allAllowed) {
    return
  } else {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden – insufficient permissions' })
  }
} 