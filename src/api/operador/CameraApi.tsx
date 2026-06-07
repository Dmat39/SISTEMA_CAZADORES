import mainApi from "../config";

export const allCameraApi = async () => {
  try {
    const response = await mainApi.get(`/camera/all`);
    return response.data;
  } catch (error) {
    console.error("Error al traer las imagenes:", error);
    throw error.response ? error.response.data : new Error('Error en la petición de las imagenes');
  }
};