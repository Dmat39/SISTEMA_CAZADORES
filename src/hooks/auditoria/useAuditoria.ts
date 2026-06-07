import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getAuditLogsApi } from '@/api/auditoria/AuditoriaApi';

export interface AuditLog {
  id: string;
  module: string;
  action: string;
  targetId: string | null;
  targetName: string | null;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    lastname: string;
    username: string;
    role: string;
  };
}

export function useAuditoria() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getAuditLogsApi({ page: currentPage, limit });
        if (!cancelled && res.data.status) {
          setLogs(res.data.data.data ?? []);
          setTotalCount(res.data.data.totalCount ?? 0);
        }
      } catch (err: any) {
        if (!cancelled) toast.error(`Error al cargar auditoría: ${err.message}`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [currentPage, limit, refreshKey]);

  const handlePageLimitChange = (newPage: number, newLimit: number) => {
    if (newLimit !== limit) { setLimit(newLimit); setCurrentPage(1); }
    else { setCurrentPage(newPage); }
  };

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { logs, totalCount, isLoading, currentPage, limit, handlePageLimitChange, refresh };
}
