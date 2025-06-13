import axios from 'axios';

let globalToken = null;

export const setToken = (token) => {
    globalToken = token;
};

const config = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

config.interceptors.request.use(
    (config) => {
        if (globalToken) {
            config.headers.Authorization = `Bearer ${globalToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default config;
