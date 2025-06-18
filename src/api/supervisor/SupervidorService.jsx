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
export const getAllSupervisorApi = async () => {
  try {
    const response = await config.get('/supervisor/all');
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
    const response = await config.patch(`/incidence/assign-operator` , payload);
    return response.data;
  } catch (error) {
    console.log("Error assigning operators: ", error);
    throw error.response ? error.response.data : new Error('Failed to assignment operators');
  }
}
