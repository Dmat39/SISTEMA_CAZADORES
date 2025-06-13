import { mainApi, incidenceApi } from "../config";

// Función para buscar incidencias por código (usa el endpoint especifico)
export const searchIncidencesByCode = async (searchTerm) => {
  try {
    const response = await incidenceApi.get(`/buscar_incidencias?codigo=${searchTerm}`);
    return response.data;
  } catch (error) {
    console.error("Error searching incidences:", error);
    throw error.response ? error.response.data : new Error('Failed to search incidences');
  }
}

// Función para crear las incidencias
export const createIncidenceApi = async (incidenceData) => {
  try {
    const response = await mainApi.post('/incidence/add', incidenceData);
    return response.data;
  } catch (error) {
    console.error("Error creating incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to create incidence');
  }
}

// Función para obtener todas las incidencias
export const getAllIncidencesApi = async () => {
  try {
    const response = await mainApi.get('/incidence/all');
    console.log("Estoy aqui denuevo");
    return response.data;
  } catch (error) {
    console.log("Error fetching incidences:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidences');
  }
}

// Función para obtener incidencia por ID
export const getIncidenceByIdApi = async(id) => {
  try {
    const response = await mainApi.get(`/incidence/${id}`);
    return response.data;
  } catch (error) {
     console.error("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}
