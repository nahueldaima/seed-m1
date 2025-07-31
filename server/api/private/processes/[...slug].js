import { createRouter, defineEventHandler, useBase } from 'h3';
import { processRunsPrivateApi } from '~/server/services/processes_runs.services'
// import { checkRequestedPermissions } from '~/server/utils/permissions'

const router = createRouter()

router.get(
    '/*',
    defineEventHandler(async (event) => {
    //   // 1) tag the permission(s) the endpoint requires
    //   event.requestedClaims = ['TELEMETRY_READ']
  
    //   // 2) aborts with 403 if missing
    //   await checkRequestedPermissions(event)
  
      // 3) continue with normal logic
      return processRunsPrivateApi.privateProcessRunsGet(event)
    })
  )

  router.post(
    '/',
    defineEventHandler(async (event) => {
    //   // 1) tag the permission(s) the endpoint requires
    //   event.requestedClaims = ['TELEMETRY_READ']
  
    //   // 2) aborts with 403 if missing
    //   await checkRequestedPermissions(event)
  
      // 3) continue with normal logic
      return processRunsPrivateApi.privateProcessRunsPost(event)
    })
  )




export default useBase('/api/private/processes', router.handler)