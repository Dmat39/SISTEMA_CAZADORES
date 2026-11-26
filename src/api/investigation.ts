import { mainApi } from './config';

export const consultInvestigationDniApi = async (dni: string) => {
  try {
    const response = await mainApi.post('/investigation/dni', { dni });
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : new Error('No se pudo consultar el DNI');
  }
};

export const consultInvestigationPlateApi = async (plate: string) => {
  try {
    const response = await mainApi.post('/investigation/plate', { plate });
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : new Error('No se pudo consultar la placa');
  }
};
