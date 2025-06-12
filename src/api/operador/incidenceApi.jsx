import config from "../config";


// Función para crear las incidencias
export const incidenceApi = async (incidenceData) => {
  try {
    const response = await config.post('/incidence/add', incidenceData);
    return response.data;
  } catch (error) {
    console.error("Error creating incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to create incidence');
  }
}

// Función para obtener todas las incidencias
export const getAllIncidencesApi = async () => {
  try {
    const response = await config.get('/incidence/all');
    return response.data;
  } catch (error) {
    console.log("Error fetching incidences:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidences');
  }
}