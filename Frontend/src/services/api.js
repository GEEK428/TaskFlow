/**
 * TaskFlow API Service
 * Configures Axios with base URL and JWT interceptors for seamless authentication.
 */

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, 
});

/**
 * Request Interceptor
 * Automatically attaches the JWT token from localStorage to Every outgoing request.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles global error responses (e.g., 401 Unauthorized to trigger logout).
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
           
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
        }
        return Promise.reject(error);
    }
);

export default api;
