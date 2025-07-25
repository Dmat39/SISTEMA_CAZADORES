import config from "../config";

// Función para obtener todos los cazadores
export const getAllHuntersApi = async (page = 0, limit = 50) => {
  try {
    const response = await config.get('/hunter/all', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching hunters:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch hunters');
  }
}

// Función para crear un cazador
export const createHunterApi = async (hunterData) => {
  try {
    const response = await config.post('/hunter/add', hunterData);
    return response.data;
  } catch (error) {
    console.error("Error creating hunter:", error);
    throw error.response ? error.response.data : new Error('Failed to create hunter');
  }
}

// Función para actualizar un cazador
export const updateHunterApi = async (payload, id) => {
  try {
    const response = await config.patch(`/hunter/update/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating hunter:", error);
    throw error.response ? error.response.data : new Error('Failed to update hunter');
  }
}

// Función para eliminar un cazador
export const deleteHunterApi = async (id) => {
  try {
    const response = await config.delete(`/hunter/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting hunter:", error);
    throw error.response ? error.response.data : new Error('Failed to delete hunter');
  }
}

// Función para obtener un cazador por ID
export const getHunterByIdApi = async (id) => {
  try {
    const response = await config.get(`/hunter/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching hunter:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch hunter');
  }
} 