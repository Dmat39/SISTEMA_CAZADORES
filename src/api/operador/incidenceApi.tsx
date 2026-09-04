import config, { mainApi, incidenceApi } from "../config";

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
      id: i.id,
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
export const getAllIncidencesApi = async (params = {}) => {
  try {
    // Construir query string con los parámetros
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.date) queryParams.append('date', params.date);
    if (params.search) queryParams.append('search', params.search);

    // Manejar parámetros de rango de fechas
    if (params.start) queryParams.append('start', params.start);
    if (params.end) queryParams.append('end', params.end);

    // Manejar múltiples crimeIds
    if (params.crimeIds && Array.isArray(params.crimeIds)) {
      params.crimeIds.forEach(crimeId => {
        queryParams.append('crimeIds', crimeId);
      });
    }

    // Manejar filtro de estado
    if (params.status) queryParams.append('status', params.status);

    // Manejar filtro de usuario
    if (params.userId) queryParams.append('userId', params.userId);

    const queryString = queryParams.toString();
    const url = queryString ? `/incidence/all?${queryString}` : '/incidence/all';

    const response = await mainApi.get(url);
    return response.data;
  } catch (error) {
    console.log("Error fetching incidences:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidences');
  }
}

// Función para obtener una incidencia por ID
export const getIncidenceByIdApi = async (id) => {
  try {
    const response = await mainApi.get(`/incidence/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}

export const getAllIncidenceComunicationApi = async () => {
  try {
    const response = await mainApi.get('/communication/all');
    return response.data;
  } catch (error) {
    console.log("Error fetching incidences:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidences');
  }
}

export const getAllIncidenceZonesApi = async () => {
  try {
    const response = await mainApi.get('/zone/all');
    return response.data;
  } catch (error) {
    console.log("Error fetching incidences:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidences');
  }
}

export const updateIncidenceApi = async (payload, id) => {
  try {
    const response = await config.patch(`/incidence/update/${id}`, payload);
    return response.data;
  } catch (error) {
    console.log("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}

export const deleteIncidenceApi = async (id) => {
  try {
    const response = await config.delete(`/incidence/delete/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching incidence:", error);
    throw error.response ? error.response.data : new Error('Failed to fetch incidence');
  }
}

// Función para cambiar el estado de una incidencia
export const updateIncidenceStatusApi = async (id, status) => {
  try {
    const response = await mainApi.patch(`/incidence/update/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating incidence status:", error);
    throw error.response ? error.response.data : new Error('Failed to update incidence status');
  }
}
