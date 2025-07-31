import { ProcessRunModel } from '~/server/database/models'


// GET /api/private/processes
export const privateProcessRunsGet = async (event) => {
    // if event.supabase, its admin and use that
    const supabase = event.supabase || event.context.supabase;

    const data = await ProcessRunModel.findAll(supabase);

    return data;
}

// GET /api/internal/processes
const internalProcessRunsGet = async (event) => {
    const supabase = event.context.supabase;

    const data = await ProcessRunModel.findAll(supabase);
    
    return data;
}

export const processRunsPrivateApi = {
    privateProcessRunsGet
}


export const processRunsInternalApi = {
    internalProcessRunsGet
}