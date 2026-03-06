import axios from 'axios';

// Dynamic API URI: env var > same-origin /api (production) > localhost (dev)
const API_URI = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
    baseURL: API_URI,
});

api.interceptors.request.use(
    (config) => {
        let token = null;
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.token) {
                    token = user.token;
                }
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
            }
        }

        if (!token) {
            token = localStorage.getItem('token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
