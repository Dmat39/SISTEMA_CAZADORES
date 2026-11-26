import axios, { InternalAxiosRequestConfig } from 'axios';

import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

export const getToken = () => store.getState().auth.token;

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
  const globalToken = getToken();
  if (globalToken && config.url !== "/auth/login") {
    config.headers.Authorization = `Bearer ${globalToken}`;
  }
  return config;
};

config.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
config.interceptors.response.use(response => response, error => {
  const token = getToken();
  if (error.response?.status === 401 && token &&
      error.config?.headers?.Authorization === `Bearer ${token}`) {
    store.dispatch(logout());
    error.response.data = { message: 'Tu sesión venció. Vuelve a iniciar sesión.' };
  }
  return Promise.reject(error);
});
incidenceConfig.interceptors.request.use((config) => config, (error) => Promise.reject(error));

export const mainApi = config;
export const incidenceApi = incidenceConfig;

export default config;
