import { groupsInternalApi } from '~/server/services/groups.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  // event.requestedClaims = ['GROUPS_DELETE']
  // await checkRequestedPermissions(event)
  return groupsInternalApi.internalGroupDelete(event, id)
})
