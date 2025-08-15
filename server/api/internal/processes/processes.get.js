// import { createRouter, defineEventHandler, useBase } from 'h3';
import { processesInternalApi } from '~/server/services/processes.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'


// retrieve process library
export default defineEventHandler(async (event) => {
    // 1) tag the permission(s) the endpoint requires
    // event.requestedClaims = ['PROCESSES_READ']
  
    // 2) aborts with 403 if missing
    // await checkRequestedPermissions(event)

    // 3) continue with normal logic
    return processesInternalApi.internalProcessesGetAll(event)
})