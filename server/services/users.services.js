import { fetchUserAuthorisation } from '~/server/utils/permissions'

// GET /api/internal/user-data/permissions
const internalRetrieveUsersPermissionsGet = async (event) => {
    const supabase = event.context.supabase;

    const data = await fetchUserAuthorisation(supabase, event.context.user.id);
    
    return data;
}


export const usersInternalApi = {
    internalRetrieveUsersPermissionsGet
}