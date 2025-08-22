import { UserCredentialModel } from '~/server/database/models';
import { readBody } from 'h3';

const maskValue = (val) => (val ? '********' : null);

const internalCredentialsGet = async (event, plain = false) => {
  const supabase = event.context.supabase;
  const userId = event.context.user.id;

  const result = await UserCredentialModel.findByUserId(supabase, userId);
  const cred = Array.isArray(result) ? result[0] : null;

  if (!cred) {
    return {
      aws_access_key: null,
      aws_secret_key: null,
      mongo_username: null,
      mongo_password: null
    };
  }

  const { aws_access_key, aws_secret_key, mongo_username, mongo_password } = cred;

  if (!plain) {
    return {
      aws_access_key: maskValue(aws_access_key),
      aws_secret_key: maskValue(aws_secret_key),
      mongo_username: maskValue(mongo_username),
      mongo_password: maskValue(mongo_password)
    };
  }

  return { aws_access_key, aws_secret_key, mongo_username, mongo_password };
};

const internalCredentialsUpsert = async (event) => {
  const supabase = event.context.supabase;
  const userId = event.context.user.id;
  const body = await readBody(event);

  const data = {
    aws_access_key: body.aws_access_key ?? null,
    aws_secret_key: body.aws_secret_key ?? null,
    mongo_username: body.mongo_username ?? null,
    mongo_password: body.mongo_password ?? null
  };

  await UserCredentialModel.upsert(supabase, userId, data);
  return { status: 'success' };
};

export const credentialsInternalApi = {
  internalCredentialsGet,
  internalCredentialsUpsert
};
