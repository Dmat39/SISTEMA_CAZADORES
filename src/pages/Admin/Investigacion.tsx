import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useEffect, useState, type FormEvent } from 'react';
import { CarFront, Search, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { consultInvestigationDniApi, consultInvestigationPlateApi } from '@/api/investigation';
import { useSetPageTitle } from '@/contexts/PageTitleContext';
import Loading from '@/components/Loading';

type QueryType = 'dni' | 'plate';
type ConsultationResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  cached?: boolean;
};

const LABELS: Record<string, string> = {
  DNI: 'DNI',
  PLACA: 'Placa',
  MARCA: 'Marca',
  MODELO: 'Modelo',
  COLOR: 'Color',
  PROPIETARIO: 'Propietario',
  NOMBRE_COMPLETO: 'Nombre completo',
  PRIMER_APELLIDO: 'Primer apellido',
  SEGUNDO_APELLIDO: 'Segundo apellido',
  NOMBRES: 'Nombres',
  DIRECCION: 'Dirección',
  DIRECCION_COMPLETA: 'Dirección completa',
  DEPARTAMENTO: 'Departamento',
  PROVINCIA: 'Provincia',
  DISTRITO: 'Distrito',
  ESTADO_CIVIL: 'Estado civil',
  RESTRICCION: 'Restricción',
  ESTADO_PIDE: 'Estado de consulta',
  TIPO: 'Tipo de consulta',
};

