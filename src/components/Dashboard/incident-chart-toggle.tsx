import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CalendarPicker } from '@/components/Dashboard/calendar-picker';
import { BarChart3, TrendingUp } from 'lucide-react';
import { dashboardData } from '@/api/dashboard/DashboardApi';
import { useTheme } from '@/contexts/ThemeContext';

type ChartType = 'line' | 'bar';
type Period = '24H' | '7D' | '30D';

const PERIODS: Period[] = ['24H', '7D', '30D'];

function defaultDates() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() - 1);
  const start = new Date(end);
  start.setDate(end.getDate() - 29);
  return { start, end };
}

export function IncidentChartToggle() {
  const { isDark } = useTheme();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [period, setPeriod] = useState<Period>('30D');
  const [showAsignadas, setShowAsignadas] = useState(true);
  const [showFinalizadas, setShowFinalizadas] = useState(true);
  const { start: defaultStart, end: defaultEnd } = defaultDates();
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [rawData, setRawData] = useState<any>({ trends: { days: [] } });
  const [loading, setLoading] = useState(false);
  // Changes whenever the data changes → forces CSS dot animations to restart
  const animKey = `${period}-${startDate.getTime()}-${endDate.getTime()}`;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await dashboardData({
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        });
        if (!cancelled && res.data.status && res.data.data.trends) {
          setRawData({ trends: res.data.data.trends });
        }
      } catch { /* noop */ } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [startDate, endDate]);

  const processedData = useMemo(() => {
    const days = rawData?.trends?.days;
    if (!days?.length) return [];
    if (period === '24H') {
      const latest = days.find((d: any) => d.assigned > 0 || d.finished > 0);
      if (latest?.hours) {
        return latest.hours.map((h: any) => ({
          time: `${String(h.hour).padStart(2, '0')}:00`,
          asignadas: h.assigned,
          finalizadas: h.finished,
        }));
      }
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, '0')}:00`, asignadas: 0, finalizadas: 0,
      }));
    }
    const slice = period === '7D' ? days.slice(-7) : days;
    return slice.map((d: any) => {
      const [y, m, dd] = d.date.split('-');
      const date = new Date(+y, +m - 1, +dd);
      return {
        time: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        asignadas: d.assigned,
        finalizadas: d.finished,
      };
    });
  }, [rawData, period]);

  const metrics = useMemo(() => {
    if (!processedData.length) return null;
    const a = processedData.map((d) => d.asignadas);
    const f = processedData.map((d) => d.finalizadas);
    const calc = (arr: number[]) => ({
      total: arr.reduce((s, v) => s + v, 0),
      max: Math.max(...arr),
      avg: Math.round(arr.reduce((s, v) => s + v, 0) / arr.length),
    });
    return { asignadas: calc(a), finalizadas: calc(f) };
  }, [processedData]);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() - 1);
    const start = new Date(end);
    if (p === '24H') { start.setDate(end.getDate()); }
    else if (p === '7D') { start.setDate(end.getDate() - 6); }
    else { start.setDate(end.getDate() - 29); }
    setStartDate(start);
    setEndDate(end);
  };

  // Theme-aware chart colors
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const axisColor = isDark ? '#64748b' : '#6b7280';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const tooltipText = isDark ? '#f1f5f9' : '#374151';

  const isLineActive = chartType === 'line';

  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-[#111827] shadow border border-gray-200 dark:border-white/10 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isLineActive
              ? <TrendingUp className="h-5 w-5 text-orange-500" />
              : <BarChart3 className="h-5 w-5 text-orange-500" />
            }
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {isLineActive ? 'Tendencia de Incidencias' : 'Reportes de Incidencias'}
            </h3>
          </div>

          {/* Chart type toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/8">
            {(['line', 'bar'] as ChartType[]).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  chartType === t
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white',
                ].join(' ')}
              >
                {t === 'line' ? <TrendingUp className="h-3.5 w-3.5" /> : <BarChart3 className="h-3.5 w-3.5" />}
                {t === 'line' ? 'Tendencia' : 'Reportes'}
              </button>
            ))}
          </div>
        </div>


        {/* Metrics */}
        {metrics && isLineActive && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {([
              { label: 'Asignadas',   data: metrics.asignadas,   accent: 'text-teal-500'   },
              { label: 'Finalizadas', data: metrics.finalizadas, accent: 'text-orange-500' },
            ] as const).map(({ label, data, accent }) => (
              <div key={label} className="rounded-xl bg-gray-100 dark:bg-white/5 px-2 py-2">
                <p className={`text-[10px] font-bold uppercase tracking-wide text-center ${accent} mb-2`}>{label}</p>
                <div className="flex items-stretch divide-x divide-gray-200 dark:divide-white/10">
                  {([
                    { v: data.total, l: 'Total' },
                    { v: data.max,   l: 'Pico'  },
                    { v: data.avg,   l: 'Prom.'  },
                  ] as const).map(({ v, l }) => (
                    <div key={l} className="flex-1 text-center px-1.5">
                      <p className="text-base font-bold text-gray-900 dark:text-white leading-none">{v}</p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Period + Calendar */}
        <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
          <CalendarPicker
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={(s: Date, e: Date) => { setStartDate(s); setEndDate(e); }}
          />
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  period === p
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/15 hover:text-orange-600 dark:hover:text-white',
                ].join(' ')}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 py-4 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="h-[345px] flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            <p className="text-sm text-gray-400">Cargando datos...</p>
          </div>
        ) : processedData.length === 0 ? (
          <div className="h-[345px] flex flex-col items-center justify-center gap-2 text-gray-400">
            {isLineActive ? <TrendingUp className="h-10 w-10 opacity-30" /> : <BarChart3 className="h-10 w-10 opacity-30" />}
            <p className="text-sm">Sin datos para este período</p>
          </div>
        ) : (
          <>
            <style>{`@keyframes dotPop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}`}</style>
            <ResponsiveContainer width="100%" height={345}>
              {isLineActive ? (
                <LineChart data={processedData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                    labelStyle={{ color: tooltipText, fontWeight: 600, fontSize: 12 }}
                    itemStyle={{ fontSize: 12 }}
                  />
                  {showAsignadas && (
                    <Line
                      type="monotone" dataKey="asignadas" name="Asignadas"
                      stroke="#14b8a6" strokeWidth={2.5}
                      animationDuration={3000}
                      animationEasing="linear"
                      dot={(p: any) => {
                        const delay = processedData.length > 1 ? (p.index / (processedData.length - 1)) * 3000 : 0;
                        return <circle key={`${animKey}-a-${p.index}`} cx={p.cx} cy={p.cy} r={4} fill="#14b8a6" style={{ animation: 'dotPop 300ms ease forwards', animationDelay: `${delay}ms`, opacity: 0, transformBox: 'fill-box', transformOrigin: 'center' } as React.CSSProperties} />;
                      }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  )}
                  {showFinalizadas && (
                    <Line
                      type="monotone" dataKey="finalizadas" name="Finalizadas"
                      stroke="#f97316" strokeWidth={2.5}
                      animationDuration={3000}
                      animationEasing="linear"
                      dot={(p: any) => {
                        const delay = processedData.length > 1 ? (p.index / (processedData.length - 1)) * 3000 : 0;
                        return <circle key={`${animKey}-f-${p.index}`} cx={p.cx} cy={p.cy} r={4} fill="#f97316" style={{ animation: 'dotPop 300ms ease forwards', animationDelay: `${delay}ms`, opacity: 0, transformBox: 'fill-box', transformOrigin: 'center' } as React.CSSProperties} />;
                      }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  )}
                </LineChart>
              ) : (
                <BarChart data={processedData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                    labelStyle={{ color: tooltipText, fontWeight: 600, fontSize: 12 }}
                    itemStyle={{ fontSize: 12 }}
                  />
                  {showAsignadas && <Bar dataKey="asignadas" name="Asignadas" fill="#14b8a6" radius={[4, 4, 0, 0]} animationDuration={3000} />}
                  {showFinalizadas && <Bar dataKey="finalizadas" name="Finalizadas" fill="#f97316" radius={[4, 4, 0, 0]} animationDuration={3000} />}
                </BarChart>
              )}
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Legend toggles */}
      {processedData.length > 0 && (
        <div className="px-4 pb-2 flex items-center justify-center gap-3 border-t border-gray-200 dark:border-white/8 pt-2">
          {([
            { key: 'asignadas', label: 'Asignadas', color: 'bg-teal-500', active: showAsignadas, toggle: () => setShowAsignadas((v) => !v) },
            { key: 'finalizadas', label: 'Finalizadas', color: 'bg-orange-500', active: showFinalizadas, toggle: () => setShowFinalizadas((v) => !v) },
          ] as const).map(({ key, label, color, active, toggle }) => (
            <button
              key={key}
              onClick={toggle}
              className={[
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                active
                  ? 'bg-gray-100 dark:bg-white/8 text-gray-700 dark:text-gray-200'
                  : 'opacity-40 text-gray-600 dark:text-gray-400',
              ].join(' ')}
            >
              <span className={`w-3 h-3 rounded-sm ${active ? color : 'bg-gray-300 dark:bg-gray-600'}`} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
