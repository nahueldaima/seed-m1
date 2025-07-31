// import { createRouter, defineEventHandler, useBase } from 'h3';
import { processRunsInternalApi } from '~/server/services/processes_runs.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'


export default defineEventHandler(async (event) => {
    // 1) tag the permission(s) the endpoint requires
    event.requestedClaims = ['PROCESSES_RUNS_READ']
  
    // 2) aborts with 403 if missing
    await checkRequestedPermissions(event)

    // 3) continue with normal logic
    return processRunsInternalApi.internalProcessRunsGet(event)
})