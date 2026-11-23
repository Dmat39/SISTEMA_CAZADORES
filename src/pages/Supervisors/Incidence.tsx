import { useEffect, useRef, useState } from 'react';
import { useIncidenceSocket } from '../../hooks/useIncidenceSocket';
import { toast } from 'sonner';
import { createIncidenceApi, deleteIncidenceApi, getAllIncidenceComunicationApi, getAllIncidencesApi, getAllIncidenceZonesApi, updateIncidenceApi } from '../../api/operador/incidenceApi.tsx';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation.tsx';
import UpdateFormIncidence from '../../components/Supervisors/UpdateFormIncidence.tsx';
import AssignedOperators from '../../components/Supervisors/AssignedOperators.tsx';
import IncidencePanel from '../../components/Supervisors/IncidencePanel.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import CreateFormIncidence from '../../components/Operador/CreateFormIncidence';
import { useSelector } from 'react-redux';
import FilterCrimer from '../../components/Supervisors/FilterCrimer.tsx';
import DateRangeFilter from '../../components/Supervisors/DateRangeFilter.tsx';
import { cn, isVisualizer } from '../../lib/utils.js';
import { Search, Plus, AlertCircle, ShieldAlert, SearchX, ChevronLeft, ChevronRight, X, FilterX } from 'lucide-react';
import { useSetPageTitle } from '../../contexts/PageTitleContext';
import { KANBAN_STATES } from '../../components/Operador/kanban/kanbanConfig';

// Color real del estado (Previo en violeta), igual que en el panel de detalle
const accentColor = (status) => KANBAN_STATES[status]?.solidColor || 'bg-gray-400';

