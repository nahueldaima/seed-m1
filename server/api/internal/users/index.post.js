import { usersInternalApi } from '~/server/services/users.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  // event.requestedClaims = ['GROUPS_WRITE']
  // await checkRequestedPermissions(event)
  return usersInternalApi.internalUsersInvitePost(event)
})
