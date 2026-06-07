import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAllIncidencesAuditApi } from '@/api/auditoria/AuditoriaApi';

export interface AuditIncidence {
  id: string;
  code: string | null;
  name: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  crime: { id: string; name: string };
  zone: { id: string; name: string };
  user: {
    id: string;
    name: string;
    lastname: string;
    username: string;
  };
}

export function useAuditoriaIncidencias() {
  const [incidences, setIncidences] = useState<AuditIncidence[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getAllIncidencesAuditApi({ page: currentPage, limit });
        if (!cancelled && res.data.status) {
          setIncidences(res.data.data.data ?? []);
          setTotalCount(res.data.data.totalCount ?? 0);
        }
      } catch (err: any) {
        if (!cancelled) toast.error(`Error al cargar incidencias: ${err.message}`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [currentPage, limit]);

  const handlePageLimitChange = (newPage: number, newLimit: number) => {
    if (newLimit !== limit) { setLimit(newLimit); setCurrentPage(1); }
    else { setCurrentPage(newPage); }
  };

  return { incidences, totalCount, isLoading, currentPage, limit, handlePageLimitChange };
}
