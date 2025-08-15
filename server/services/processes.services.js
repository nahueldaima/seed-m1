import { ProcessModel } from '~/server/database/models'
import { createResponseError } from '~/server/utils/responses'


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

export const processesInternalApi = {
    internalProcessesGetAll
}