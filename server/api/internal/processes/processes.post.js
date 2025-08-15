import { processesInternalApi } from '~/server/services/processes.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  // event.requestedClaims = ['PROCESSES_WRITE']
  // await checkRequestedPermissions(event)
  return processesInternalApi.internalProcessesCreate(event)
})
