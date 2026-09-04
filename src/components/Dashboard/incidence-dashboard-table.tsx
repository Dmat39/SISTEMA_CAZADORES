import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllIncidencesApi } from '@/api/operador/incidenceApi.tsx';
import CustomTablePagination from '@/components/Pagination/TablePagination';
import FilterCrimer from '@/components/Supervisors/FilterCrimer';
import StatusFilter from '@/components/Supervisors/StatusFilter';
import { AlertCircle, Search, ShieldAlert } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  previous: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  process: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  completed: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
};

const STATUS_LABEL: Record<string, string> = {
  previous: 'En Proceso',
  process: 'En Proceso',
  completed: 'Completado',
};

const FONT = {
  heading: "'Montserrat', sans-serif",
  body: "'DM Sans', sans-serif",
} as const;

export function IncidenceDashboardTable() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const searchParams = new URLSearchParams(location.search);
  const start = searchParams.get('start') || '';
  const end = searchParams.get('end') || '';
  const crimeIds = searchParams.getAll('crimeIds') || [];
  const selectedStatus = searchParams.get('status') || '';

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (start) params.start = start;
      if (end) params.end = end;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (crimeIds.length > 0) params.crimeIds = crimeIds;
      if (selectedStatus) params.status = selectedStatus;

      const response = await getAllIncidencesApi(params);
      setIncidents(response.data.data || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching incidences for dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchIncidents, searchTerm ? 500 : 0);
    return () => clearTimeout(timer);
  }, [page, limit, start, end, searchTerm, JSON.stringify(crimeIds), selectedStatus]);

  // Reset to page 1 when search or dates change
  useEffect(() => {
    setPage(1);
  }, [start, end, searchTerm, JSON.stringify(crimeIds), selectedStatus]);

  const handlePageLimitChange = (newPage: number, newLimit: number) => {
    if (newLimit !== limit) {
      setLimit(newLimit);
      setPage(1);
    } else {
      setPage(newPage);
    }
  };

  const truncate = (v: any, n = 50) => 
    typeof v === 'string' && v.length > n ? v.slice(0, n) + '...' : (v || '—');

  return (
    <div
      className="animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-both
                 bg-[#fdfbf5] dark:bg-[#111827] shadow-sm rounded-2xl
                 border border-[#e8dfc8] dark:border-white/10 overflow-hidden mt-6"
      style={{ animationDuration: '500ms', animationDelay: '500ms' }}
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 px-5 py-5 border-b border-[#e8dfc8] dark:border-white/10">
        <div>
          <h3
            className="text-lg font-bold text-[#3d2f1f] dark:text-white flex items-center gap-2"
            style={{ fontFamily: FONT.heading }}
          >
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            Últimas Incidencias
          </h3>
          <p
            className="text-xs text-[#7a6a52] dark:text-gray-400 mt-1"
            style={{ fontFamily: FONT.body }}
          >
            Listado de incidencias agrupadas por tipología y su estado
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white dark:bg-transparent rounded-lg">
            <FilterCrimer />
          </div>
          <div className="bg-white dark:bg-transparent rounded-lg">
            <StatusFilter />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a89878] pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar incidencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 pr-8 w-56 sm:w-64 bg-white dark:bg-[#1e293b] border border-[#e8dfc8] dark:border-white/10 rounded-lg text-sm text-[#3d2f1f] dark:text-white placeholder-[#7a6a52] dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all shadow-sm"
              style={{ fontFamily: FONT.body }}
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a89878] hover:text-[#7a6a52] dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto" style={{ fontFamily: FONT.body }}>
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#e8dfc8] dark:border-white/10 bg-[#fdfbf5] dark:bg-[#1e293b]/50">
              <th className="px-5 py-4 text-left text-[11px] font-bold text-[#7a6a52] dark:text-gray-400 uppercase tracking-widest w-[20%]">
                Tipología (Crimen)
              </th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-[#7a6a52] dark:text-gray-400 uppercase tracking-widest w-[45%]">
                Nombre de Incidencia
              </th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-[#7a6a52] dark:text-gray-400 uppercase tracking-widest w-[15%]">
                Creado por
              </th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-[#7a6a52] dark:text-gray-400 uppercase tracking-widest w-[20%]">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8dfc8] dark:divide-white/5">
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-white/50 dark:bg-transparent">
                  <td className="px-5 py-4"><div className="h-4 w-32 bg-[#f0e6d0] dark:bg-white/10 rounded" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-64 bg-[#f0e6d0] dark:bg-white/10 rounded" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-24 bg-[#f0e6d0] dark:bg-white/10 rounded" /></td>
                  <td className="px-5 py-4"><div className="h-6 w-24 bg-[#f0e6d0] dark:bg-white/10 rounded-full" /></td>
                </tr>
              ))
            ) : incidents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[#f0e6d0] dark:bg-white/5 flex items-center justify-center">
                      {searchTerm || crimeIds.length > 0 || selectedStatus ? (
                        <Search className="h-5 w-5 text-[#a89878] dark:text-gray-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-[#a89878] dark:text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#3d2f1f] dark:text-gray-300">
                        {searchTerm || crimeIds.length > 0 || selectedStatus ? 'Sin resultados' : 'Sin datos'}
                      </p>
                      <p className="text-xs text-[#7a6a52] dark:text-gray-500 mt-1">
                        {searchTerm || crimeIds.length > 0 || selectedStatus
                          ? 'No se encontraron incidencias con los filtros actuales'
                          : 'No hay incidencias registradas en este periodo'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              incidents.map((item) => (
                <tr key={item.id} className="group hover:bg-orange-50/50 dark:hover:bg-orange-500/[0.04] transition-all duration-200">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[13px] font-bold text-[#3d2f1f] dark:text-gray-200">
                        {item.crime?.name ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] text-[#3d2f1f] dark:text-gray-400 font-medium leading-relaxed">
                      {truncate(item.name, 70)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] font-medium text-[#7a6a52] dark:text-gray-400">
                      {item.user?.deletedAt ? <del className="opacity-60">{item.user.username}</del> : (item.user?.username || '—')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      STATUS_BADGE[item.status] || 'bg-[#f0e6d0] text-[#7a6a52] dark:bg-white/10 dark:text-gray-400'
                    }`}>
                      {STATUS_LABEL[item.status] || item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end px-5 py-4 border-t border-[#e8dfc8] dark:border-white/10 bg-[#fdfbf5] dark:bg-[#1e293b]/30" style={{ fontFamily: FONT.body }}>
        {totalCount > 0 && (
          <CustomTablePagination
            count={totalCount}
            page={page}
            limit={limit}
            handlePageLimitChange={handlePageLimitChange}
          />
        )}
      </div>
    </div>
  );
}
