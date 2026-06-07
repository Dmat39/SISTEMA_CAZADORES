import { mainApi } from '@/api/config';

export const getAuditLogsApi = (params: { page?: number; limit?: number } = {}) =>
  mainApi.get('/audit/all', { params });
