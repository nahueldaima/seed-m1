import { groupsInternalApi } from '~/server/services/groups.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  // event.requestedClaims = ['GROUPS_DETAILS']
  // await checkRequestedPermissions(event)
  return groupsInternalApi.internalGroupDetailsGet(event, id)
})
