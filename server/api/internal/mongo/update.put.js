import { mongoInternalApi } from '~/server/services/mongo.services';

export default defineEventHandler(async (event) => {
  return mongoInternalApi.updateDocuments(event);
});
