import { groupsInternalApi } from '~/server/services/groups.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  // event.requestedClaims = ['GROUPS_WRITE']
  // await checkRequestedPermissions(event)
  return groupsInternalApi.internalGroupsCreatePost(event)
})
