import { incidenceApi } from '../config';

export const getSerenoByDniApi = async (dni) => {
  try {
    const response = await incidenceApi.get(`/serenos/buscar-dni/${dni}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error al buscar sereno');
  }
};
