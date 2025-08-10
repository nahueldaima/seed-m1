export const createResponseError = (error) => {
    let errorMessage = error?.message || 'Unknown error';
    let errorStack = error?.stack;
    let errorCode = error?.code || error?.statusCode;
    
    console.log(errorStack);

    throw new Error({
        message: errorMessage,
        statusCode: errorCode,
    });
}