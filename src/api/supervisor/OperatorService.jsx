import config from "../config";


// Función para crear los operadores 
export const addOperatorApi = async (payload ) => {
  try {
    const response = await config.post('/operator/add', payload);
    return response.data;
  } catch (error) {
    console.error("Error creating operator:", error);
    throw error.response ? error.response.data : new Error('Failed to create operator');
  }
}

// Función para obtener todas las supervisors
export const getAllOperatorApi = async () => {
  try {
    const response = await config.get('/operator/all');
    return response.data;
  } catch (error) {
    console.log("Error fetching operators:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch operators');
  }
}


export const deleteOperatorApi = async ( id) => {
  try {
    const response = await config.delete(`/operator/delete/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching operator:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch operator');
  }
}

export const updateOperatorApi = async (payload,  id) => {
  try {
    const response = await config.patch(`/operator/update/${id}` , payload);
    return response.data;
  } catch (error) {
    console.log("Error fetching operator:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch operator');
  }
}
