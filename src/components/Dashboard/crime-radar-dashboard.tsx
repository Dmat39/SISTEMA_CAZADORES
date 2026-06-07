import { useState, useMemo, useEffect } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import { Shield, UserPlus, CheckCircle } from 'lucide-react';
import { CalendarPicker } from '@/components/Dashboard/calendar-picker';
import { dashboardData } from '@/api/dashboard/DashboardApi';
import { useTheme } from '@/contexts/ThemeContext';

type CrimeType = 'assigned' | 'finished';
type Period = '24H' | '7D' | '30D';

const PERIODS: Period[] = ['24H', '7D', '30D'];

const CRIME_LABELS: Record<string, string> = {
  homicidio: 'Homicidio', sicariato: 'Sicariato', secuestro: 'Secuestro',
  lesiones: 'Lesiones', roboPersona: 'Robo Persona', roboVehiculo: 'Robo Vehículo',
  roboAccesorios: 'Robo Accesorios', extorsion: 'Extorsión', drogas: 'Drogas',
  accidente: 'Accidente', incendio: 'Incendio',
};

function defaultDates() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() - 1);
  const start = new Date(end);
  start.setDate(end.getDate() - 29);
  return { start, end };
}

export function CrimeRadarDashboard() {
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<Period>('30D');
  const [crimeType, setCrimeType] = useState<CrimeType>('assigned');
  const [hoveredCrime, setHoveredCrime] = useState<string | null>(null); // only for axis hover
  const [loading, setLoading] = useState(false);
  const { start: ds, end: de } = defaultDates();
  const [startDate, setStartDate] = useState(ds);
  const [endDate, setEndDate] = useState(de);
  const [apiData, setApiData] = useState<any>({ trends: { days: [] } });
  // Changes when period/type/dates change → remounts <Radar> (replay animation) + remounts dots (restart CSS anim)
  const animKey = `${period}-${crimeType}-${startDate.getTime()}-${endDate.getTime()}`;

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
          setApiData({ trends: res.data.data.trends });
        }
      } catch { /* noop */ } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [startDate, endDate]);

  const radarData = useMemo(() => {
    const days = apiData?.trends?.days;
    if (!days?.length) return [];

    const agg = Object.keys(CRIME_LABELS).reduce<Record<string, number>>((acc, k) => {
      acc[k] = 0;
      return acc;
    }, {});

    const srcDays = period === '7D' ? days.slice(-7) : days;

    if (period === '24H') {
      const latest = days.find((d: any) =>
        crimeType === 'assigned' ? d.assigned > 0 : d.finished > 0
      );
      if (latest?.crimen) {
        Object.keys(CRIME_LABELS).forEach((k) => { agg[k] = latest.crimen[k] || 0; });
      }
    } else {
      srcDays.forEach((d: any) => {
        const active = crimeType === 'assigned' ? d.assigned > 0 : d.finished > 0;
        if (active && d.crimen) {
          Object.keys(CRIME_LABELS).forEach((k) => { agg[k] += d.crimen[k] || 0; });
        }
      });
    }

    const max = Math.max(...Object.values(agg)) || 10;
    return Object.entries(CRIME_LABELS).map(([k, label]) => ({
      crime: label, value: agg[k], fullMark: max,
    }));
  }, [apiData, period, crimeType]);

  const totalCrimes = useMemo(() => radarData.reduce((s, i) => s + i.value, 0), [radarData]);
  const topCrime = useMemo(() => radarData.reduce((m, i) => (i.value > m.value ? i : m), radarData[0] ?? { crime: 'N/A', value: 0 }), [radarData]);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() - 1);
    const start = new Date(end);
    if (p === '7D') start.setDate(end.getDate() - 6);
    else if (p === '30D') start.setDate(end.getDate() - 29);
    setStartDate(start);
    setEndDate(end);
  };

  const isAssigned = crimeType === 'assigned';
  const accentFill = isAssigned ? '#3b82f6' : '#22c55e';
  // Semi-transparent fill baked into the hex color (not via fillOpacity attribute)
  // so dots never inherit the group opacity
  const accentArea = isAssigned ? '#3b82f630' : '#22c55e30';
  const accentLight = isAssigned ? 'text-blue-500' : 'text-emerald-500';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const axisColor = isDark ? '#64748b' : '#6b7280';
  const tooltipBg = isDark ? '#1e293b' : '#1e293b';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)';

  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-[#111827] shadow border border-gray-200 dark:border-white/10 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${accentLight}`} />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {isAssigned ? 'Crímenes Asignados' : 'Crímenes Finalizados'}
            </h3>
          </div>

          {/* Toggle assigned/finished */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/8">
            {([
              { t: 'assigned', label: 'Asignadas', Icon: UserPlus },
              { t: 'finished', label: 'Finalizadas', Icon: CheckCircle },
            ] as const).map(({ t, label, Icon }) => (
              <button
                key={t}
                onClick={() => setCrimeType(t)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  crimeType === t
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white',
                ].join(' ')}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { label: 'Total', value: totalCrimes, sub: 'incidentes' },
            { label: 'Mayor', value: topCrime?.value ?? 0, sub: topCrime?.crime ?? 'N/A' },
            { label: 'Período', value: period, sub: period === '24H' ? '24 horas' : period === '7D' ? '7 días' : '30 días' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="text-center rounded-xl bg-gray-100 dark:bg-white/5 px-2 py-3">
              <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium mb-0.5">{label}</p>
              <p className="text-base font-bold text-gray-900 dark:text-white leading-none">{value}</p>
              <p className={`text-[10px] mt-0.5 truncate ${accentLight}`}>{sub}</p>
            </div>
          ))}
        </div>

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

      {/* Radar Chart */}
      <div className="px-2 py-4 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="h-[345px] flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            <p className="text-sm text-gray-400">Cargando crímenes...</p>
          </div>
        ) : radarData.length === 0 ? (
          <div className="h-[345px] flex flex-col items-center justify-center gap-2 text-gray-400">
            <Shield className="h-10 w-10 opacity-30" />
            <p className="text-sm">Sin datos para este período</p>
          </div>
        ) : (
          <>
            <style>{`@keyframes dotPop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}`}</style>
            <ResponsiveContainer width="100%" height={345}>
              <RadarChart data={radarData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis
                  dataKey="crime"
                  tick={{ fontSize: 9, fill: axisColor }}
                  onMouseEnter={(d: any) => setHoveredCrime(d?.value ?? null)}
                  onMouseLeave={() => setHoveredCrime(null)}
                />
                <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} tick={{ fontSize: 8, fill: axisColor }} tickCount={4} stroke="transparent" />
                <Tooltip
                  contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12 }}
                  labelStyle={{ color: '#fff', fontWeight: 600, fontSize: 12 }}
                  itemStyle={{ color: accentFill, fontSize: 12 }}
                />
                <Radar
                  name="Incidentes"
                  dataKey="value"
                  stroke={accentFill}
                  fill={accentArea}
                  fillOpacity={1}
                  strokeWidth={2}
                  dot={(dotProps: any) => {
                    const { cx, cy, index } = dotProps;
                    const isHov = hoveredCrime === radarData[index]?.crime;
                    const total = radarData.length;
                    const delay = total > 1 ? (index / (total - 1)) * 4000 : 0;
                    return (
                      <g
                        key={`${animKey}-${index}`}
                        style={{ animation: 'dotPop 300ms ease forwards', animationDelay: `${delay}ms`, opacity: 0, transformOrigin: `${cx}px ${cy}px` } as React.CSSProperties}
                      >
                        {isHov && <circle cx={cx} cy={cy} r={11} fill="none" stroke={accentFill} strokeWidth={1.5} opacity={0.3}/>}
                        {isHov && <circle cx={cx} cy={cy} r={6} fill="none" stroke={accentFill} strokeWidth={1.5} opacity={0.7}/>}
                        <circle cx={cx} cy={cy} r={4} fill={accentFill}/>
                      </g>
                    );
                  }}
                  key={animKey}
                  isAnimationActive={true}
                  animationDuration={4000}
                />
              </RadarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Crime list */}
      {!loading && radarData.length > 0 && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 gap-1 max-h-20 overflow-y-auto">
            {radarData.map((item) => (
              <div
                key={item.crime}
                onMouseEnter={() => setHoveredCrime(item.crime)}
                onMouseLeave={() => setHoveredCrime(null)}
                className={[
                  'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-default border',
                  hoveredCrime === item.crime
                    ? isAssigned ? 'bg-blue-500/10 border-blue-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-gray-50 dark:bg-white/5 border-transparent',
                ].join(' ')}
              >
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{item.crime}</span>
                <span className={`font-bold ml-2 shrink-0 ${accentLight}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