function labelFor(key: string) {
  return LABELS[key] ?? key.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

type HistoryEntry = {
  type: QueryType;
  query: string;
  date: number;
  result: ConsultationResult;
};

function openHistory(account: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cazadores-investigacion-' + account, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('consultas', { keyPath: ['type', 'query'] });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function historyEntries(account: string, entry?: HistoryEntry): Promise<HistoryEntry[]> {
  const db = await openHistory(account);
  try {
    return await new Promise<HistoryEntry[]>((resolve, reject) => {
      const tx = db.transaction('consultas', entry ? 'readwrite' : 'readonly');
      const store = tx.objectStore('consultas');
      if (entry) store.put(entry);
      const all = store.getAll();
      tx.oncomplete = () => resolve((all.result as HistoryEntry[]).sort((a, b) => b.date - a.date));
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export default function Investigacion() {
  useSetPageTitle('Investigación', 'Consulta de datos por DNI o placa');
  const auth = useSelector((state: RootState) => state.auth);
  if (!auth.username || auth.id == null) return null;
  const account = JSON.stringify([auth.id, auth.username]);
  return <Consultas key={account} account={account} />;
}

function Consultas({ account }: { account: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [savedDate, setSavedDate] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    historyEntries(account).then(rows => { if (active) setHistory(rows); })
      .catch(() => { if (active) toast.error('No se pudo abrir el historial de este navegador.'); });
    return () => { active = false; };
  }, [account]);
  const [type, setType] = useState<QueryType>('dni');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ConsultationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const changeType = (nextType: QueryType) => {
    setType(nextType);
    setSavedDate(null);
    setQuery('');
    setResult(null);
  };

  const consult = async (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim().toUpperCase();
    const isValid = type === 'dni' ? /^\d{8}$/.test(value) : /^[A-Z\d-]{5,8}$/.test(value);
    if (!isValid) {
      toast.error(type === 'dni'
        ? 'El DNI debe tener exactamente 8 dígitos.'
        : 'Ingresa una placa válida de 5 a 8 letras, números o guion.');
      return;
    }

    setSavedDate(null);
    setLoading(true);
    setResult(null);
    try {
      const response = type === 'dni'
        ? await consultInvestigationDniApi(value)
        : await consultInvestigationPlateApi(value);
      const payload = response?.data ?? response;
      setResult(payload);
      if (payload?.success && /^OK\b/.test(String(payload.data?.ESTADO_PIDE))) {
        try {
          setHistory(await historyEntries(account, { type, query: value, date: Date.now(), result: payload }));
        } catch {
          toast.error('Consulta completada. No se pudo guardar en este navegador.');
        }
      }
      if (!payload?.success) toast.error(payload?.error || 'No se encontraron datos para la consulta.');
    } catch (error: any) {
      const message = Array.isArray(error?.message) ? error.message.join(', ') : error?.message;
      toast.error(message || 'No se pudo conectar con el servicio de consultas.');
    } finally {
      setLoading(false);
    }
  };

  const data: Record<string, unknown> = result?.data ?? {};
  const photo = typeof data.FOTO === 'string' && data.FOTO.startsWith('data:image/') ? data.FOTO : null;
  const fields = Object.entries(data).filter(([key, value]) => key !== 'FOTO' && value !== null && value !== undefined && value !== '');
  const noDataFound = typeof data.ESTADO_PIDE === 'string' && data.ESTADO_PIDE.startsWith('NO_ENCONTRADO');

  return (
    <div className="p-2 sm:p-4 min-h-[calc(100vh-5rem)]">
      <div className="mx-auto grid max-w-7xl items-start gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0 rounded-xl bg-[#fdfbf5] dark:bg-[#111827] shadow border border-[#e8dfc8] dark:border-white/10 p-4 sm:p-6 flex flex-col gap-5">
        <div className="flex gap-2" role="group" aria-label="Tipo de consulta">
          <button
            type="button"
            disabled={loading} onClick={() => changeType('dni')}
            aria-pressed={type === 'dni'}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${type === 'dni' ? 'bg-orange-500 text-white' : 'border border-[#e8dfc8] bg-white text-[#7a6a52] hover:bg-orange-50 dark:border-white/10 dark:bg-[#0a0f1e] dark:text-gray-300 dark:hover:bg-white/5'}`}
          >
            <UserRound className="h-4 w-4" /> Consultar DNI
          </button>
          <button
            type="button"
            disabled={loading} onClick={() => changeType('plate')}
            aria-pressed={type === 'plate'}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${type === 'plate' ? 'bg-orange-500 text-white' : 'border border-[#e8dfc8] bg-white text-[#7a6a52] hover:bg-orange-50 dark:border-white/10 dark:bg-[#0a0f1e] dark:text-gray-300 dark:hover:bg-white/5'}`}
          >
            <CarFront className="h-4 w-4" /> Consultar placa
          </button>
        </div>

        <form onSubmit={consult} className="flex flex-col sm:flex-row gap-3">
          <label className="sr-only" htmlFor="investigation-query">{type === 'dni' ? 'Número de DNI' : 'Número de placa'}</label>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a89878]" />
            <input
              id="investigation-query"
              value={query}
              onChange={(event) => setQuery(type === 'dni' ? event.target.value.replace(/\D/g, '') : event.target.value.toUpperCase())}
              placeholder={type === 'dni' ? 'Ingresa los 8 dígitos del DNI' : 'Ingresa el número de placa'}
              inputMode={type === 'dni' ? 'numeric' : 'text'}
              maxLength={8}
              autoComplete="off"
              className="w-full rounded-lg border border-[#e8dfc8] dark:border-white/10 bg-white dark:bg-[#0a0f1e] py-3 pl-10 pr-3 text-sm text-[#3d2f1f] dark:text-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
            />
          </div>
          <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
            <Search className="h-4 w-4" /> {loading ? 'Consultando…' : 'Consultar'}
          </button>
        </form>

        <p className="text-xs text-[#a89878] dark:text-gray-400">
          La consulta se realiza en el servicio PIDE conectado a bot_consultas. Los datos se muestran según la respuesta recibida.
        </p>

        {loading && <Loading message="Consultando servicio PIDE" />}

        {!loading && result && (
          result.success && !noDataFound ? (
            <section className="rounded-xl border border-[#e8dfc8] dark:border-white/10 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-[#f0e6d0] dark:bg-[#1e293b] px-4 py-3">
                <h2 className="font-semibold text-[#3d2f1f] dark:text-white">Resultado de consulta</h2>
                <span className="text-xs text-[#7a6a52] dark:text-gray-400">{savedDate ? 'Guardado el ' + new Date(savedDate).toLocaleString('es-PE') : result.cached ? 'Respuesta desde caché' : 'Consulta actualizada'}</span>
              </div>
              {photo && <div className="flex justify-center border-b border-[#e8dfc8] dark:border-white/10 p-4"><img src={photo} alt="Foto obtenida en la consulta" className="max-h-64 rounded-lg object-contain" /></div>}
              <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#e8dfc8] dark:divide-white/10">
                {fields.map(([key, value]) => (
                  <div key={key} className="border-b border-[#e8dfc8] dark:border-white/10 px-4 py-3 last:border-b-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#a89878] dark:text-gray-400">{labelFor(key)}</dt>
                    <dd className="mt-1 break-words text-sm text-[#3d2f1f] dark:text-gray-100">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : (
            <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-5 text-sm text-amber-900 dark:text-amber-200">
              <h2 className="font-semibold">{noDataFound ? 'Sin resultados' : 'La consulta no pudo completarse'}</h2>
              <p className="mt-1">{result.error || data.ESTADO_PIDE || 'El servicio no devolvió datos para este número.'}</p>
              {fields.length > 0 && <dl className="mt-4 grid gap-2 sm:grid-cols-2">{fields.map(([key, value]) => <div key={key}><dt className="font-semibold">{labelFor(key)}</dt><dd>{String(value)}</dd></div>)}</dl>}
            </div>
          )
        )}
      </div>
      <aside aria-label="Historial de consultas" className="rounded-xl border border-[#e8dfc8] bg-[#fdfbf5] p-4 dark:border-white/10 dark:bg-[#111827] dark:text-white">
        <h2 className="font-semibold">Historial de consultas</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Guardado para tu usuario en este navegador.</p>
        {history.length === 0 ? <p className="mt-4 text-sm">Aún no hay consultas guardadas.</p> : (
          <ul className="mt-3 max-h-[65vh] space-y-1 overflow-y-auto">
            {history.map(entry => (
              <li key={entry.type + entry.query}>
                <button type="button" disabled={loading} onClick={() => {
                  setType(entry.type);
                  setQuery(entry.query);
                  setResult(entry.result);
                  setSavedDate(entry.date);
                }} className="w-full rounded-lg border border-transparent p-2 text-left hover:bg-orange-50 focus-visible:border-orange-500 disabled:opacity-60 dark:hover:bg-white/5">
                  <span className="block truncate text-sm font-semibold">{String(entry.result.data?.NOMBRE_COMPLETO || entry.result.data?.PROPIETARIO || entry.query)}</span>
                  <span className="block text-xs">{entry.type === 'dni' ? 'DNI' : 'Placa'} {entry.query}</span>
                  <time className="block text-xs text-gray-500 dark:text-gray-400">{new Date(entry.date).toLocaleString('es-PE')}</time>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      </div>
    </div>
  );
}
