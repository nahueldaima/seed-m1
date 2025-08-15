import { credentialsInternalApi } from '~/server/services/credentials.services';
import { checkRequestedPermissions } from '~/server/utils/permissions';
import { getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const { plain } = getQuery(event);
  if (plain === 'true') {
    event.requestedClaims = ['CREDENTIALS_VIEW'];
    await checkRequestedPermissions(event);
    return credentialsInternalApi.internalCredentialsGet(event, true);
  }
  return credentialsInternalApi.internalCredentialsGet(event, false);
});
