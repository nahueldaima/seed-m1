export const useApi = () => {
    const supabase = useSupabaseClient()
    const router = useRouter()
    const toast = useToast()

    // Get authentication token
    const getAuthToken = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            return session?.access_token
        } catch (error) {
            console.error('Error getting auth token:', error)
            return null
        }
    }

    // Handle logout
    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            await router.push('/login')

            toast.add({
                title: 'Session Expired',
                description: 'You have been logged out due to an authentication error.',
                color: 'red',
                timeout: 5000
            })
        } catch (error) {
            console.error('Error during logout:', error)
        }
    }

    // Format error messages
    const formatErrorMessage = (error) => {
        if (error?.data?.message) {
            return error.data.message
        }
        if (error?.statusMessage) {
            return error.statusMessage
        }
        if (error?.message) {
            return error.message
        }
        return 'An unexpected error occurred'
    }

    // Main API request function
    const apiRequest = async (endpoint, options = {}) => {
        const {
            method = 'GET',
            body = null,
            headers = {},
            showErrorToast = true,
            showSuccessToast = false,
            successMessage = 'Operation completed successfully'
        } = options

        try {
            // Get auth token
            const token = await getAuthToken()

            // Prepare request headers
            const requestHeaders = {
                'Content-Type': 'application/json',
                ...headers
            }

            // Add auth token if available
            if (token) {
                requestHeaders.Authorization = `Bearer ${token}`
            }

            // Make the request
            const data = await $fetch(endpoint, {
                method,
                headers: requestHeaders,
                // body: body ? JSON.stringify(body) : undefined
                body: body
            })

            // Show success toast if requested
            if (showSuccessToast) {
                toast.add({
                    title: 'Success',
                    description: successMessage,
                    color: 'success',
                    timeout: 3000
                })
            }

            return { data, error: null }

        } catch (error) {
            console.error('API request error:', error)

            if (error?.statusCode === 401) {
                await handleLogout()
                return { data: null, error: { message: 'Authentication failed' } }
            }


            const errorMessage = formatErrorMessage(error)

            if (showErrorToast) {
                toast.add({
                    title: 'Network Error',
                    description: errorMessage,
                    color: 'red',
                    timeout: 5000
                })
            }

            return { data: null, error: { message: errorMessage } }
        }
    }


    return {
        // Core methods
        apiRequest,
        // Utility methods
        getAuthToken,
        handleLogout
    }
}
