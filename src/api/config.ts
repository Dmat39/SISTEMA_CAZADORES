import axios, { InternalAxiosRequestConfig } from 'axios';

let globalToken: string | null = null;

export const setToken = (token: string | null): void => {
  globalToken = token;
};

const config = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const incidenceConfig = axios.create({
  baseURL: import.meta.env.VITE_API_CODE_INCIDENCE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000,
});

const addAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  if (globalToken) {
    config.headers.Authorization = `Bearer ${globalToken}`;
  }
  return config;
};

config.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
incidenceConfig.interceptors.request.use((config) => config, (error) => Promise.reject(error));

export const mainApi = config;
export const incidenceApi = incidenceConfig;

export default config;
