// import { createRouter, defineEventHandler, useBase } from 'h3';
import { processEventsInternalApi } from '~/server/services/processes_events.services'
import { checkRequestedPermissions } from '~/server/utils/permissions'


export default defineEventHandler(async (event) => {
    // 1) tag the permission(s) the endpoint requires
    // event.requestedClaims = ['PROCESSES_EVENTS_READ']
  
    // 2) aborts with 403 if missing
    // await checkRequestedPermissions(event)

    // 3) continue with normal logic
    return processEventsInternalApi.internalProcessEventsGet(event)
})