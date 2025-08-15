import { GroupModel, GroupPermissionModel, UserGroupModel } from '~/server/database/models'
import { createResponseError } from '~/server/utils/responses'
import { getQuery, readBody, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'

const getAdminClient = () => {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

const internalGroupsListGet = async (event) => {
  try {
    const supabase = event.context.supabase
    const { search } = getQuery(event)
    let data
    if (search) {
      data = await GroupModel.search(supabase, search)
    } else {
      data = await GroupModel.findAll(supabase)
    }
    return data
  } catch (error) {
    createResponseError(error)
  }
}

const internalGroupDetailsGet = async (event, id) => {
  try {
    const supabase = event.context.supabase
    const groupData = await GroupModel.findById(supabase, id)
    const group = groupData?.[0]
    if (!group) {
      throw createError({ statusCode: 404, statusMessage: 'Group not found' })
    }
    const perms = await GroupPermissionModel.findPermissionsByGroupId(supabase, id)
    const users = await UserGroupModel.findUsersByGroupId(supabase, id)
    return {
      ...group,
      permissions: perms.map(p => p.permissions),
      users: users.map(u => u.user_profiles)
    }
  } catch (error) {
    createResponseError(error)
  }
}

const internalGroupsCreatePost = async (event) => {
  try {
    const admin = getAdminClient()
    const body = await readBody(event)
    const created = await GroupModel.create(admin, body)
    return created?.[0]
  } catch (error) {
    createResponseError(error)
  }
}

const internalGroupUpdatePut = async (event, id) => {
  try {
    const admin = getAdminClient()
    const body = await readBody(event)
    const updated = await GroupModel.update(admin, id, body)
    return updated?.[0]
  } catch (error) {
    createResponseError(error)
  }
}

const internalGroupDelete = async (event, id) => {
  try {
    const admin = getAdminClient()
    await GroupModel.delete(admin, id)
    return { success: true }
  } catch (error) {
    createResponseError(error)
  }
}

const internalGroupUpdatePermissions = async (event, id) => {
  try {
    const admin = getAdminClient()
    const body = await readBody(event)
    const permIds = body?.permission_ids || []
    await GroupPermissionModel.replaceGroupPermissions(admin, id, permIds)
    return { success: true }
  } catch (error) {
    createResponseError(error)
  }
}

const internalGroupUpdateUsers = async (event, id) => {
  try {
    const admin = getAdminClient()
    const body = await readBody(event)
    const userIds = body?.user_ids || []
    await UserGroupModel.replaceGroupUsers(admin, id, userIds)
    return { success: true }
  } catch (error) {
    createResponseError(error)
  }
}

export const groupsInternalApi = {
  internalGroupsListGet,
  internalGroupDetailsGet,
  internalGroupsCreatePost,
  internalGroupUpdatePut,
  internalGroupDelete,
  internalGroupUpdatePermissions,
  internalGroupUpdateUsers
}

