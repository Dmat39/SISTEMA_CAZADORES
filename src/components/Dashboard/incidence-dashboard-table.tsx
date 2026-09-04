import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllIncidencesApi } from '@/api/operador/incidenceApi.tsx';
import CustomTablePagination from '@/components/Pagination/TablePagination';
import { AlertCircle, Search } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  previous: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  process: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
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

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (start) params.start = start;
      if (end) params.end = end;
      if (searchTerm.trim()) params.search = searchTerm.trim();

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
  }, [page, limit, start, end, searchTerm]);

  // Reset to page 1 when search or dates change
  useEffect(() => {
    setPage(1);
  }, [start, end, searchTerm]);

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
                 border border-[#e8dfc8] dark:border-white/10 overflow-hidden"
      style={{ animationDuration: '500ms', animationDelay: '500ms' }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-[#e8dfc8] dark:border-white/10">
        <div>
          <h3
            className="text-base font-bold text-[#3d2f1f] dark:text-white"
            style={{ fontFamily: FONT.heading }}
          >
            Últimas Incidencias
          </h3>
          <p
            className="text-xs text-[#7a6a52] dark:text-gray-400 mt-0.5"
            style={{ fontFamily: FONT.body }}
          >
            Listado de incidencias agrupadas por tipología y su estado
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#a89878] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar incidencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-[34px] pl-8 pr-7 w-48 sm:w-64 bg-[#fdfbf5] dark:bg-white/10 border border-[#e8dfc8] dark:border-gray-700 rounded-lg text-sm text-[#7a6a52] dark:text-gray-200 placeholder-[#a89878] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
            style={{ fontFamily: FONT.body }}
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a89878] hover:text-[#7a6a52] dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto" style={{ fontFamily: FONT.body }}>
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#e8dfc8] dark:border-white/10">
              <th className="px-4 py-3.5 text-left text-[10px] font-bold text-[#7a6a52] dark:text-gray-400 uppercase tracking-[0.1em]">
                Tipología (Crimen)
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-bold text-[#7a6a52] dark:text-gray-400 uppercase tracking-[0.1em]">
                Nombre de Incidencia
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-bold text-[#7a6a52] dark:text-gray-400 uppercase tracking-[0.1em]">
                Creado por
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-bold text-[#7a6a52] dark:text-gray-400 uppercase tracking-[0.1em]">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8dfc8] dark:divide-gray-800/40">
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3.5"><div className="h-4 w-24 bg-[#f0e6d0] dark:bg-white/10 rounded" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 w-48 bg-[#f0e6d0] dark:bg-white/10 rounded" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 w-20 bg-[#f0e6d0] dark:bg-white/10 rounded" /></td>
                  <td className="px-4 py-3.5"><div className="h-5 w-16 bg-[#f0e6d0] dark:bg-white/10 rounded-full" /></td>
                </tr>
              ))
            ) : incidents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[#f0e6d0] dark:bg-white/10 flex items-center justify-center">
                      {searchTerm ? (
                        <Search className="h-5 w-5 text-[#a89878] dark:text-gray-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-[#a89878] dark:text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#a89878] dark:text-gray-400">
                        {searchTerm ? 'Sin resultados' : 'Sin datos'}
                      </p>
                      <p className="text-xs text-[#7a6a52] dark:text-gray-400 mt-0.5">
                        {searchTerm
                          ? `No se encontraron incidencias para "${searchTerm}"`
                          : 'No hay incidencias registradas en este periodo'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              incidents.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50/40 dark:hover:bg-orange-500/[0.03] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-semibold text-[#3d2f1f] dark:text-gray-200">
                      {item.crime?.name ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#3d2f1f] dark:text-gray-300">
                      {truncate(item.name, 60)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#7a6a52] dark:text-gray-400">
                      {item.user?.deletedAt ? <del>{item.user.username}</del> : (item.user?.username || '—')}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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

      <div className="flex items-center justify-end px-5 py-3 border-t border-[#e8dfc8] dark:border-white/10" style={{ fontFamily: FONT.body }}>
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
