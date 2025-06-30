import { mainApi } from "../config"

export const countSummary=()=>mainApi.get('/dashboard/count-summary');

export const incidenceChart=()=>mainApi.get('/dashboard/incidence-chart');