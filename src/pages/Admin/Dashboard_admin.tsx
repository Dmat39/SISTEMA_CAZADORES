import { memo, useMemo, Fragment } from 'react';
import { useSetPageTitle } from '@/contexts/PageTitleContext';
import {
  AlertTriangle, CheckCircle, Shield,
  Search, ArrowUpIcon, ArrowDownIcon, Activity,
  Trophy, Crown, Zap,
} from 'lucide-react';
import DateRangeFilter from '@/components/Supervisors/DateRangeFilter';
import CustomTablePagination from '@/components/Pagination/TablePagination';
import { IncidentChartToggle } from '@/components/Dashboard/incident-chart-toggle';
import { CrimeRadarDashboard } from '@/components/Dashboard/crime-radar-dashboard';
import { IncidenceDashboardTable } from '@/components/Dashboard/incidence-dashboard-table';
import { usePerformanceData, type GeneralData } from '@/hooks/dashboard/usePerformanceData';

// ─── Fonts (inline-only, no CSS) ──────────────────────────────────────────────
const FONT = {
  numbers: "'Montserrat', sans-serif",
  heading: "'Montserrat', sans-serif",
  body: "'DM Sans', sans-serif",
} as const;

// ─── KPI tile config ──────────────────────────────────────────────────────────

interface TileConfig {
  key: keyof GeneralData;
  label: string;
  icon: React.ElementType;
  bg: string;
  darkBg: string;
  text: string;
  darkText: string;
  muted: string;
  darkMuted: string;
  iconTint: string;
  darkIconTint: string;
}

const TILES: TileConfig[] = [
  {
    key: 'totalIncidencias', label: 'Total Incidencias', icon: AlertTriangle,
    bg: 'bg-blue-50', darkBg: 'dark:bg-blue-950/30',
    text: 'text-blue-700', darkText: 'dark:text-blue-300',
    muted: 'text-blue-500/60', darkMuted: 'dark:text-blue-400/50',
    iconTint: 'text-blue-200', darkIconTint: 'dark:text-blue-800/40',
  },
  {
    key: 'incidenciasEnProceso', label: 'En Proceso', icon: Activity,
    bg: 'bg-amber-50', darkBg: 'dark:bg-amber-950/30',
    text: 'text-amber-700', darkText: 'dark:text-amber-300',
    muted: 'text-amber-500/60', darkMuted: 'dark:text-amber-400/50',
    iconTint: 'text-amber-200', darkIconTint: 'dark:text-amber-800/40',
  },
  {
    key: 'incidenciasCompletadas', label: 'Finalizadas', icon: CheckCircle,
    bg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-950/30',
    text: 'text-emerald-700', darkText: 'dark:text-emerald-300',
    muted: 'text-emerald-500/60', darkMuted: 'dark:text-emerald-400/50',
    iconTint: 'text-emerald-200', darkIconTint: 'dark:text-emerald-800/40',
  },
  {
    key: 'totalCazadores', label: 'Cazadores', icon: Shield,
    bg: 'bg-orange-50', darkBg: 'dark:bg-orange-950/30',
    text: 'text-orange-700', darkText: 'dark:text-orange-300',
    muted: 'text-orange-500/60', darkMuted: 'dark:text-orange-400/50',
    iconTint: 'text-orange-200', darkIconTint: 'dark:text-orange-800/40',
  },
];

// ─── Metric Tile ──────────────────────────────────────────────────────────────

interface MetricTileProps {
  config: TileConfig;
  value: number;
  loading: boolean;
  delay: number;
}