const STATUS_OPTIONS = [
    { value: '', label: 'Todas' },
    { value: 'process', label: 'En proceso' },
    { value: 'completed', label: 'Completadas' },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

const Incidence = () => {
    useSetPageTitle('Incidencias', 'Monitoreo · En tiempo real', true);
    const { role } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const readOnly = isVisualizer(role);

    const [incidents, setIncidents] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [zones, setZones] = useState([]);
    const [communications, setCommunications] = useState([]);
    const [selectedIncidenceId, setSelectedIncidenceId] = useState(null);
    const [selectedIncidenceName, setSelectedIncidenceName] = useState('');
    /* La búsqueda vive en la URL (?q=) igual que la página y los filtros, para
       que al recargar o compartir el enlace se conserve. Se lee una sola vez al
       montar; a partir de ahí el input manda y la URL lo va reflejando. */
    const [inputValue, setInputValue] = useState(
        () => new URLSearchParams(window.location.search).get('q') || ''
    );
    const [showForm, setShowForm] = useState(false);

    // Master-detail: incidencia mostrada en el panel derecho
    const [selectedId, setSelectedId] = useState(null);
    const [detailRefreshKey, setDetailRefreshKey] = useState(0);
    const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
    const listRef = useRef(null);

    const rowsPerPage = 10;
    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showAssignedOperators, setShowAssignedOperators] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const searchParams = new URLSearchParams(location.search);
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || rowsPerPage;
    const crimeIds = searchParams.getAll('crimeIds') || [];
    const selectedDate = searchParams.get('date') || '';
    const startDate = searchParams.get('start') || '';
    const endDate = searchParams.get('end') || '';
    const selectedStatus = searchParams.get('status') || '';
    const searchFromUrl = searchParams.get('q') || '';

    /* Término efectivo de búsqueda: sin espacios sobrantes y con los internos
       colapsados, para que escribir "robo " o "robo  moto" no dispare consultas
       equivalentes a la que ya se hizo. */
    const searchTerm = inputValue.trim().replace(/\s+/g, ' ');

    /* Página en la que estaba el usuario antes de empezar a buscar. Al limpiar
       la búsqueda se regresa a ella en lugar de quedarse en la 1. */
    const pageBeforeSearch = useRef(null);

    /* Cada petición lleva un número de orden. Solo la última en salir puede
       escribir en el estado: al teclear rápido varias consultas viajan a la vez
       y sin esto una respuesta lenta de un término viejo podía pintarse encima
       de la del término actual, mostrando resultados que no corresponden a lo
       que dice la caja de búsqueda. */
    const requestSeq = useRef(0);

    const openModalEdit = (payload) => { setDataEdit(payload); setShowUpdate(true); };

    const fetchZones = async () => {
        try { setZones((await getAllIncidenceZonesApi()).data); } catch { /**/ }
    };
    const fetchCommunications = async () => {
        try { setCommunications((await getAllIncidenceComunicationApi()).data); } catch { /**/ }
    };

    const fetchIncidents = async (silent = false) => {
        const seq = ++requestSeq.current;
        try {
            if (!silent) setIsLoading(true);
            const params = {
                page: currentPage, limit,
                ...(searchTerm && { search: searchTerm }),
                ...(crimeIds.length > 0 && { crimeIds }),
                ...(selectedDate && { date: selectedDate }),
                ...(startDate && { start: startDate }),
                ...(endDate && { end: endDate }),
                ...(selectedStatus && { status: selectedStatus }),
            };
            const response = await getAllIncidencesApi(params);
            if (seq !== requestSeq.current) return; // respuesta obsoleta
            setIncidents(response.data.data || []);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            if (seq !== requestSeq.current) return;
            if (!silent) toast.error(`Error al obtener las incidencias: ${error.message}`);
        } finally {
            if (seq === requestSeq.current && !silent) setIsLoading(false);
        }
    };

    const confirmDelete = useDeleteConfirmation({
        fetchData: fetchIncidents,
        deleteApiFn: deleteIncidenceApi,
        entityName: 'incidence',
    });

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        fetchZones();
        fetchCommunications();
    }, []);

    const handlePageLimitChange = (newPage, newLimit) => {
        const sp = new URLSearchParams(location.search);
        if (newLimit !== limit) { sp.set('limit', newLimit.toString()); sp.set('page', '1'); }
        else { sp.set('page', newPage.toString()); }
        navigate({ search: sp.toString() });
    };

    useEffect(() => {
        const timer = setTimeout(fetchIncidents, searchTerm ? 400 : 0);
        return () => clearTimeout(timer);
    }, [currentPage, limit, searchTerm, JSON.stringify(crimeIds), selectedDate, startDate, endDate, selectedStatus]);

    // Real-time: refresh silently when backend emits incidence/assignment events
    useIncidenceSocket(() => {
        fetchIncidents(true);
        setDetailRefreshKey((k) => k + 1);
    });

    /* Selección por defecto: siempre hay una incidencia abierta a la derecha.
       Se lee de una ref para que el efecto dependa solo de la lista y no se
       redispare al cambiar de selección manualmente. */
    const selectedIdRef = useRef(null);
    useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

    useEffect(() => {
        if (!incidents.length) {
            setSelectedId(null);
            return;
        }
        const current = selectedIdRef.current;
        if (current != null && incidents.some((i) => i.id === current)) return;
        setSelectedId(incidents[0].id);
    }, [incidents]);

    /* Si la URL cambia por fuera del input (Atrás/Adelante del navegador, o
       "Limpiar filtros") hay que reflejarlo en la caja. Se compara contra el
       término normalizado, no contra el texto crudo, para no borrar un espacio
       que el usuario acaba de escribir: al teclear "robo " la URL queda en
       "robo" y sin esta comparación el input se reescribiría solo. */
    useEffect(() => {
        if (searchFromUrl !== searchTerm) setInputValue(searchFromUrl);
    }, [searchFromUrl]);

    // Al cambiar de página la lista vuelve arriba
    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = 0;
    }, [currentPage, limit]);

    /* La página de la URL puede quedar fuera de rango: al borrar las últimas
       incidencias de la lista, al subir el tamaño de página o al llegar con un
       ?page= escrito a mano. Sin esto se queda una lista vacía con el contador
       marcando resultados. Se corrige con replace para no ensuciar el historial. */
    useEffect(() => {
        const lastPage = Math.max(1, Math.ceil(totalCount / limit));
        if (isLoading || currentPage <= lastPage) return;
        const sp = new URLSearchParams(location.search);
        sp.set('page', lastPage.toString());
        navigate({ search: sp.toString() }, { replace: true });
    }, [isLoading, currentPage, totalCount, limit]);

    const handleSelect = (item) => {
        setSelectedId(item.id);
        setMobilePanelOpen(true);
    };

    const handleAssign = (item) => {
        setSelectedIncidenceId(item.id);
        setSelectedIncidenceName(item.name);
        setShowAssignedOperators(true);
    };

    const handleDeleteIncidence = (item) => {
        confirmDelete(item, (p) => `${p.code}: ${p.name}`);
    };

    const handleCreateIncidencia = async (payload) => {
        try {
            const response = await createIncidenceApi(payload);
            const newId = response?.data?.id;
            setShowForm(false);
            await fetchIncidents();
            // La recién creada queda abierta en el panel derecho
            if (newId) {
                setSelectedId(newId);
                setMobilePanelOpen(true);
            }
        } catch (err) {
            toast.error('Error al crear incidencia: ' + err.message);
        }
    };

    const handleUpdateIncidence = async (payload) => {
        try {
            await updateIncidenceApi(payload, payload.id);
            await fetchIncidents();
            setDetailRefreshKey((k) => k + 1);
            setShowUpdate(false);
            toast.success('Incidencia actualizada exitosamente!');
        } catch (error) {
            toast.error(`Error al actualizar la incidencia: ${error.message}`);
        }
    };

    /* ── Filtros ───────────────────────────────────────────────── */
    const handleStatusChange = (value) => {
        const sp = new URLSearchParams(location.search);
        if (value) sp.set('status', value); else sp.delete('status');
        sp.set('page', '1');
        navigate({ search: sp.toString() });
    };

    /* Una búsqueda nueva arranca en la página 1, como los demás filtros, pero al
       vaciar la caja se regresa a la página desde la que se empezó a buscar: el
       usuario estaba revisando la 6, buscó algo y al borrar espera seguir en la 6. */
    const handleSearchChange = (value) => {
        const hadSearch = searchTerm.length > 0;
        const nextTerm = value.trim().replace(/\s+/g, ' ');
        setInputValue(value);

        let page = currentPage;
        if (!hadSearch && nextTerm) {
            // Arranca una búsqueda: recordamos dónde estaba y saltamos a la 1
            pageBeforeSearch.current = currentPage;
            page = 1;
        } else if (hadSearch && !nextTerm) {
            // Se limpió la búsqueda: volvemos a la página de origen
            const back = pageBeforeSearch.current;
            pageBeforeSearch.current = null;
            page = back && back > 0 ? back : 1;
        } else if (nextTerm) {
            // Se cambió el término dentro de una búsqueda en curso
            page = 1;
        }

        const sp = new URLSearchParams(location.search);
        if (nextTerm) sp.set('q', nextTerm); else sp.delete('q');
        sp.set('page', page.toString());

        /* replace y no push: teclear "robo moto" generaría una entrada de
           historial por letra y el botón Atrás quedaría inservible. */
        const next = sp.toString();
        if (next !== new URLSearchParams(location.search).toString()) {
            navigate({ search: next }, { replace: true });
        }
    };

    const activeFilters =
        (crimeIds.length > 0 ? 1 : 0) +
        (selectedStatus ? 1 : 0) +
        (startDate || endDate || selectedDate ? 1 : 0) +
        (searchTerm ? 1 : 0);

    const clearFilters = () => {
        const sp = new URLSearchParams(location.search);
        ['crimeIds', 'status', 'start', 'end', 'date', 'q'].forEach((k) => sp.delete(k));
        sp.set('page', '1');
        setInputValue('');
        pageBeforeSearch.current = null;
        navigate({ search: sp.toString() });
    };

    /* ── Paginación compacta ───────────────────────────────────── */
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const rangeFrom = totalCount ? (currentPage - 1) * limit + 1 : 0;
    const rangeTo = Math.min(currentPage * limit, totalCount);

    const pagerBtn = 'h-8 w-8 flex items-center justify-center rounded-lg text-[#7a6a52] dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/8 hover:text-orange-600 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors';

    return (
        <div className="p-2 sm:p-4 h-[calc(100vh-5rem)] flex gap-4 overflow-hidden">

            {/* ══ Columna izquierda: filtros + lista + paginación ══════════ */}
            <aside className="w-full lg:w-[360px] xl:w-[400px] shrink-0 min-h-0 flex flex-col rounded-xl bg-[#fdfbf5] dark:bg-[#111827] shadow border border-[#e8dfc8] dark:border-white/10 overflow-hidden">

                {/* Filtros acoplados */}
                <div className="shrink-0 p-3 flex flex-col gap-2.5 border-b border-[#e8dfc8] dark:border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a89878] pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar incidencia..."
                                value={inputValue}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="h-10 w-full pl-9 pr-8 text-sm bg-[#fdfbf5] dark:bg-[#1e293b] border border-[#e8dfc8] dark:border-white/10 text-[#3d2f1f] dark:text-white placeholder-[#a89878] dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 outline-none transition-all"
                            />
                            {inputValue && (
                                <button
                                    type="button"
                                    onClick={() => handleSearchChange('')}
                                    title="Limpiar búsqueda"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#a89878] hover:text-[#3d2f1f] dark:hover:text-white transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        {!readOnly && (
                            <button
                                onClick={() => setShowForm(true)}
                                title="Nueva incidencia"
                                className="h-10 shrink-0 flex items-center gap-1.5 px-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-orange-500/30 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Nueva</span>
                            </button>
                        )}
                    </div>

                    {/* Estado: control segmentado */}
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#f0e6d0]/70 dark:bg-white/5">
                        {STATUS_OPTIONS.map((opt) => {
                            const active = selectedStatus === opt.value;
                            return (
                                <button
                                    key={opt.value || 'all'}
                                    type="button"
                                    onClick={() => handleStatusChange(opt.value)}
                                    aria-pressed={active}
                                    className={cn(
                                        'h-8 rounded-md text-xs font-semibold transition-all',
                                        active
                                            ? 'bg-[#fdfbf5] dark:bg-[#1e293b] text-orange-600 dark:text-orange-400 shadow-sm'
                                            : 'text-[#7a6a52] dark:text-gray-400 hover:text-[#3d2f1f] dark:hover:text-white'
                                    )}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                    <FilterCrimer fullWidth />
                    <DateRangeFilter fullWidth />
                </div>

                {/* Cabecera de la lista */}
                <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-b border-[#e8dfc8] dark:border-white/10">
                    <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#7a6a52] dark:text-gray-400">
                        Incidencias
                        <span className="px-1.5 py-0.5 rounded-md bg-[#f0e6d0] dark:bg-white/10 text-[#3d2f1f] dark:text-gray-200 tabular-nums tracking-normal">
                            {totalCount}
                        </span>
                    </span>
                    {activeFilters > 0 && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                        >
                            <FilterX className="h-3.5 w-3.5" />
                            Limpiar filtros ({activeFilters})
                        </button>
                    )}
                </div>

                {/* Lista maestra */}
                <div ref={listRef} className="list-scroll flex-1 min-h-0 overflow-y-auto">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center gap-3 py-16 text-[#a89878] dark:text-gray-400">
                            <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                            <span className="text-sm">Cargando incidencias . . .</span>
                        </div>
                    ) : incidents.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                            {activeFilters > 0 ? (
                                <>
                                    <SearchX className="h-10 w-10 text-[#a89878] dark:text-gray-500" />
                                    <h3 className="text-sm font-semibold text-[#3d2f1f] dark:text-white">Sin resultados</h3>
                                    <p className="text-xs text-[#a89878] dark:text-gray-400">Ninguna incidencia coincide con los filtros aplicados</p>
                                    <button
                                        onClick={clearFilters}
                                        className="mt-1 px-4 py-2 text-sm font-medium rounded-lg bg-[#f0e6d0] dark:bg-white/10 text-[#7a6a52] dark:text-gray-300 hover:bg-[#e8dfc8] dark:hover:bg-white/15 transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-10 w-10 text-[#a89878] dark:text-gray-500" />
                                    <h3 className="text-sm font-semibold text-[#3d2f1f] dark:text-white">No hay incidencias registradas</h3>
                                    <p className="text-xs text-[#a89878] dark:text-gray-400">Aún no se han reportado incidencias por parte de los cazadores</p>
                                    {!readOnly && (
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            <Plus className="h-4 w-4" /> Crear primera incidencia
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        incidents.map((item) => {
                            const isActive = item.id === selectedId;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    aria-current={isActive ? 'true' : undefined}
                                    className={cn(
                                        'relative w-full text-left px-4 py-3 border-b last:border-b-0 border-[#e8dfc8] dark:border-white/8 transition-colors',
                                        isActive
                                            ? 'bg-[#f0e6d0] dark:bg-white/8'
                                            : 'hover:bg-orange-50/60 dark:hover:bg-white/5'
                                    )}
                                >
                                    {/* Barra de estado */}
                                    <span className={cn(
                                        'absolute left-0 top-0 bottom-0',
                                        isActive ? 'w-1.5' : 'w-1',
                                        accentColor(item.status)
                                    )} />

                                    <span className="block pl-1 text-sm font-semibold leading-5 min-h-[2.5rem] text-[#3d2f1f] dark:text-white line-clamp-2">
                                        {item.name || 'Sin título'}
                                    </span>

                                    <span className="mt-1.5 pl-1 flex items-center gap-1 text-xs leading-4 font-medium text-[#7a6a52] dark:text-gray-400">
                                        <ShieldAlert className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{item.crime?.name || 'Sin crimen'}</span>
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Paginación compacta */}
                <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-t border-[#e8dfc8] dark:border-white/10 text-xs text-[#7a6a52] dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <span className="tabular-nums">{rangeFrom}–{rangeTo} de {totalCount}</span>
                        <select
                            value={limit}
                            onChange={(e) => handlePageLimitChange(1, Number(e.target.value))}
                            title="Filas por página"
                            className="h-7 px-1.5 rounded-md bg-transparent border border-[#e8dfc8] dark:border-white/10 text-[#3d2f1f] dark:text-gray-200 dark:bg-[#111827] outline-none focus:border-orange-500 cursor-pointer"
                        >
                            {LIMIT_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <button
                            type="button"
                            onClick={() => handlePageLimitChange(currentPage - 1, limit)}
                            disabled={currentPage <= 1}
                            title="Página anterior"
                            className={pagerBtn}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="px-1.5 tabular-nums font-medium text-[#3d2f1f] dark:text-gray-200">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => handlePageLimitChange(currentPage + 1, limit)}
                            disabled={currentPage >= totalPages}
                            title="Página siguiente"
                            className={pagerBtn}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ══ Panel de detalle: ocupa toda la derecha, de arriba abajo ══ */}
            <section className={cn(
                'min-h-0 rounded-xl border border-[#e8dfc8] dark:border-white/10 bg-[#fdfbf5] dark:bg-[#111827] shadow overflow-hidden',
                'lg:flex lg:flex-1 lg:min-w-0 lg:static lg:inset-auto lg:z-auto',
                mobilePanelOpen ? 'fixed inset-2 z-50 flex shadow-2xl' : 'hidden'
            )}>
                <IncidencePanel
                    incidenceId={selectedId}
                    readOnly={readOnly}
                    refreshKey={detailRefreshKey}
                    onEdit={openModalEdit}
                    onDelete={handleDeleteIncidence}
                    onAssign={handleAssign}
                    onCloseMobile={() => setMobilePanelOpen(false)}
                    onRecordsChanged={() => fetchIncidents(true)}
                />
            </section>

            <CreateFormIncidence open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreateIncidencia} />
            <UpdateFormIncidence isOpen={showUpdate} onClose={() => setShowUpdate(false)} data={dataEdit} dataSelect={{ zones, communications }} onSubmit={handleUpdateIncidence} />
            <AssignedOperators isOpen={showAssignedOperators} onClose={() => setShowAssignedOperators(false)} incidenceId={selectedIncidenceId} incidenceName={selectedIncidenceName} />
        </div>
    );
};

export default Incidence;
