import config from "../config";


export const incidenceApi = async (incidenceData) => {
  try {
    const response = await config.post('/incidence/add', incidenceData);
    return response.data;
  } catch (error) {
    console.error("Error creating incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to create incidence');
  }

}