const MetricTile = memo(function MetricTile({ config, value, loading, delay }: MetricTileProps) {
  const Icon = config.icon;
  return (
    <div
      className={`animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both ${config.bg} ${config.darkBg} rounded-2xl relative overflow-hidden transition-transform duration-200 hover:scale-[1.02]`}
      style={{ animationDuration: '500ms', animationDelay: `${delay}ms` }}
    >
      {/* Decorative watermark icon */}
      <Icon
        className={`absolute -right-2 -bottom-2 h-12 w-12 ${config.iconTint} ${config.darkIconTint} rotate-12 pointer-events-none`}
        strokeWidth={1}
      />

      <div className="relative z-10 px-5 py-4">
        {loading ? (
          <div className="space-y-2.5 animate-pulse">
            <div className={`h-9 w-16 rounded-lg ${config.bg} ${config.darkBg} opacity-60`} />
            <div className={`h-3 w-24 rounded ${config.bg} ${config.darkBg} opacity-40`} />
          </div>
        ) : (
          <>
            <p
              className={`text-3xl font-extrabold leading-none tabular-nums ${config.text} ${config.darkText}`}
              style={{ fontFamily: FONT.numbers }}
            >
              {value.toLocaleString()}
            </p>
            <p
              className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${config.muted} ${config.darkMuted}`}
              style={{ fontFamily: FONT.body }}
            >
              {config.label}
            </p>
          </>
        )}
      </div>
    </div>
  );
});

// ─── Sort Header ──────────────────────────────────────────────────────────────

interface SortHeaderProps {
  field: string;
  label: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (f: string) => void;
  align?: 'left' | 'right';
}

const SortHeader = memo(function SortHeader({
  field, label, sortField, sortDirection, onSort, align = 'left',
}: SortHeaderProps) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`
        px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.1em] cursor-pointer select-none transition-colors
        ${active
          ? 'text-orange-600 dark:text-orange-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
        }
      `}
      style={{ textAlign: align, fontFamily: FONT.body }}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {label}
        {active ? (
          sortDirection === 'asc'
            ? <ArrowUpIcon className="h-3 w-3" />
            : <ArrowDownIcon className="h-3 w-3" />
        ) : null}
      </span>
    </th>
  );
});

// ─── Conversion tiers ─────────────────────────────────────────────────────────

const CONV_TIERS = [
  { min: 80, bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { min: 40, bar: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400' },
  { min: 0,  bar: 'bg-red-500',     text: 'text-red-500 dark:text-red-400' },
] as const;

function getConvTier(conv: number) {
  for (const tier of CONV_TIERS) {
    if (conv >= tier.min) return tier;
  }
  return CONV_TIERS[2];
}

// ─── Medal styling for Top 3 ─────────────────────────────────────────────────

const MEDALS = [
  { bg: 'bg-amber-400', text: 'text-amber-950' },
  { bg: 'bg-gray-300 dark:bg-gray-500', text: 'text-gray-800 dark:text-gray-100' },
  { bg: 'bg-orange-300', text: 'text-orange-950' },
] as const;

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardAdmin() {
  useSetPageTitle('Métricas de Incidencias', 'Monitoreo · Cazadores', true);

  const {
    loading, totalCount, showTop3,
    generalData, loadingGeneral,
    searchTerm, setSearchTerm,
    sortField, sortDirection, sortedPersonalData,
    handleSort, handleTop3Toggle, handlePageLimitChange,
    currentPage, limit,
  } = usePerformanceData();

  // rerender-memo: compute conversion tiers once when data changes
  const tableRows = useMemo(
    () => sortedPersonalData.map((person) => {
      const conv = Number(person.conversion);
      return { person, conv, tier: getConvTier(conv) };
    }),
    [sortedPersonalData]
  );

  // rerender-memo: resolution progress bar
  const resolution = useMemo(() => {
    const total = generalData.totalIncidencias || 1;
    const inProcess = Math.round((generalData.incidenciasEnProceso / total) * 100);
    const completed = Math.round((generalData.incidenciasCompletadas / total) * 100);
    return { inProcess, completed, total: generalData.totalIncidencias };
  }, [generalData.totalIncidencias, generalData.incidenciasEnProceso, generalData.incidenciasCompletadas]);

  return (
    <div className="min-h-full bg-[#f7f2e7] dark:bg-[#0a0f1e] transition-colors duration-200">
      <div className="px-4 py-3 sm:px-5 lg:px-5 space-y-4">

        {/* ── Stats bar + Date filter ──────────────────────────────── */}
        <div
          className="animate-in fade-in-0 fill-mode-both flex items-center gap-4 bg-[#fdfbf5] dark:bg-[#111827] shadow-sm rounded-xl border border-[#e8dfc8] dark:border-white/10 px-5 py-4"
          style={{ animationDuration: '400ms', fontFamily: FONT.body }}
        >
          {/* Inline stats — spread evenly */}
          <div className="flex items-center flex-1 overflow-x-auto">
            {TILES.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <Fragment key={tile.key}>
                  {i > 0 && <div className="h-10 w-px bg-[#e8dfc8] dark:bg-white/8 shrink-0" />}
                  <div className="flex items-center justify-center gap-3 flex-1 py-1">
                    <div className={`p-2 rounded-xl ${tile.bg} ${tile.darkBg}`}>
                      <Icon className={`h-5 w-5 ${tile.text} ${tile.darkText}`} strokeWidth={2} />
                    </div>
                    {loadingGeneral ? (
                      <div className="animate-pulse space-y-1.5">
                        <div className="h-6 w-10 rounded bg-[#f0e6d0] dark:bg-white/10" />
                        <div className="h-2.5 w-16 rounded bg-[#f0e6d0] dark:bg-white/5" />
                      </div>
                    ) : (
                      <div>
                        <p
                          className={`text-2xl font-extrabold leading-none tabular-nums ${tile.text} ${tile.darkText}`}
                          style={{ fontFamily: FONT.numbers }}
                        >
                          {generalData[tile.key].toLocaleString()}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7a6a52] dark:text-gray-400 mt-1">
                          {tile.label}
                        </p>
                      </div>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>

          {/* Date filter — pinned right */}
          <div className="shrink-0">
            <DateRangeFilter />
          </div>
        </div>

        {/* ── Resolution Bar ───────────────────────────────────────── */}
        {!loadingGeneral && resolution.total > 0 ? (
          <div
            className="flex items-center gap-4 px-4 py-2 bg-[#fdfbf5] dark:bg-[#111827] shadow-sm rounded-xl border border-[#e8dfc8] dark:border-white/10"
            style={{ fontFamily: FONT.body }}
          >
            <Zap className="h-4 w-4 text-orange-500 shrink-0" strokeWidth={2.5} />
            <div className="flex-1 h-2 rounded-full bg-[#f0e6d0] dark:bg-white/10 overflow-hidden flex">
              <div
                className="h-full bg-amber-400 dark:bg-amber-500 transition-all duration-700"
                style={{ width: `${resolution.inProcess}%` }}
              />
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${resolution.completed}%` }}
              />
            </div>
            <div
              className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-[#7a6a52] dark:text-gray-400 shrink-0"
            >
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500 inline-block" />
                Proceso
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                Finalizadas
              </span>
              <span className="hidden sm:inline text-[#7a6a52] dark:text-gray-500">
                {resolution.completed}% resuelto
              </span>
            </div>
          </div>
        ) : null}

        {/* ── Charts ───────────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-7 items-stretch">
          <div className="lg:col-span-4 h-full">
            <IncidentChartToggle />
          </div>
          <div className="lg:col-span-3 h-full">
            <CrimeRadarDashboard />
          </div>
        </div>

        {/* ── Performance Table ─────────────────────────────────────── */}
        <div
          className="animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-both
                     bg-[#fdfbf5] dark:bg-[#111827] shadow-sm rounded-2xl
                     border border-[#e8dfc8] dark:border-white/10 overflow-hidden"
          style={{ animationDuration: '500ms', animationDelay: '400ms' }}
        >
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-[#e8dfc8] dark:border-white/10">
            <div>
              <h3
                className="text-base font-bold text-[#3d2f1f] dark:text-white"
                style={{ fontFamily: FONT.heading }}
              >
                {showTop3 ? 'Top 3 Cazadores' : 'Rendimiento Individual'}
              </h3>
              <p
                className="text-xs text-[#7a6a52] dark:text-gray-400 mt-0.5"
                style={{ fontFamily: FONT.body }}
              >
                {showTop3
                  ? 'Mayor cantidad de incidencias resueltas'
                  : 'Detalle por cazador en el periodo seleccionado'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTop3Toggle}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
                  transition-all duration-200
                  ${showTop3
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-[#f0e6d0] dark:bg-white/10 text-[#7a6a52] dark:text-gray-300 hover:bg-[#e8dfc8] dark:hover:bg-gray-700'
                  }
                `}
                style={{ fontFamily: FONT.body }}
              >
                <Trophy className="h-3.5 w-3.5" />
                {showTop3 ? 'Ver todos' : 'Top 3'}
              </button>

              {!showTop3 ? (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#a89878] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar cazador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-[34px] pl-8 pr-7 w-48 bg-[#fdfbf5] dark:bg-white/10 border border-[#e8dfc8] dark:border-gray-700 rounded-lg text-sm text-[#7a6a52] dark:text-gray-200 placeholder-[#a89878] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
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
              ) : null}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto" style={{ fontFamily: FONT.body }}>
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#e8dfc8] dark:border-white/10">
                  <th
                    className="px-4 py-3.5 text-left text-[10px] font-bold text-[#7a6a52] dark:text-gray-400 uppercase tracking-[0.1em]"
                    style={{ fontFamily: FONT.body }}
                  >
                    Persona
                  </th>
                  <SortHeader field="tipo"       label="Tipo"       sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                  <SortHeader field="asignadas"  label="Asignadas"  sortField={sortField} sortDirection={sortDirection} onSort={handleSort} align="right" />
                  <SortHeader field="resueltas"  label="Resueltas"  sortField={sortField} sortDirection={sortDirection} onSort={handleSort} align="right" />
                  <SortHeader field="conversion" label="Conversi&oacute;n" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} align="right" />
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e8dfc8] dark:divide-gray-800/40">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#f0e6d0] dark:bg-white/10 shrink-0" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-28 bg-[#f0e6d0] dark:bg-white/10 rounded" />
                            <div className="h-2.5 w-16 bg-[#f0e6d0] dark:bg-white/10/60 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><div className="h-5 w-16 bg-[#f0e6d0] dark:bg-white/10 rounded-lg" /></td>
                      <td className="px-4 py-3.5 text-right"><div className="h-4 w-8 bg-[#f0e6d0] dark:bg-white/10 rounded ml-auto" /></td>
                      <td className="px-4 py-3.5 text-right"><div className="h-4 w-8 bg-[#f0e6d0] dark:bg-white/10 rounded ml-auto" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 w-20 bg-[#f0e6d0] dark:bg-white/10 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-[#f0e6d0] dark:bg-white/10 flex items-center justify-center">
                          <Search className="h-5 w-5 text-[#a89878] dark:text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#a89878] dark:text-gray-400">
                            {searchTerm ? 'Sin resultados' : 'Sin datos'}
                          </p>
                          <p className="text-xs text-[#7a6a52] dark:text-gray-400 mt-0.5">
                            {searchTerm
                              ? `No se encontraron cazadores para "${searchTerm}"`
                              : 'No hay datos disponibles en este periodo'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tableRows.map(({ person, conv, tier }, idx) => (
                    <tr
                      key={person.id}
                      className="group hover:bg-orange-50/40 dark:hover:bg-orange-500/[0.03] transition-colors"
                    >
                      {/* Person */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {showTop3 && idx < 3 ? (
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black shrink-0 ${MEDALS[idx].bg} ${MEDALS[idx].text}`}>
                              {idx === 0
                                ? <Crown className="h-4 w-4" />
                                : <span>{idx + 1}</span>
                              }
                            </div>
                          ) : (
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-full text-white text-[11px] font-bold shrink-0"
                              style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
                            >
                              {person.avatar}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#3d2f1f] dark:text-gray-100 truncate">
                              {person.nombre}
                            </p>
                            <p className="text-[10px] text-[#7a6a52] dark:text-gray-400 tabular-nums">
                              DNI: {person.dni}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          person.tipo === 'Cazador'
                            ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400'
                            : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {person.tipo}
                        </span>
                      </td>

                      {/* Assigned */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span
                          className="text-sm font-bold text-[#3d2f1f] dark:text-gray-200 tabular-nums"
                          style={{ fontFamily: FONT.numbers, fontSize: '18px', fontVariantNumeric: 'tabular-nums' }}
                        >
                          {person.asignadas}
                        </span>
                      </td>

                      {/* Resolved */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span
                          className="text-sm font-bold text-[#3d2f1f] dark:text-gray-200 tabular-nums"
                          style={{ fontFamily: FONT.numbers, fontSize: '18px', fontVariantNumeric: 'tabular-nums' }}
                        >
                          {person.resueltas}
                        </span>
                      </td>

                      {/* Conversion */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2.5">
                          <div className="h-1.5 w-14 rounded-full bg-[#f0e6d0] dark:bg-white/10 overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${tier.bar}`}
                              style={{ width: `${Math.min(conv, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold w-10 text-right tabular-nums ${tier.text}`}>
                            {person.conversion}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 border-t border-[#e8dfc8] dark:border-white/10"
            style={{ fontFamily: FONT.body }}
          >
            <div className="flex items-center gap-3 text-[10px] text-[#7a6a52] dark:text-gray-400 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-emerald-500 inline-block" />{'>='}80%</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-amber-500 inline-block" />40-80%</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-red-500 inline-block" />{'<'}40%</span>
            </div>
            {totalCount > 0 && !showTop3 ? (
              <CustomTablePagination
                count={totalCount}
                page={currentPage}
                limit={limit}
                handlePageLimitChange={handlePageLimitChange}
              />
            ) : null}
          </div>
        </div>

        {/* ── Incidences By Typology Table ───────────────────────────── */}
        <IncidenceDashboardTable />

      </div>
    </div>
  );
}
