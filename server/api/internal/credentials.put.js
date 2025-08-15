import { credentialsInternalApi } from '~/server/services/credentials.services';

export default defineEventHandler(async (event) => {
  return credentialsInternalApi.internalCredentialsUpsert(event);
});
