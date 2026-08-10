import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getIncidenceByIdApi, updateIncidenceApi, getAllIncidenceZonesApi, getAllIncidenceComunicationApi, getIncidenceCodesApi } from '../../api/operador/incidenceApi';
import { createSubRegistroIncidenceApi } from '../../api/operador/registroIncidenceApi';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary';
import dayjs from 'dayjs';
import RegistrosList from '../../components/Operador/IncidenciaDetalles';
import CreateFormRegister from '../../components/Operador/CreateFormRegister';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import UpdateCodeModal from '../../components/Operador/UpdateCodeModal';
import UpdateFormIncidence from '../../components/Supervisors/UpdateFormIncidence';
import { toast } from 'sonner';
import { isVisualizer } from '../../lib/utils.js';
import { ArrowLeft, Plus, Calendar, Clock, Info, Pencil } from 'lucide-react';
import { useSetPageTitle } from '../../contexts/PageTitleContext';
import { KANBAN_STATES } from '../../components/Operador/kanban/kanbanConfig';

const formatStatus = (s) => {
    const config = KANBAN_STATES[s];
    if (!config) return { text: s, color: 'bg-[#f0e6d0] text-[#3d2f1f] dark:bg-white/10 dark:text-gray-300' };
    return { text: config.titulo, color: `${config.solidColor} text-white` };
};

