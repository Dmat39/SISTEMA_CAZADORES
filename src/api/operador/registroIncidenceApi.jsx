import {mainApi} from "../config";

// Funcion para crear SubRegistro de una incidencia
export const createSubRegistroIncidenceApi = async (incidenceData) => {
  try {
    const response = await mainApi.post('/record/add', incidenceData);
    return response.data;
  } catch (error) {
    console.error("Error creating incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to create incidence');
  }
}

// Funcion para obtener las imagenes de los subregistros de una incidencia
export const getSubRegistroIncidenceImageApi = async (Path) => {
  try {
    const response = await mainApi.get(`/files/records/${Path}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching incidence images:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence images');
  }
}