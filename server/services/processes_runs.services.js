import { ProcessRunModel } from '~/server/database/models'
import { ProcessModel } from '~/server/database/models'


// GET /api/private/processes
const privateProcessRunsGet = async (event) => {
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

// POST /api/private/processes/header
const privateProcessRunsPost = async (event) => {
    const supabase = event.context.supabase;

    // find the process _id by name and account
    let body = await readBody(event)
    const process = await ProcessModel.findByName(supabase, body.processName, body.account);

    if (!process?.length) {
        throw new Error('Process not found and has to be created first');
    }

    body.process_id = process[0].id;

    const data = await ProcessRunModel.create(supabase, body);
    
    return {
        id: data[0].id,
    }
}

export const processRunsPrivateApi = {
    privateProcessRunsGet,
    privateProcessRunsPost
}


export const processRunsInternalApi = {
    internalProcessRunsGet
}