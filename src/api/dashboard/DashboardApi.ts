import { mainApi } from '@/api/config';

interface DashboardParams {
  start?: string;
  end?: string;
  userType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const dashboardData = (params: DashboardParams = {}) => {
  return mainApi.get('/dashboard', { params });
};

export const incidenceChart = () => mainApi.get('/dashboard/incidence-chart');

export const incidenceStatistics = (params: DashboardParams = {}) => {
  return mainApi.get('/incidence/statistics', { params });
};

export const incidenceGeneral = (params: Pick<DashboardParams, 'start' | 'end'> = {}) => {
  return mainApi.get('/incidence/general', { params });
};
