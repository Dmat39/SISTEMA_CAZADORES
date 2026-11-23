import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import {
    AlertCircle, ArrowRight, Camera, ExternalLink, FileText, MoreHorizontal, Pencil, Plus, Trash2, Users, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getIncidenceByIdApi, getIncidenceCodesApi } from '../../api/operador/incidenceApi';
import { createSubRegistroIncidenceApi } from '../../api/operador/registroIncidenceApi';
import { updateIncidenceApi } from '../../api/operador/incidenceApi';
import PreviousStatusNotice from '../UI/PreviousStatusNotice';
import CreateFormRegister from '../Operador/CreateFormRegister';
import RecordsTimeline, { ClampedText, EvidenceThumb, cameraLabel } from './RecordsTimeline';
import { KANBAN_STATES } from '../Operador/kanban/kanbanConfig';

/* Estado real: "previous" se muestra como Previo, con su aviso, para no confundirlo con En proceso */
const statusLabel = (s) => KANBAN_STATES[s]?.titulo || s || '—';
const statusSolid = (s) => KANBAN_STATES[s]?.solidColor || 'bg-gray-400';

const Dot = () => <span className="text-[#d8cba8] dark:text-gray-600">·</span>;

const SectionTitle = ({ children }) => (
    <h3 className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-[#a89878] dark:text-gray-500">{children}</h3>
);

/* Fila etiqueta / valor de la sección "Datos" */
const Field = ({ label, value, last = false }) => (
    <div className={`flex items-baseline justify-between gap-4 py-2.5 ${last ? '' : 'border-b border-[#e8dfc8]/70 dark:border-white/5'}`}>
        <dt className="text-sm text-[#a89878] dark:text-gray-500">{label}</dt>
        <dd className="text-sm font-medium text-right text-[#3d2f1f] dark:text-gray-200 break-words min-w-0">
            {value || <span className="font-normal text-[#d8cba8] dark:text-gray-600">—</span>}
        </dd>
    </div>
);

/* Nombre de usuario, tachado si la cuenta fue eliminada */
const UserName = ({ user }) => {
    if (!user?.username) return <>—</>;
    return user.deletedAt
        ? <del className="text-[#a89878] dark:text-gray-500">{user.username}</del>
        : <>{user.username}</>;
};

const IncidencePanel = ({
    incidenceId,
    readOnly = false,
    refreshKey = 0,
    onEdit,
    onDelete,
    onAssign,
    onCloseMobile,
    onRecordsChanged,
}) => {
    const [incidencia, setIncidencia] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [externalId, setExternalId] = useState(null);
    /* La pestaña se conserva al cambiar de incidencia, para revisar registros en serie */
    const [tab, setTab] = useState('summary');
    const [menuOpen, setMenuOpen] = useState(false);
    const [showRecordForm, setShowRecordForm] = useState(false);
    const menuRef = useRef(null);

    /* Cierra el menú ⋯ al hacer clic fuera o al cambiar de incidencia */
    useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [menuOpen]);
    useEffect(() => { setMenuOpen(false); setShowRecordForm(false); }, [incidenceId]);

    /* Descarta respuestas que quedaron obsoletas al cambiar de incidencia rápido */
    const requestIdRef = useRef(0);

    const fetchIncidencia = useCallback(async (id, silent = false) => {
        const reqId = ++requestIdRef.current;
        if (!id) {
            setIncidencia(null);
            setLoadError(null);
            setIsLoading(false);
            return;
        }
        if (!silent) setIsLoading(true);
        try {
            const response = await getIncidenceByIdApi(id);
            if (reqId !== requestIdRef.current) return;
            setIncidencia(response.data);
            setLoadError(null);
        } catch (error) {
            if (reqId !== requestIdRef.current) return;
            setIncidencia(null);
            setLoadError(error?.message || 'No se pudo cargar la incidencia');
        } finally {
            if (reqId === requestIdRef.current && !silent) setIsLoading(false);
        }
    }, []);

    /* Al cambiar de incidencia limpiamos el detalle previo para no mezclar datos */
    useEffect(() => {
        setIncidencia(null);
        setExternalId(null);
        setLoadError(null);
        fetchIncidencia(incidenceId);
    }, [incidenceId, fetchIncidencia]);

    /* Refresco silencioso pedido desde fuera (socket, edición, nuevo registro).
       Compara contra el valor anterior para no duplicar el fetch que ya hace
       el efecto de arriba cuando lo que cambió fue la incidencia. */
    const prevRefreshKey = useRef(refreshKey);
    useEffect(() => {
        if (prevRefreshKey.current === refreshKey) return;
        prevRefreshKey.current = refreshKey;
        if (!incidenceId) return;
        fetchIncidencia(incidenceId, true);
    }, [refreshKey, incidenceId, fetchIncidencia]);

    /* Id del sistema externo, para el enlace "Ver en central" */
    useEffect(() => {
        const code = incidencia?.code;
        if (!code) {
            setExternalId(null);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const response = await getIncidenceCodesApi(code);
                const match = response?.data?.find((item) => item.codigo_incidencia === code);
                if (!cancelled) setExternalId(match?.id ?? null);
            } catch {
                if (!cancelled) setExternalId(null);
            }
        })();
        return () => { cancelled = true; };
    }, [incidencia?.code]);

    const refetchRecords = useCallback(async () => {
        await fetchIncidencia(incidenceId, true);
        onRecordsChanged?.();
    }, [fetchIncidencia, incidenceId, onRecordsChanged]);

    const handleRecordSubmit = async (formData) => {
        try {
            if (!(formData instanceof FormData)) return;
            await createSubRegistroIncidenceApi(formData);
            toast.success('Registro creado exitosamente');
            setShowRecordForm(false);
            setTab('records');
            await refetchRecords();
        } catch (err) {
            toast.error('Error al guardar el registro: ' + err.message);
        }
    };

    /* Acepta la preincidencia: previous → process */
    const handleAccept = async () => {
        try {
            await updateIncidenceApi({ status: 'process' }, incidenceId);
            toast.success('La incidencia pasó a En proceso');
            await refetchRecords();
        } catch (err) {
            toast.error('No se pudo cambiar el estado: ' + (err?.message || 'Error desconocido'));
        }
    };

    /* ── Estados sin detalle que mostrar ────────────────────────── */
    if (!incidenceId) {
        return (
            <div className="flex-1 min-w-0 h-full flex flex-col items-center justify-center gap-3 text-center px-6 py-16">
                <FileText className="h-10 w-10 text-[#a89878] dark:text-gray-600" />
                <p className="text-sm text-[#a89878] dark:text-gray-400">
                    Selecciona una incidencia de la lista para ver su detalle
                </p>
            </div>
        );
    }

    if (isLoading && !incidencia) {
        return (
            <div className="flex-1 min-w-0 h-full flex items-center justify-center gap-3 py-16 text-[#a89878] dark:text-gray-400">
                <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                <span className="text-sm">Cargando detalle . . .</span>
            </div>
        );
    }

    if (loadError && !incidencia) {
        return (
            <div className="flex-1 min-w-0 h-full flex flex-col items-center justify-center gap-3 text-center px-6 py-16">
                <AlertCircle className="h-10 w-10 text-[#a89878] dark:text-gray-600" />
                <p className="text-sm text-[#7a6a52] dark:text-gray-400">{loadError}</p>
                <button
                    onClick={() => fetchIncidencia(incidenceId)}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-[#f0e6d0] dark:bg-white/10 text-[#7a6a52] dark:text-gray-300 hover:bg-[#e8dfc8] dark:hover:bg-white/15 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!incidencia) return null;

    const {
        name, status, code, communication, comunication, zone, crime, plate, description, observation,
        date: dateString, createdAt, updatedAt, user, userEnd, userWhoUpdated, records = [],
    } = incidencia;

    /* El backend expone al editor como la relación userEnd; userWhoUpdated es solo su id */
    const updatedBy = userEnd ?? (typeof userWhoUpdated === 'object' ? userWhoUpdated : null);

    /* El backend solo acepta registros en incidencias en proceso */
    const canAddRecord = status === 'process';

    const tabs = [
        { key: 'summary', label: 'Resumen' },
        { key: 'records', label: 'Registros', count: records.length },
    ];

    const latestRecord = records.reduce(
        (latest, r) => (!latest || dayjs(r.date).isAfter(latest.date) ? r : latest),
        null
    );
    const evidenceCount = records.reduce((n, r) => n + (r.evidences?.length || 0), 0);

    return (
        <div className="flex-1 min-w-0 h-full flex flex-col min-h-0">

            {/* ── Cabecera ─────────────────────────────────────────── */}
            <header className="shrink-0 px-6 pt-5">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="min-w-0 font-display text-xl font-bold leading-snug tracking-tight text-[#3d2f1f] dark:text-white break-words">
                        {name || 'Sin título'}
                    </h2>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {!readOnly && (
                            <>
                                <button
                                    onClick={() => setShowRecordForm(true)}
                                    disabled={!canAddRecord}
                                    title={canAddRecord ? 'Agregar registro' : 'Solo se pueden agregar registros a incidencias en proceso'}
                                    className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-sm shadow-orange-500/30 transition-colors disabled:bg-[#e8dfc8] disabled:text-[#a89878] disabled:shadow-none dark:disabled:bg-white/10 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Registro</span>
                                </button>
                                <button
                                    onClick={() => onAssign?.(incidencia)}
                                    className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium text-[#7a6a52] dark:text-gray-300 border border-[#e8dfc8] dark:border-white/10 hover:border-orange-400 hover:text-orange-600 dark:hover:text-white transition-colors"
                                >
                                    <Users className="h-4 w-4" />
                                    <span className="hidden xl:inline">Cazadores</span>
                                </button>

                                <div ref={menuRef} className="relative">
                                    <button
                                        onClick={() => setMenuOpen((v) => !v)}
                                        title="Más acciones"
                                        aria-expanded={menuOpen}
                                        className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors ${menuOpen ? 'bg-[#f0e6d0] dark:bg-white/10' : 'hover:bg-[#f0e6d0] dark:hover:bg-white/8'}`}
                                    >
                                        <MoreHorizontal className="h-4 w-4 text-[#7a6a52] dark:text-gray-400" />
                                    </button>
                                    {menuOpen && (
                                        <div className="absolute right-0 top-full mt-1 z-20 w-44 py-1 rounded-xl bg-[#fdfbf5] dark:bg-[#1e293b] border border-[#e8dfc8] dark:border-white/10 shadow-lg">
                                            <button
                                                onClick={() => { setMenuOpen(false); onEdit?.(incidencia); }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#3d2f1f] dark:text-gray-200 hover:bg-[#f0e6d0] dark:hover:bg-white/8"
                                            >
                                                <Pencil className="h-4 w-4 text-blue-500" /> Editar
                                            </button>
                                            <button
                                                onClick={() => { setMenuOpen(false); onDelete?.(incidencia); }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-4 w-4" /> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        {onCloseMobile && (
                            <button
                                onClick={onCloseMobile}
                                title="Cerrar"
                                className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[#f0e6d0] dark:hover:bg-white/8 transition-colors"
                            >
                                <X className="h-4 w-4 text-[#a89878] dark:text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Línea de metadatos discreta */}
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#7a6a52] dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#3d2f1f] dark:text-gray-200">
                        <span className={`h-2 w-2 rounded-full ${statusSolid(status)}`} />
                        {statusLabel(status)}
                    </span>
                    <Dot />
                    <span className="font-mono text-xs">{code || 'Sin código'}</span>
                    {dateString && (
                        <>
                            <Dot />
                            <span>{dayjs(dateString).format('DD/MM/YYYY · HH:mm')}</span>
                        </>
                    )}
                    {code && externalId && (
                        <>
                            <Dot />
                            <a
                                href={`http://10.10.40.10:8081/incidencias/${externalId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline"
                            >
                                Ver en central <ExternalLink className="h-3 w-3" />
                            </a>
                        </>
                    )}
                </div>

                {status === 'previous' && (
                    <PreviousStatusNotice className="mt-4" onAccept={readOnly ? undefined : handleAccept} />
                )}

                {/* Pestañas */}
                <nav className="mt-4 flex gap-6 border-b border-[#e8dfc8] dark:border-white/10" role="tablist">
                    {tabs.map((t) => {
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                role="tab"
                                aria-selected={active}
                                onClick={() => setTab(t.key)}
                                className={`relative -mb-px pb-2.5 text-sm font-semibold transition-colors border-b-2 ${active
                                    ? 'border-orange-500 text-[#3d2f1f] dark:text-white'
                                    : 'border-transparent text-[#a89878] dark:text-gray-500 hover:text-[#7a6a52] dark:hover:text-gray-300'}`}
                            >
                                {t.label}
                                {t.count != null && (
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[11px] tabular-nums ${active
                                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
                                        : 'bg-[#f0e6d0] text-[#7a6a52] dark:bg-white/10 dark:text-gray-400'}`}
                                    >
                                        {t.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </header>

            {/* ── Contenido de la pestaña (scroll propio) ─────────── */}
            <div className="list-scroll flex-1 min-h-0 overflow-y-auto px-6 py-5">
                {tab === 'summary' ? (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px] items-start">

                        {/* Columna principal: el relato */}
                        <div className="min-w-0 space-y-6">
                            <section>
                                <SectionTitle>Descripción</SectionTitle>
                                <p className="text-[15px] leading-relaxed text-[#3d2f1f] dark:text-gray-200 whitespace-pre-line">
                                    {description || <span className="text-[#a89878] dark:text-gray-500">Sin descripción disponible.</span>}
                                </p>
                            </section>

                            {observation && (
                                <section className="rounded-lg border-l-4 border-amber-400 bg-amber-50/70 dark:bg-amber-500/10 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">Observación</p>
                                    <p className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/80 whitespace-pre-line">{observation}</p>
                                </section>
                            )}

                            {latestRecord && (
                                <section>
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <SectionTitle>Último registro</SectionTitle>
                                        <button
                                            type="button"
                                            onClick={() => setTab('records')}
                                            className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                                        >
                                            Ver los {records.length} registros <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="rounded-xl border border-[#e8dfc8] dark:border-white/10 bg-[#f7f2e7]/60 dark:bg-white/[0.03] p-4">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7a6a52] dark:text-gray-400">
                                            <span className="text-sm font-semibold text-[#3d2f1f] dark:text-white">
                                                {dayjs(latestRecord.date).format('HH:mm')}
                                            </span>
                                            <span>{dayjs(latestRecord.date).format('DD/MM/YYYY')}</span>
                                            <Dot />
                                            <span className="inline-flex items-center gap-1">
                                                <Camera className="h-3.5 w-3.5" /> {cameraLabel(latestRecord.camera)}
                                            </span>
                                        </div>
                                        {latestRecord.description && (
                                            <div className="mt-2">
                                                <ClampedText key={latestRecord.id} text={latestRecord.description} />
                                            </div>
                                        )}
                                        {latestRecord.evidences?.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {latestRecord.evidences.map((ev) => <EvidenceThumb key={ev.id} evidence={ev} />)}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Columna lateral: ficha de datos */}
                        <aside className="space-y-4 xl:sticky xl:top-0">
                            <div className="rounded-xl border border-[#e8dfc8] dark:border-white/10 bg-[#f7f2e7]/60 dark:bg-white/[0.03] px-4 pt-3 pb-1">
                                <SectionTitle>Datos</SectionTitle>
                                <dl>
                                    <Field label="Crimen" value={crime?.name} />
                                    <Field label="Zona" value={zone?.name} />
                                    <Field label="Medio" value={(communication ?? comunication)?.name} />
                                    <Field label="Placa" value={plate} />
                                    <Field label="Registros" value={records.length || null} />
                                    <Field label="Evidencias" value={evidenceCount || null} last />
                                </dl>
                            </div>

                            <div className="rounded-xl border border-[#e8dfc8] dark:border-white/10 px-4 py-3">
                                <SectionTitle>Actividad</SectionTitle>
                                <div className="space-y-2.5 text-xs">
                                    <div>
                                        <p className="text-[#a89878] dark:text-gray-500">Creado por</p>
                                        <p className="text-sm text-[#3d2f1f] dark:text-gray-200"><UserName user={user} /></p>
                                        {createdAt && <p className="text-[#a89878] dark:text-gray-500">{dayjs(createdAt).format('DD/MM/YYYY HH:mm')}</p>}
                                    </div>
                                    <div>
                                        <p className="text-[#a89878] dark:text-gray-500">Editado por</p>
                                        <p className="text-sm text-[#3d2f1f] dark:text-gray-200"><UserName user={updatedBy} /></p>
                                    </div>
                                    {/* updatedAt también cambia con cada registro nuevo, editado o borrado */}
                                    {updatedAt && (
                                        <div>
                                            <p className="text-[#a89878] dark:text-gray-500">Última actividad</p>
                                            <p className="text-sm text-[#3d2f1f] dark:text-gray-200">{dayjs(updatedAt).format('DD/MM/YYYY HH:mm')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                ) : (
                    <RecordsTimeline
                        records={records}
                        fetchRecords={refetchRecords}
                        readOnly={readOnly}
                        locked={!canAddRecord}
                        onAdd={!readOnly && canAddRecord ? () => setShowRecordForm(true) : undefined}
                    />
                )}
            </div>

            {!readOnly && showRecordForm && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <CreateFormRegister
                        incidenceId={incidenceId}
                        onClose={() => setShowRecordForm(false)}
                        onSubmit={handleRecordSubmit}
                    />
                </LocalizationProvider>
            )}
        </div>
    );
};

export default IncidencePanel;
