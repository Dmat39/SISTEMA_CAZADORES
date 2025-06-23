import mainApi from "../config";

export const deletePhotoApi = async (id) => {
  try {
    const response = await mainApi.delete(`/record/delete/image/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error al eliminar la foto:", error);
    throw error.response ? error.response.data : new Error('Error al eliminar la foto');
  }
};