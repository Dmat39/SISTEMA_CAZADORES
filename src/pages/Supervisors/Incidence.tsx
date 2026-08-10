import { useEffect, useRef, useState, useCallback } from 'react';
import { useIncidenceSocket } from '../../hooks/useIncidenceSocket';
import { toast } from 'sonner';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js';
import Loading from '../../components/Loading';
import { createIncidenceApi, deleteIncidenceApi, getAllIncidenceComunicationApi, getAllIncidencesApi, getAllIncidenceZonesApi, updateIncidenceApi } from '../../api/operador/incidenceApi.tsx';
import CustomTablePagination from '../../components/Pagination/TablePagination.tsx';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation.tsx';
import UpdateFormIncidence from '../../components/Supervisors/UpdateFormIncidence.tsx';
import AssignedOperators from '../../components/Supervisors/AssignedOperators.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import CreateFormIncidence from '../../components/Operador/CreateFormIncidence';
import { useSelector } from 'react-redux';
import FilterCrimer from '../../components/Supervisors/FilterCrimer.tsx';
import DateRangeFilter from '../../components/Supervisors/DateRangeFilter.tsx';
import StatusFilter from '../../components/Supervisors/StatusFilter.tsx';
import { isVisualizer } from '../../lib/utils.js';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { useSetPageTitle } from '../../contexts/PageTitleContext';
import { getSoftBadgeClass } from '../../components/Operador/kanban/kanbanConfig';

// Mismos colores y nombres que ve el cazador; "previous" se muestra junto a "process" como "En Proceso"
const STATUS_BADGE = {
    previous:  getSoftBadgeClass('process'),
    process:   getSoftBadgeClass('process'),
    completed: getSoftBadgeClass('completed'),
};
const STATUS_LABEL = { previous: 'En Proceso', process: 'En Proceso', completed: 'Completado' };

