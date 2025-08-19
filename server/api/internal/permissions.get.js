import { permissionsInternalApi } from '~/server/services/permissions.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  event.requestedClaims = ['GROUPS_DETAILS']
  await checkRequestedPermissions(event)
  return permissionsInternalApi.internalPermissionsGetAll(event)
})
