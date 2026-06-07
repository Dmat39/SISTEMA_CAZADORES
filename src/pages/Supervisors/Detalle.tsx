import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidenceByIdApi } from '../../api/operador/incidenceApi';
import { updateIncidenceApi } from '../../api/supervisor/IncidenceApi';
import { createSubRegistroIncidenceApi } from '../../api/operador/registroIncidenceApi';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary';
import dayjs from 'dayjs';
import RegistrosList from '../../components/Supervisors/IncidenciaDetalles';
import CreateFormRegister from '../../components/Supervisors/CreateFormRegister';
import { toast } from 'sonner';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ArrowLeft, Plus, Calendar, Clock, Info } from 'lucide-react';
import { useSetPageTitle } from '../../contexts/PageTitleContext';

const STATUS_MAP = {
    previous:  { label: 'En Proceso',  classes: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400' },
    process:   { label: 'En Proceso',  classes: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400' },
    completed: { label: 'Completado',  classes: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400' },
    finished:  { label: 'Finalizado',  classes: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400' },
};

const getStatus = (s) => STATUS_MAP[s] || { label: s, classes: 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300' };

const IncidenciaDetalles = () => {
    useSetPageTitle('Detalle de Incidencia', 'Seguimiento y registros');
    const [incidencia, setIncidencia] = useState(null);
    const [showRegistroForm, setShowRegistroForm] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const navigate = useNavigate();

    const fetchIncidencia = async () => {
        const id = localStorage.getItem('last_created_incidence_id');
        if (!id) { toast.error('No se encontró el ID de la incidencia'); return; }
        try {
            const response = await getIncidenceByIdApi(id);
            setIncidencia(response.data);
        } catch (error) {
            toast.error('Error al cargar los detalles de la incidencia');
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!incidencia?.id || updatingStatus) return;
        setUpdatingStatus(true);
        try {
            await updateIncidenceApi(incidencia.id, { status: newStatus });
            setIncidencia((prev) => ({ ...prev, status: newStatus }));
            toast.success(`Estado actualizado a "${getStatus(newStatus).label}"`);
        } catch (err: any) {
            toast.error(err?.message ?? 'Error al actualizar el estado');
        } finally {
            setUpdatingStatus(false);
        }
    };

    useEffect(() => { fetchIncidencia(); }, []);

    if (!incidencia) {
        return (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-500 dark:text-gray-400">
                <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                <span className="text-sm">Cargando detalle de incidencia . . .</span>
            </div>
        );
    }

    const formattedDate = dayjs(incidencia.date).format('YYYY-MM-DD');
    const formattedTime = dayjs(incidencia.date).format('HH:mm');
    const createdAt = dayjs(incidencia.createdAt).format('D [de] MMMM [de] YYYY');
    const statusInfo = getStatus(incidencia.status);

    const handleRegistroSubmit = async (formData) => {
        try {
            if (!(formData instanceof FormData)) return;
            await createSubRegistroIncidenceApi(formData);
            toast.success('Registro agregado exitosamente');
            setShowRegistroForm(false);
            await fetchIncidencia();
        } catch (err) {
            toast.error('Error al guardar el registro: ' + err.message);
        }
    };

    return (
        <div className="px-4 py-6">
            <div className="rounded-xl bg-slate-50 dark:bg-[#111827] shadow border border-gray-200 dark:border-white/10 p-6">

                {/* Header */}
                <div className="border-b border-gray-200 dark:border-white/10 pb-5 mb-6">
                    {/* Back */}
                    <button
                        onClick={() => navigate('/dashboard/supervisors/incidencia')}
                        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </button>

                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                        <div className="flex flex-col gap-3">
                            {/* Title + Status */}
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{incidencia.name}</h1>

                                {/* Status selector */}
                                <div className="relative inline-flex">
                                    <select
                                        value={incidencia.status || 'process'}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        disabled={updatingStatus}
                                        className={`appearance-none text-xs font-semibold px-3 py-1 pr-7 rounded-full border-0 cursor-pointer outline-none transition-all ${statusInfo.classes} ${updatingStatus ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="process">En Proceso</option>
                                        <option value="completed">Completado</option>
                                        <option value="finished">Finalizado</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                        <Icon
                                            path={updatingStatus ? icons.loading : icons.chevronDown}
                                            size={0.5}
                                            className={updatingStatus ? 'animate-spin' : ''}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Fecha: {formattedDate}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" /> Hora: {formattedTime}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Info className="h-3.5 w-3.5" /> Creado el {createdAt}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={() => setShowRegistroForm(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                            <Plus className="h-4 w-4" /> Agregar Registro
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div className="rounded-lg bg-gray-100 dark:bg-[#1e293b] border border-gray-200 dark:border-white/8 p-4 mb-6 min-h-[80px]">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {incidencia.description || 'Sin descripción disponible.'}
                    </p>
                </div>

                {/* Records */}
                <RegistrosList records={incidencia.records || []} />
            </div>

            {showRegistroForm && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <CreateFormRegister
                        incidenceId={incidencia.id}
                        onClose={() => setShowRegistroForm(false)}
                        onSubmit={handleRegistroSubmit}
                    />
                </LocalizationProvider>
            )}
        </div>
    );
};

export default IncidenciaDetalles;
