import { usersInternalApi } from '~/server/services/users.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  event.requestedClaims = ['GROUPS_READ']
  await checkRequestedPermissions(event)
  return usersInternalApi.internalUsersListGet(event)
})
