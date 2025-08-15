import { fetchUserAuthorisation } from '~/server/utils/permissions'
import { UserProfileModel, UserGroupModel, GroupModel } from '~/server/database/models'
import { createResponseError } from '~/server/utils/responses'
import { readBody } from 'h3'
import { createClient } from '@supabase/supabase-js'

const getAdminClient = () => {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// GET /api/internal/user-data/permissions
const internalRetrieveUsersPermissionsGet = async (event) => {
  const supabase = event.context.supabase;
  const data = await fetchUserAuthorisation(supabase, event.context.user.id);
  return data;
}

// GET /api/internal/users
const internalUsersListGet = async (event) => {
  try {
    const admin = getAdminClient()
    const { data: profiles } = await admin.from('user_profiles').select('id, display_name, user_groups ( groups ( id, name ))')
    const { data: auth } = await admin.auth.admin.listUsers()
    const users = auth?.users?.map(u => {
      const profile = profiles?.find(p => p.id === u.id)
      return {
        id: u.id,
        email: u.email,
        display_name: profile?.display_name || '',
        groups: profile?.user_groups?.map(g => g.groups) || []
      }
    }) || []
    return users
  } catch (error) {
    createResponseError(error)
  }
}

// POST /api/internal/users
const internalUsersInvitePost = async (event) => {
  try {
    const admin = getAdminClient()
    const body = await readBody(event)
    const { data, error } = await admin.auth.admin.inviteUserByEmail(body.email)
    if (error) throw error
    if (body.display_name) {
      await UserProfileModel.upsert(admin, { id: data.user.id, display_name: body.display_name })
    }
    if (Array.isArray(body.group_ids) && body.group_ids.length) {
      await UserGroupModel.addUserToGroups(admin, data.user.id, body.group_ids)
    }
    return { id: data.user.id }
  } catch (error) {
    createResponseError(error)
  }
}

// PUT /api/internal/users/:id
const internalUsersUpdatePut = async (event, id) => {
  try {
    const admin = getAdminClient()
    const body = await readBody(event)
    if (body.display_name) {
      await UserProfileModel.update(admin, id, { display_name: body.display_name })
    }
    if (Array.isArray(body.group_ids)) {
      await UserGroupModel.replaceUserGroups(admin, id, body.group_ids)
    }
    return { success: true }
  } catch (error) {
    createResponseError(error)
  }
}

export const usersInternalApi = {
  internalRetrieveUsersPermissionsGet,
  internalUsersListGet,
  internalUsersInvitePost,
  internalUsersUpdatePut
}