const IncidenciaDetalles = () => {
    useSetPageTitle('Detalle de Incidencia', 'Seguimiento y registros');
    const [incidencia, setIncidencia] = useState(null);
    const [showRegistroForm, setShowRegistroForm] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [dataSelect, setDataSelect] = useState({ zones: [], communications: [] });
    const [externalId, setExternalId] = useState(null);
    const navigate = useNavigate();
    const hasFetched = useRef(false);
    const { role } = useSelector((state) => state.auth);
    const readOnly = isVisualizer(role);

    const fetchIncidencia = useCallback(async () => {
        const id = localStorage.getItem('last_created_incidence_id');
        if (!id) return;
        try {
            const response = await getIncidenceByIdApi(id);
            setIncidencia(response.data);
        } catch (error) {
            toast.error('Error al cargar los detalles de la incidencia: ' + error.message);
        }
    }, []);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchIncidencia();
    }, [fetchIncidencia]);

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

    const handleOpenEdit = async () => {
        if (!dataSelect.zones.length) {
            try {
                const [zonesRes, commsRes] = await Promise.all([
                    getAllIncidenceZonesApi(),
                    getAllIncidenceComunicationApi(),
                ]);
                setDataSelect({ zones: zonesRes.data || [], communications: commsRes.data || [] });
            } catch { /* silent */ }
        }
        setShowEditForm(true);
    };

    const handleUpdateIncidence = async (payload) => {
        try {
            await updateIncidenceApi(payload, payload.id);
            toast.success('Incidencia actualizada exitosamente');
            setShowEditForm(false);
            await fetchIncidencia();
        } catch (err: any) {
            toast.error(`Error al actualizar: ${err?.message || 'Error desconocido'}`);
        }
    };

    const handleRegistroSubmit = async (formData) => {
        try {
            if (!(formData instanceof FormData)) return;
            await createSubRegistroIncidenceApi(formData);
            toast.success('Registro creado exitosamente');
            setShowRegistroForm(false);
            await fetchIncidencia();
        } catch (err) {
            toast.error('Error al guardar el registro: ' + err.message);
        }
    };

    if (!incidencia) {
        return (
            <div className="flex items-center justify-center gap-3 py-20 text-[#a89878] dark:text-gray-400">
                <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                <span className="text-sm">Cargando detalle de incidencia . . .</span>
            </div>
        );
    }

    const { id, name, status, code, comunication, zone, crime, description, date: dateString, createdAt: createdAtString, records = [] } = incidencia;
    const statusInfo = formatStatus(status);
    const formattedDate = dayjs(dateString).format('YYYY-MM-DD');
    const formattedTime = dayjs(dateString).format('HH:mm');
    const createdDate = dayjs(createdAtString).format('D [de] MMMM [de] YYYY');

    return (
        <div className="px-4 py-6">
            <div className="rounded-xl bg-[#fdfbf5] dark:bg-[#111827] shadow border border-[#e8dfc8] dark:border-white/10 p-6">

                {/* Header */}
                <div className="border-b border-[#e8dfc8] dark:border-white/10 pb-5 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-[#a89878] dark:text-gray-400 hover:text-[#3d2f1f] dark:hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </button>

                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                        <div className="flex flex-col gap-3">
                            {/* Title + badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold text-[#3d2f1f] dark:text-white">{name}</h1>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}>
                                    {statusInfo.text}
                                </span>
                                <span
                                    onClick={() => { if (!readOnly) setShowCodeModal(true); }}
                                    className={`text-xs font-medium px-3 py-1 rounded-full bg-[#f0e6d0] dark:bg-white/10 text-[#7a6a52] dark:text-gray-300 ${readOnly ? '' : 'cursor-pointer hover:bg-[#e8dfc8] dark:hover:bg-white/15 transition-colors'}`}
                                >
                                    {code || 'Sin Código'}
                                </span>
                                {code && !readOnly && (
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={externalId ? `http://10.10.40.10:8081/incidencias/${externalId}` : '#'}
                                        className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 transition-colors"
                                    >
                                        Ver Detalle
                                    </a>
                                )}
                            </div>

                            {/* Meta row 1 */}
                            <div className="flex flex-wrap items-center gap-5 text-sm text-[#a89878] dark:text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <Icon path={icons.attach} size={0.7} /> Medio: {comunication?.name || 'Sin medio'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Icon path={icons.map} size={0.7} /> Zona: {zone?.name || 'Sin zona'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Icon path={icons.mdiHandcuffs} size={0.7} /> Crimen: {crime?.name || 'Sin crimen'}
                                </span>
                            </div>

                            {/* Meta row 2 */}
                            <div className="flex flex-wrap items-center gap-5 text-sm text-[#a89878] dark:text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Fecha: {formattedDate}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" /> Hora: {formattedTime}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Info className="h-3.5 w-3.5" /> Creado el {createdDate}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        {!readOnly && (
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={handleOpenEdit}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-[#f0e6d0] dark:bg-white/10 hover:bg-[#e8dfc8] dark:hover:bg-white/15 text-[#7a6a52] dark:text-gray-300 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                                >
                                    <Pencil className="h-4 w-4" /> Editar
                                </button>
                                <button
                                    onClick={() => setShowRegistroForm(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                                >
                                    <Plus className="h-4 w-4" /> Agregar Registro
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="rounded-lg bg-[#f0e6d0] dark:bg-[#1e293b] border border-[#e8dfc8] dark:border-white/8 p-4 mb-6">
                    <h3 className="text-sm font-semibold text-[#7a6a52] dark:text-gray-300 mb-2">Descripción</h3>
                    <div className="max-h-40 overflow-y-auto">
                        <p className="text-sm text-[#7a6a52] dark:text-gray-400 leading-relaxed">
                            {description || 'Sin descripción disponible.'}
                        </p>
                    </div>
                </div>

                {/* Records */}
                <RegistrosList records={records} fetchRecords={fetchIncidencia} readOnly={readOnly} />
            </div>

            {!readOnly && showRegistroForm && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <CreateFormRegister
                        incidenceId={id}
                        onClose={() => setShowRegistroForm(false)}
                        onSubmit={handleRegistroSubmit}
                    />
                </LocalizationProvider>
            )}

            {!readOnly && (
                <UpdateCodeModal
                    isOpen={showCodeModal}
                    onClose={() => setShowCodeModal(false)}
                    data={incidencia}
                    onSubmit={async (payload) => {
                        try {
                            await updateIncidenceApi(payload, payload.id);
                            fetchIncidencia();
                        } catch (err) {
                            toast.error(`Error actualizando código: ${err?.response?.data?.message || err.message || 'Error desconocido'}`);
                        }
                    }}
                />
            )}

            {!readOnly && showEditForm && (
                <UpdateFormIncidence
                    isOpen={showEditForm}
                    onClose={() => setShowEditForm(false)}
                    data={incidencia}
                    onSubmit={handleUpdateIncidence}
                    dataSelect={dataSelect}
                />
            )}
        </div>
    );
};

export default IncidenciaDetalles;
