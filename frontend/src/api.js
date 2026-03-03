import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Add a request interceptor to include the token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — ONLY auto-logout when there is truly no token
// All other 401/403 errors are handled by each component individually
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const token = localStorage.getItem('token');
            const isPublicPage = window.location.pathname === '/register' || window.location.pathname === '/login';

            // Only logout if there is literally no token AND it's not a public page
            if (!token && !isPublicPage) {
                console.warn("No token found. Redirecting to login.");
                window.location.href = '/login';
            } else if (!token && isPublicPage) {
                // If on public page and 401, just log it but don't redirect
                console.warn(`Public API call (401) on ${isPublicPage ? 'public page' : 'authenticated route'}: ${error.config?.url}`);
            } else {
                // Token exists but got 401 — could be expired or permissions issue
                // Let each page component handle this error gracefully
                console.warn(`401 Unauthorized on ${error.config?.url}. Token may be expired.`);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
