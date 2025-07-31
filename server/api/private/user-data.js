export default defineEventHandler(async (event) => {
    // User is automatically available from global middleware
    const isAuthenticated = event.context.isAuthenticated;
    const supabase = event.context.supabase;

    let group = null;

    try {
        const { data, error, status } = await supabase.from('groups').select('id').limit(1);
        group = data[0];
    } catch (error) {
        console.log(error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        })
    }

    return {
        message: 'group from protected API!',
        group: {
            id: group?.id,
        },
        timestamp: new Date().toISOString(),
        status: 'success',
        data: {
            endpoint: 'protected',
            description: 'This endpoint requires valid authentication'
        }
    }
})