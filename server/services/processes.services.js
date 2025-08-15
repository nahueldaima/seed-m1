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
        const data = await ProcessModel.create(supabase, body);
        return Array.isArray(data) ? data[0] : data;
    } catch (error) {
        createResponseError(error);
    }
}

export const processesInternalApi = {
    internalProcessesGetAll,
    internalProcessesCreate
}