const Incidence = () => {
    useSetPageTitle('Incidencias', 'Monitoreo · En tiempo real', true);
    const { role } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    const [incidents, setIncidents] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [zones, setZones] = useState([]);
    const [communications, setCommunications] = useState([]);
    const [selectedIncidenceId, setSelectedIncidenceId] = useState(null);
    const [selectedIncidenceName, setSelectedIncidenceName] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [showForm, setShowForm] = useState(false);

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

    const openModalEdit = (payload) => { setDataEdit(payload); setShowUpdate(true); };

    const fetchZones = async () => {
        try { setZones((await getAllIncidenceZonesApi()).data); } catch { /**/ }
    };
    const fetchCommunications = async () => {
        try { setCommunications((await getAllIncidenceComunicationApi()).data); } catch { /**/ }
    };

    const fetchIncidents = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const params = {
                page: currentPage, limit,
                ...(inputValue.trim() && { search: inputValue.trim() }),
                ...(crimeIds.length > 0 && { crimeIds }),
                ...(selectedDate && { date: selectedDate }),
                ...(startDate && { start: startDate }),
                ...(endDate && { end: endDate }),
                ...(selectedStatus && { status: selectedStatus }),
            };
            const response = await getAllIncidencesApi(params);
            setIncidents(response.data.data || []);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            if (!silent) toast.error(`Error al obtener las incidencias: ${error.message}`);
        } finally {
            if (!silent) setIsLoading(false);
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
        const timer = setTimeout(fetchIncidents, inputValue ? 500 : 0);
        return () => clearTimeout(timer);
    }, [currentPage, limit, inputValue, JSON.stringify(crimeIds), selectedDate, startDate, endDate, selectedStatus]);

    // Real-time: refresh silently when backend emits incidence/assignment events
    useIncidenceSocket(() => fetchIncidents(true));

    const handleCreateIncidencia = async (payload) => {
        try {
            const response = await createIncidenceApi(payload);
            const newId = response?.data?.id;
            if (newId) {
                localStorage.setItem('last_created_incidence_id', newId);
                const r = role?.toLowerCase();
                navigate(r === 'administrator' ? '/dashboard/admin/incidencia/detalle' : '/dashboard/supervisors/incidencia/detalle');
            }
            await fetchIncidents();
            setShowForm(false);
        } catch (err) {
            toast.error('Error al crear incidencia: ' + err.message);
        }
    };

    const handleUpdateIncidence = async (payload) => {
        try {
            await updateIncidenceApi(payload, payload.id);
            await fetchIncidents();
            setShowUpdate(false);
            toast.success('Incidencia actualizada exitosamente!');
        } catch (error) {
            toast.error(`Error al actualizar la incidencia: ${error.message}`);
        }
    };

    const goToDetail = (item) => {
        localStorage.setItem('last_created_incidence_id', item.id);
        const r = role?.toLowerCase();
        if (r === 'administrator') navigate('/dashboard/admin/incidencia/detalle');
        else if (r === 'visualizer') navigate('/dashboard/visualizer/incidencia/detalle');
        else navigate('/dashboard/supervisors/incidencia/detalle');
    };

    const truncate = (v, n = 50) => typeof v === 'string' && v.length > n ? v.slice(0, n) + ' . . .' : (v || '—');

    return (
        <div className="p-2 sm:p-4 h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 rounded-xl bg-[#fdfbf5] dark:bg-[#111827] shadow border border-[#e8dfc8] dark:border-white/10 p-3 sm:p-6 flex flex-col gap-4 overflow-hidden">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
                        <FilterCrimer />
                        <StatusFilter />
                        <DateRangeFilter />
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a89878] pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar incidencia..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="h-9 pl-9 pr-3 w-52 text-sm bg-[#fdfbf5] dark:bg-[#1e293b] border border-[#e8dfc8] dark:border-white/10 text-[#3d2f1f] dark:text-white placeholder-[#7a6a52] dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        {!isVisualizer(role) && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="sm:hidden">Agregar Incidencias</span>
                                <span className="hidden sm:inline">Agregar</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <Loading message="Cargando Incidencias" />
                ) : incidents.length > 0 ? (
                    <div className="flex flex-col gap-3 flex-1 min-h-0">
                        <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-[#e8dfc8] dark:border-white/8">
                            <table className="min-w-full divide-y divide-[#e8dfc8] dark:divide-white/8">
                                <thead className="sticky top-0 bg-[#f0e6d0] dark:bg-[#1e293b] z-10">
                                    <tr>
                                        {['Cod.','Nombre','Crimen','Descripción','Placa','Zona','Medio','Fecha','Hora','Estado','Observación','Creado por','Creado en','Actualizado por','Actualizado en','Acciones'].map((h) => (
                                            <th key={h} className={`px-3 py-2.5 text-xs font-semibold text-[#7a6a52] dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${h === 'Acciones' ? 'text-center' : 'text-left'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-[#fdfbf5] dark:bg-[#111827] divide-y divide-[#e8dfc8] dark:divide-white/5">
                                    {incidents.map((item, idx) => (
                                        <tr
                                            key={item.id || idx}
                                            onClick={() => goToDetail(item)}
                                            className="hover:bg-orange-50/50 dark:hover:bg-orange-500/5 cursor-pointer transition-colors"
                                        >
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">{item.code || '—'}</td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300">{truncate(item.name)}</td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">{item.crime?.name ?? '—'}</td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300">{truncate(item.description)}</td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">{item.plate ?? '—'}</td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">{item.zone?.name ?? '—'}</td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">{item.comunication?.name ?? '—'}</td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">{new Date(item.date).toISOString().split('T')[0]}</td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">
                                                {(() => { const d = new Date(item.date); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`; })()}
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[item.status] || 'bg-[#f0e6d0] text-[#7a6a52] dark:bg-white/10 dark:text-gray-400'}`}>
                                                    {STATUS_LABEL[item.status] || item.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300">{truncate(item.observation)}</td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">
                                                {item.user?.deletedAt ? <del className="text-[#a89878]">{item.user.username}</del> : (item.user?.username || '—')}
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">{new Date(item.createdAt).toISOString().split('T')[0]}</td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">
                                                {item.userWhoUpdated ? (item.userWhoUpdated.deletedAt ? <del className="text-[#a89878]">{item.userWhoUpdated.username}</del> : item.userWhoUpdated.username) : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-[#3d2f1f] dark:text-gray-300 whitespace-nowrap">{new Date(item.updatedAt).toISOString().split('T')[0]}</td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex justify-center gap-0.5">
                                                    {!isVisualizer(role) && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedIncidenceId(item.id); setSelectedIncidenceName(item.name); setShowAssignedOperators(true); }}
                                                            title="Cazadores asignados"
                                                            className="p-1.5 rounded-lg hover:bg-[#f0e6d0] dark:hover:bg-white/8 transition-colors"
                                                        >
                                                            <Icon path={icons.mdiAccountGroup} size={0.8} className="text-[#a89878] dark:text-gray-400" />
                                                        </button>
                                                    )}
                                                    {!isVisualizer(role) && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openModalEdit(item); }}
                                                            title="Editar"
                                                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                                        >
                                                            <Icon path={icons.edit} size={0.8} className="text-blue-500 dark:text-blue-400" />
                                                        </button>
                                                    )}
                                                    {!isVisualizer(role) && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); confirmDelete(item, (p) => `${p.code}: ${p.name}`); }}
                                                            title="Eliminar"
                                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <Icon path={icons.delete} size={0.8} className="text-red-500 dark:text-red-400" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-center">
                            <CustomTablePagination count={totalCount} page={currentPage} limit={limit} handlePageLimitChange={handlePageLimitChange} />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <AlertCircle className="h-12 w-12 text-[#a89878] dark:text-gray-500" />
                        <h3 className="text-base font-semibold text-[#3d2f1f] dark:text-white">No hay incidencias registradas</h3>
                        <p className="text-sm text-[#a89878] dark:text-gray-400 max-w-sm">Aún no se han reportado incidencias por parte de los cazadores</p>
                        {!isVisualizer(role) && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Plus className="h-4 w-4" /> Crear primera incidencia
                            </button>
                        )}
                    </div>
                )}
            </div>

            <CreateFormIncidence open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreateIncidencia} />
            <UpdateFormIncidence isOpen={showUpdate} onClose={() => setShowUpdate(false)} data={dataEdit} dataSelect={{ zones, communications }} onSubmit={handleUpdateIncidence} />
            <AssignedOperators isOpen={showAssignedOperators} onClose={() => setShowAssignedOperators(false)} incidenceId={selectedIncidenceId} incidenceName={selectedIncidenceName} />
        </div>
    );
};

export default Incidence;
