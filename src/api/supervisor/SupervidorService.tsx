import config from "../config";


// Función para crear las supervisors
export const addsupervidorServiceApi = async (payload ) => {
  try {
    const response = await config.post('/supervisor/add', payload);
    return response.data;
  } catch (error) {
    console.error("Error creating supervisors:", error);
    throw error.response ? error.response.data : new Error('Failed to create supervisors');
  }
}

// Función para obtener todas las supervisors
export const getAllSupervisorApi = async (params = {}) => {
  try {
    const response = await config.get('/supervisor/all', { params });
    return response.data;
  } catch (error) {
    console.log("Error fetching supervisors:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch supervisors');
  }
}


export const deleteSupervisorApi = async ( id) => {
  try {
    const response = await config.delete(`/supervisor/delete/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching supervisors:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch supervisors');
  }
}

export const updateSupervisorApi = async (payload,  id) => {
  try {
    const response = await config.patch(`/supervisor/update/${id}` , payload);
    return response.data;
  } catch (error) {
    console.log("Error fetching supervisors:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch supervisors');
  }
}

export const assignOperatorApi = async (payload) => {
  try {
    const response = await config.post(`/assignment/add` , payload);
    return response.data;
  } catch (error) {
    console.log("Error assigning operators: ", error);
    throw error.response ? error.response.data : new Error('Failed to assignment operators');
  }
}

export const getAllAssignedOperatorsApi = async (incidenceId) => {
  try {
    const response = await config.get(`/assignment/all/${incidenceId}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching assignments:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch assignments');
  }
}

export const deleteAssignApi = async ( id) => {
  try {
    const response = await config.delete(`/assignment/delete/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching supervisors:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch supervisors');
  }
}