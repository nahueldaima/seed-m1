import { ProcessRunModel, ProcessModel } from '~/server/database/models'
import { createResponseError } from '~/server/utils/responses'
import { readBody, getQuery} from 'h3'


// GET /api/private/processes
const privateProcessRunsGet = async (event) => {
    try {
        const supabase = event.supabase || event.context.supabase;

        const data = await ProcessRunModel.findAll(supabase);

        return data;
    } catch (error) {
        createResponseError(error);
    }
}

// GET /api/internal/processes
const internalProcessRunsGet = async (event) => {
    try {
        const supabase = event.context.supabase;

        const query = getQuery(event)

        const options = {
            environment: query.environment,
            status: query.status,
            processId: query.processId,
            limit: query.limit ? Number(query.limit) : undefined,
            offset: query.offset ? Number(query.offset) : undefined,
            from: query.from,
            to: query.to,
            search: query.search,
            processIds: query.processIds ? query.processIds.split(',') : undefined
        }

        const data = await ProcessRunModel.findAll(supabase, options);

        return data;

    } catch (error) {
        createResponseError(error);
    }
}

// POST /api/private/processes/header
const privateProcessRunsPost = async (event) => {
    const supabase = event.context.supabase;

    try {
        // find the process _id by name and account
        let body = await readBody(event)
        const process = await ProcessModel.findByName(supabase, body.processName, body.account);

        if (!process?.length) {
            throw new Error({
                message: 'Process not found and has to be created first',
                statusCode: 417,
            });
        }

        body.process_id = process[0].id;

        const data = await ProcessRunModel.create(supabase, body);

        if (!data?.length) {
            throw new Error({
                message: 'Error creating process run',
                statusCode: 417,
            });
        }
        
        return {
            id: data[0].id,
        }

    } catch (error) {
        createResponseError(error);
    }
}

export const processRunsPrivateApi = {
    privateProcessRunsGet,
    privateProcessRunsPost
}


export const processRunsInternalApi = {
    internalProcessRunsGet
}