import { ProcessEventModel } from '~/server/database/models'
import { createResponseError } from '~/server/utils/responses'
import { readBody, getQuery} from 'h3'

// GET /api/internal/processes
const internalProcessEventsGet = async (event) => {
    try {
        const supabase = event.context.supabase;

        const query = getQuery(event)

        const options = {
            process_run_id: query.process_run_id,
            orderBy: { field: 'created_at', ascending: false },
            // environment: query.environment,
            // status: query.status,
            // processId: query.processId,
            // limit: query.limit ? Number(query.limit) : undefined,
            // offset: query.offset ? Number(query.offset) : undefined,
            // from: query.from,
            // to: query.to,
            // search: query.search,
            // processIds: query.processIds ? query.processIds.split(',') : undefined
        }

        const data = await ProcessEventModel.findAll(supabase, options);

        return data;

    } catch (error) {
        createResponseError(error);
    }
}

// export const processRunsPrivateApi = {
//     privateProcessRunsGet,
//     privateProcessRunsPost
// }


export const processEventsInternalApi = {
    internalProcessEventsGet
}