import config from "../config";


export const createOperator = async (formData) => {
  try {
    const response = await config.post('/operator/add', formData);
    return response.data;
  } catch (error) {
    console.error("Error creating incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to create incidence');
  }

}
