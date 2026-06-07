import mainApi from "../config";

// Función para obtener los datos del operador
export const getOperatorProfileApi = async (id) => {
  try {
    const response = await mainApi.get(`/operator/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching operator profile:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch operator profile');
  }
}

// Función para obtener los datos del operador
export const updateOperatorProfileApi = async (id, updateData) => {
  try {
    console.log("Enviando datos de actualización:", updateData);
    const response = await mainApi.patch(`/operator/update/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating operator profile:", error);
    throw error.response ? error.response.data : new Error('Failed to update operator profile');
  }
};