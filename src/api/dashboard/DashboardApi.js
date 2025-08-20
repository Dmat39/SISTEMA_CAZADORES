import { mainApi } from "../config"

// Endpoint no disponible - comentado temporalmente
// export const countSummary = () => mainApi.get('/dashboard/count-summary');

export const incidenceChart = () => mainApi.get('/dashboard/incidence-chart');

// Nueva función para el endpoint dashboard principal
export const dashboardData = (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.start) queryParams.append('start', params.start);
    if (params.end) queryParams.append('end', params.end);
    if (params.userType) queryParams.append('userType', params.userType);
    if (params.search) queryParams.append('search', params.search);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = queryString ? `/dashboard?${queryString}` : '/dashboard';

    return mainApi.get(url);
};

export const incidenceStatistics = (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.start) queryParams.append('start', params.start);
    if (params.userType) queryParams.append('userType', params.userType);

    const queryString = queryParams.toString();
    const url = queryString ? `/incidence/statistics?${queryString}` : '/incidence/statistics';

    return mainApi.get(url);
};

export const incidenceGeneral = (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.start) queryParams.append('start', params.start);
    if (params.end) queryParams.append('end', params.end);

    const queryString = queryParams.toString();
    const url = queryString ? `/incidence/general?${queryString}` : '/incidence/general';

    return mainApi.get(url);
};