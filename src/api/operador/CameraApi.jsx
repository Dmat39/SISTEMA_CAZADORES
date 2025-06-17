import mainApi from "../config";


export const allCameraApi = async () => {
  try {
    const response = await mainApi.get('/camera/all');
    return response.data;
  } catch (error) {
    console.error("Error creating incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to create incidence');
  }
}