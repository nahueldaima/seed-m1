import { PermissionModel } from '~/server/database/models'
import { createResponseError } from '~/server/utils/responses'

const internalPermissionsGetAll = async (event) => {
  try {
    const supabase = event.context.supabase
    const data = await PermissionModel.findAll(supabase)
    return data
  } catch (error) {
    createResponseError(error)
  }
}

export const permissionsInternalApi = {
  internalPermissionsGetAll
}
