import axios from 'axios';
import { useSelector } from 'react-redux';

// Variable global para almacenar el token
let globalToken = null;

// Función para actualizar el token globalmente
export const setToken = (token) => {
  globalToken = token;
}

// Hook personalizado para actualizar el token desde Redux
export const useApiConfig = () => {
  const token = useSelector((state) => state.auth.token);
  return { token };
};

const config = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el Bearer Token a las peticiones
config.interceptors.request.use(
  (config) => {
    if (globalToken) {
      config.headers.Authorization = `Bearer ${globalToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default config;