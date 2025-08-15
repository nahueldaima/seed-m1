import { ProcessModel } from '~/server/database/models'
import { createResponseError } from '~/server/utils/responses'
import { readBody } from 'h3'


// GET /api/internal/processes
const internalProcessesGetAll = async (event) => {
    try {
        const supabase = event.supabase || event.context.supabase;

        const data = await ProcessModel.findAll(supabase);

        return data;

    } catch (error) {
        createResponseError(error);
    }
}

// POST /api/internal/processes
const internalProcessesCreate = async (event) => {
    try {
        const supabase = event.supabase || event.context.supabase;
        const body = await readBody(event);
        // if environment its an array, create as many processes as environments
        let data = []
        if (Array.isArray(body.environment)) {
            data = await Promise.all(body.environment.map(env => ProcessModel.create(supabase, { ...body, environment: env })));
            return data;
        } else {
            data = await ProcessModel.create(supabase, body);
        }
        return Array.isArray(data) ? data[0] : data;
    } catch (error) {
        createResponseError(error);
    }
}

export const processesInternalApi = {
    internalProcessesGetAll,
    internalProcessesCreate
}