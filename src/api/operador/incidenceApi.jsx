import config, { mainApi, incidenceApi } from "../config";

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

// Función para obtener una incidencia por ID
export const getIncidenceByIdApi = async(id) => {
  try {
    const response = await mainApi.get(`/incidence/${id}`);
    return response.data;
  } catch (error) {
     console.error("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}

export const getAllIncidenceComunicationApi = async () => {
  try {
    const response = await mainApi.get('/comunication/all');
    return response.data;
  } catch (error) {
    console.log("Error fetching incidences:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidences');
  }
}

export const getAllIncidenceZonesApi = async () => {
  try {
    const response = await mainApi.get('/zones/all');
    return response.data;
  } catch (error) {
    console.log("Error fetching incidences:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidences');
  }
}

export const updateIncidenceApi = async (payload,  id) => {
  try {
    const response = await config.patch(`/incidence/${id}` , payload);
    return response.data;
  } catch (error) {
    console.log("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}

export const deleteIncidenceApi = async ( id) => {
  try {
    const response = await config.delete(`/incidence/delete/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}
