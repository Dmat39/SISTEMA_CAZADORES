import mainApi from "../config";

export const getAllCrimesApi = async () => {
  try {
    const response = await mainApi.get(`/crime/all`);
    return response.data;
  } catch (error) {
    console.error("Error al traer los crimenes:", error);
    throw error.response ? error.response.data : new Error('Error en la petición de los crimenes');
  }
};