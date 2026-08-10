import { mainApi, incidenceApi } from "../config";


// Función para buscar incidencias por código.
// Sin `codigo`, el backend solo devuelve las últimas 20 registradas;
// con `codigo`, busca entre todas las incidencias (match parcial, insensible a mayúsculas).
export const getIncidenceCodesApi = async (codigo?: string) => {
  try {
    const url = codigo?.trim()
      ? `/buscar_incidencias/${encodeURIComponent(codigo.trim())}`
      : '/buscar_incidencias';
    const response = await incidenceApi.get(url);
    const data = response.data?.data ?? response.data;
    const normalized = data.map((i) => ({
      codigo_incidencia: i.codigoIncidencia ?? i.codigo_incidencia,
      latitud: i.latitud,
      longitud: i.longitud,
    }));
    return { ...response.data, data: normalized };
  } catch (error) {
    // 404 = sin coincidencias, no es un error real
    if (error.response?.status === 404) {
      return { ...error.response.data, data: [] };
    }
    console.error("Error fetching incidence codes:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence codes');
  }
}

// Función para crear las incidencias
export const createIncidenceApi = async (incidenceData) => {
  try {
    const response = await mainApi.post('/incidence/add', incidenceData);
    return response.data;
  } catch (error) {
    console.error("Error creating incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to create incidence');
  }
}

// Función para obtener todas las incidencias
export const getAllIncidencesApi = async () => {
  try {
    const response = await mainApi.get('/incidence/all');
    return response.data;
  } catch (error) {
    console.log("Error fetching incidences:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidences');
  }
}


export const getIncidenceByIdApi = async(id) => {
  try {
    const response = await mainApi.get(`/incidence/${id}`);
    return response.data;
  } catch (error) {
     console.error("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}



export const updateIncidenceApi = async(id , payload) => {
  try {
    const response = await mainApi.patch(`/incidence/update/${id}` , payload);
    return response.data;
  } catch (error) {
     console.error("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}

