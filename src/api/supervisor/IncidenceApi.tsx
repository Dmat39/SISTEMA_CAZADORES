import { mainApi, incidenceApi } from "../config";


// Función para buscar incidencias por código
export const getIncidenceCodesApi = async () => {
  try {
    const response = await incidenceApi.get('/buscar_incidencias');
    return response.data;
  } catch (error) {
    console.error("Error fetching incidence codes:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence codes');
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
    return response.data;
  } catch (error) {
    console.log("Error fetching incidences:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidences');
  }
}


export const getIncidenceByIdApi = async(id) => {
  try {
    const response = await mainApi.get(`/incidence/${id}`);
    return response.data;
  } catch (error) {
     console.error("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}



export const updateIncidenceApi = async(id , payload) => {
  try {
    const response = await mainApi.patch(`/incidence/update/${id}` , payload);
    return response.data;
  } catch (error) {
     console.error("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}

