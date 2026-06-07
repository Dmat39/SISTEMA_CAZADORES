import mainApi from "../config";

export const updateRecordApi = async (id, updateData) => {
  try {
    const response = await mainApi.patch(`/record/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating record:", error);
    throw error.response ? error.response.data : new Error('Failed to update record');
  }
};

export const deleteRecordApi = async (id) => {
  try {
    const response = await mainApi.delete(`/record/delete/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error al eliminar el registro:", error);
    throw error.response ? error.response.data : new Error('Error al eliminar el registro');
  }
};