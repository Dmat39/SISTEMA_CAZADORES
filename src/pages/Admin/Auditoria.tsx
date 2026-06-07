import { ClipboardList, RefreshCw } from 'lucide-react';
import { useSetPageTitle } from '@/contexts/PageTitleContext';
import Loading from '@/components/Loading';
import CustomTablePagination from '@/components/Pagination/TablePagination';
import { useAuditoria } from '@/hooks/auditoria/useAuditoria';

const MODULE_COLOR: Record<string, string> = {
  'Incidencias':    'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'Registros':      'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
  'Autenticación':  'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
};

const ACTION_COLOR: Record<string, string> = {
  'CREAR':           'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  'ACTUALIZAR':      'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'ELIMINAR':        'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  'INICIAR_SESION':  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
};

const ACTION_LABEL: Record<string, string> = {
  'CREAR':          'Crear',
  'ACTUALIZAR':     'Actualizar',
  'ELIMINAR':       'Eliminar',
  'INICIAR_SESION': 'Inicio de sesión',
};

const ROLE_LABEL: Record<string, string> = {
  administrator: 'Administrador',
  supervisor:    'Supervisor',
  hunter:        'Cazador',
  operator:      'Operador',
  visualizer:    'Visualizador',
};

const ROLE_COLOR: Record<string, string> = {
  administrator: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  supervisor:    'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  hunter:        'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
  operator:      'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400',
  visualizer:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
};

const FIELD_LABEL: Record<string, string> = {
  status:        'Estado',
  description:   'Descripción',
  observation:   'Observación',
  plate:         'Placa',
  name:          'Nombre',
  code:          'Código',
  date:          'Fecha',
  latitude:      'Latitud',
  longitude:     'Longitud',
  communication: 'Medio',
  crime:         'Crimen',
  zone:          'Zona',
  camera:        'Cámara',
  cazador:       'Cazador asignado',
};

const STATUS_LABEL: Record<string, string> = {
  previous:  'Previo',
  process:   'En proceso',
  completed: 'Completado',
  finished:  'Finalizado',
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function translateValue(field: string | null, val: string | null) {
  if (!val) return '—';
  if (field === 'status') return STATUS_LABEL[val] ?? val;
  if (field === 'date') {
    const d = new Date(val);
    if (!isNaN(d.getTime()))
      return d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return val;
}

const HEADERS = ['Fecha', 'Usuario', 'Módulo', 'Acción', 'Afectado', 'Campo', 'Valor anterior', 'Valor nuevo'];

export default function Auditoria() {
  useSetPageTitle('Auditoría', 'Registro de actividad del sistema');
  const { logs, totalCount, isLoading, currentPage, limit, handlePageLimitChange, refresh } = useAuditoria();

  return (
    <div className="p-2 sm:p-4 h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex-1 min-h-0 rounded-xl bg-slate-50 dark:bg-[#111827] shadow border border-gray-200 dark:border-white/10 p-4 sm:p-6 flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Registro de actividad</h2>
            {!isLoading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {totalCount} {totalCount === 1 ? 'evento' : 'eventos'} registrados
              </p>
            )}
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            title="Actualizar"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {isLoading && <Loading message="Cargando auditoría" />}

        {!isLoading && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Sin actividad registrada</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Los eventos del sistema aparecerán aquí al realizarse acciones
            </p>
          </div>
        )}

        {!isLoading && logs.length > 0 && (
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-gray-200 dark:border-white/8">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-white/8">
                <thead className="bg-gray-100 dark:bg-[#1e293b] sticky top-0">
                  <tr>
                    {HEADERS.map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-slate-50 dark:bg-[#111827] divide-y divide-gray-100 dark:divide-white/5">
                  {logs.map((log, idx) => (
                    <tr key={log.id ?? idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">

                      {/* Fecha */}
                      <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {fmt(log.createdAt)}
                      </td>

                      {/* Usuario */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {log.user?.name} {log.user?.lastname}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${ROLE_COLOR[log.user?.role] ?? 'bg-gray-100 text-gray-600'}`}>
                          {ROLE_LABEL[log.user?.role] ?? log.user?.role}
                        </span>
                      </td>

                      {/* Módulo */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${MODULE_COLOR[log.module] ?? 'bg-gray-100 text-gray-600'}`}>
                          {log.module}
                        </span>
                      </td>

                      {/* Acción */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${ACTION_COLOR[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                          {ACTION_LABEL[log.action] ?? log.action}
                        </span>
                      </td>

                      {/* Afectado */}
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[140px]">
                        <span className="truncate block">{log.targetName ?? '—'}</span>
                      </td>

                      {/* Campo */}
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {log.field ? (FIELD_LABEL[log.field] ?? log.field) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>

                      {/* Valor anterior */}
                      <td className="px-4 py-3 max-w-[130px]">
                        {log.oldValue
                          ? <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded font-mono">
                              {translateValue(log.field, log.oldValue)}
                            </span>
                          : <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
                        }
                      </td>

                      {/* Valor nuevo */}
                      <td className="px-4 py-3 max-w-[130px]">
                        {log.newValue
                          ? <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded font-mono">
                              {translateValue(log.field, log.newValue)}
                            </span>
                          : <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
                        }
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center">
              <CustomTablePagination
                count={totalCount}
                page={currentPage}
                limit={limit}
                handlePageLimitChange={handlePageLimitChange}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
