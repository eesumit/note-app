import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Flag to prevent multiple redirects
let isRedirecting = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Skip refresh for logout and refresh endpoints
            if (originalRequest.url?.includes('/auth/logout') || originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            try {
                // Try to refresh the token
                await axios.post('/api/auth/refresh');

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails and we're not already redirecting, clear cookies and redirect to login
                if (!isRedirecting) {
                    isRedirecting = true;

                    // Clear cookies by setting them to expire
                    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

                    // Small delay to ensure cookies are cleared before redirect
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 100);
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
