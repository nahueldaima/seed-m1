import { MongoClient } from 'mongodb';
import { UserCredentialModel } from '~/server/database/models';
import { readBody, createError } from 'h3';

const getMongoUri = async (supabase, userId) => {
  const creds = await UserCredentialModel.findByUserId(supabase, userId);
  const cred = Array.isArray(creds) ? creds[0] : null;
  if (!cred?.mongo_username || !cred?.mongo_password) {
    throw createError({ statusCode: 401, statusMessage: 'MongoDB credentials not found' });
  }
  const username = encodeURIComponent(cred.mongo_username);
  const password = encodeURIComponent(cred.mongo_password);
  const cluster = process.env.MONGODB_CLUSTER_URI;
  return `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
};

const withClient = async (supabase, userId, fn) => {
  const uri = await getMongoUri(supabase, userId);
  const client = new MongoClient(uri);
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
};

const createDocument = async (event) => {
  const supabase = event.context.supabase;
  const userId = event.context.user.id;
  const { db, collection, document } = await readBody(event);
  return withClient(supabase, userId, async (client) => {
    const col = client.db(db).collection(collection);
    const result = await col.insertOne(document);
    return { insertedId: result.insertedId };
  });
};

const findDocuments = async (event) => {
  const supabase = event.context.supabase;
  const userId = event.context.user.id;
  const { db, collection, filter = {} } = await readBody(event);
  return withClient(supabase, userId, async (client) => {
    const col = client.db(db).collection(collection);
    return await col.find(filter).toArray();
  });
};

const updateDocuments = async (event) => {
  const supabase = event.context.supabase;
  const userId = event.context.user.id;
  const { db, collection, filter, update } = await readBody(event);
  return withClient(supabase, userId, async (client) => {
    const col = client.db(db).collection(collection);
    const result = await col.updateMany(filter, update);
    return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
  });
};

const deleteDocuments = async (event) => {
  const supabase = event.context.supabase;
  const userId = event.context.user.id;
  const { db, collection, filter } = await readBody(event);
  return withClient(supabase, userId, async (client) => {
    const col = client.db(db).collection(collection);
    const result = await col.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  });
};

export const mongoInternalApi = {
  createDocument,
  findDocuments,
  updateDocuments,
  deleteDocuments,
};

