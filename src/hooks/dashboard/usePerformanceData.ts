import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dashboardData } from '@/api/dashboard/DashboardApi';

export interface PerformancePerson {
  id: number | string;
  nombre: string;
  tipo: 'Cazador';
  asignadas: number;
  resueltas: number;
  conversion: string | number;
  avatar: string;
  dni: string;
  phone: string;
}

export interface GeneralData {
  totalIncidencias: number;
  incidenciasEnProceso: number;
  incidenciasCompletadas: number;
  totalCazadores: number;
}

const getDefaultDateRange = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const startDate = new Date(yesterday);
  startDate.setDate(yesterday.getDate() - 29);
  return {
    start: startDate.toISOString().split('T')[0],
    end: yesterday.toISOString().split('T')[0],
  };
};

const mapUser = (user: any): PerformancePerson => ({
  id: user.id,
  nombre: `${user.name} ${user.lastname}`,
  tipo: 'Cazador',
  asignadas: user.asigned,
  resueltas: user.finished,
  conversion: user.asigned > 0 ? ((user.finished / user.asigned) * 100).toFixed(1) : 0,
  avatar: `${user.name.charAt(0)}${user.lastname.charAt(0)}`,
  dni: user.dni,
  phone: user.phone,
});

export function usePerformanceData() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentPage = parseInt(searchParams.get('page') ?? '1') || 1;
  const limit = parseInt(searchParams.get('limit') ?? '10') || 10;

  const defaultDates = getDefaultDateRange();
  const generalStartDate = searchParams.get('start') || defaultDates.start;
  const generalEndDate = searchParams.get('end') || defaultDates.end;

  const [personalData, setPersonalData] = useState<PerformancePerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showTop3, setShowTop3] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('resueltas');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [generalData, setGeneralData] = useState<GeneralData>({
    totalIncidencias: 0,
    incidenciasEnProceso: 0,
    incidenciasCompletadas: 0,
    totalCazadores: 0,
  });
  const [loadingGeneral, setLoadingGeneral] = useState(false);

  const loadGeneralData = useCallback(async () => {
    setLoadingGeneral(true);
    try {
      const response = await dashboardData({ start: generalStartDate, end: generalEndDate });
      if (response.data.status) {
        const d = response.data.data.general;
        setGeneralData({
          totalIncidencias: d.total || 0,
          incidenciasEnProceso: d.process || 0,
          incidenciasCompletadas: d.completed || 0,
          totalCazadores: d.hunters || 0,
        });
      }
    } catch (error) {
      console.error('Error loading general data:', error);
    } finally {
      setLoadingGeneral(false);
    }
  }, [generalStartDate, generalEndDate]);

  const loadPerformanceData = useCallback(async (top3Mode: boolean) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        start: generalStartDate,
        end: generalEndDate,
        userType: 'hunter',
        limit: 10,
        page: 0,
      };

      if (!top3Mode && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await dashboardData(params);
      if (response.data.status) {
        const perf = response.data.data.performance;
        const mapped: PerformancePerson[] = perf.data.map(mapUser);

        if (top3Mode) {
          const top3 = [...mapped]
            .sort((a, b) =>
              b.resueltas !== a.resueltas
                ? b.resueltas - a.resueltas
                : b.asignadas - a.asignadas
            )
            .slice(0, 3);
          setPersonalData(top3);
          setTotalPages(1);
          setTotalCount(3);
        } else {
          setPersonalData(mapped);
          setTotalCount(mapped.length);
          setTotalPages(Math.ceil(mapped.length / limit));
        }
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  }, [generalStartDate, generalEndDate, limit, searchTerm]);

  useEffect(() => {
    loadGeneralData();
  }, [loadGeneralData]);

  useEffect(() => {
    if (showTop3) return;
    const timer = setTimeout(
      () => loadPerformanceData(false),
      searchTerm ? 500 : 0
    );
    return () => clearTimeout(timer);
  }, [loadPerformanceData, showTop3, searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const sp = new URLSearchParams(location.search);
      sp.set('page', '1');
      navigate({ search: sp.toString() });
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // rerender-memo: memoize expensive sort to avoid recalculation on every render
  const sortedPersonalData = useMemo(() =>
    [...personalData].sort((a, b) => {
      const aVal = a[sortField as keyof PerformancePerson];
      const bVal = b[sortField as keyof PerformancePerson];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc'
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    }),
    [personalData, sortField, sortDirection]
  );

  const paginatedPersonalData = useMemo(() => {
    if (showTop3) return sortedPersonalData;
    const startIndex = (currentPage - 1) * limit;
    return sortedPersonalData.slice(startIndex, startIndex + limit);
  }, [sortedPersonalData, currentPage, limit, showTop3]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTop3Toggle = () => {
    if (showTop3) {
      setShowTop3(false);
      setSearchTerm('');
    } else {
      setShowTop3(true);
      setSearchTerm('');
      loadPerformanceData(true);
    }
  };

  const handlePageLimitChange = (newPage: number, newLimit: number) => {
    const sp = new URLSearchParams(location.search);
    if (newLimit !== limit) {
      sp.set('limit', newLimit.toString());
      sp.set('page', '1');
    } else {
      sp.set('page', newPage.toString());
    }
    navigate({ search: sp.toString() });
  };

  return {
    personalData,
    loading,
    totalPages,
    totalCount,
    showTop3,
    generalData,
    loadingGeneral,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    sortedPersonalData: paginatedPersonalData,
    handleSort,
    handleTop3Toggle,
    handlePageLimitChange,
    currentPage,
    limit,
    generalStartDate,
    generalEndDate,
  };
}
