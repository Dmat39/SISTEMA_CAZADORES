import mainApi from "../config";

// Función para crear los subregistros de cada incidencia
export const createSubRegistroIncidenceApi = async (incidenceData) => {
  try {
    const response = await mainApi.post('/incidence/add', incidenceData);
    return response.data;
  } catch (error) {
    console.error("Error creating incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to create incidence');
  }
}