import { usersInternalApi } from '~/server/services/users.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  // event.requestedClaims = ['GROUPS_WRITE']
  // await checkRequestedPermissions(event)
  return usersInternalApi.internalUsersUpdatePut(event, id)
})
