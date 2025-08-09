// import { createRouter, defineEventHandler, useBase } from 'h3';
import { usersInternalApi } from '~/server/services/users.services'
import { createRouter, defineEventHandler, useBase } from 'h3';
import { checkRequestedPermissions } from '~/server/utils/permissions'


const router = createRouter()

router.get(
  '/foo',
  defineEventHandler(async (event) => {
  //   // 1) tag the permission(s) the endpoint requires
  //   event.requestedClaims = ['USERS_READ']

  //   // 2) aborts with 403 if missing
  //   await checkRequestedPermissions(event)

    // 3) continue with normal logic
    return usersInternalApi.internalRetrieveUsersPermissionsGet(event);
  })
)

router.get(
    '/permissions',
    defineEventHandler(async (event) => {
    //   // 1) tag the permission(s) the endpoint requires
    //   event.requestedClaims = ['USERS_READ']
  
    //   // 2) aborts with 403 if missing
    //   awai t checkRequestedPermissions(event)
  
      // 3) continue with normal logic
      let data = await usersInternalApi.internalRetrieveUsersPermissionsGet(event);
      return {
        isSuper: data?.isSuper,
        perms: data?.perms?.map(item => item.code)
      }
    })
  )

export default useBase('/api/internal/user-data', router.handler)
