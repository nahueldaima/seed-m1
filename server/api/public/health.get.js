export default defineEventHandler(async (event) => {
    return {
      message: 'Hello from public API!',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        endpoint: 'public',
        description: 'This endpoint is accessible without authentication'
      }
    }
  })