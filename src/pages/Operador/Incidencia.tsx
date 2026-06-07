import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary';
import { useEffect, useState, useCallback } from 'react';
import { useIncidenceSocket } from '../../hooks/useIncidenceSocket';
import CreateFormIncidence from '../../components/Operador/CreateFormIncidence';
import CardFormIncidence from '../../components/Operador/CardFormIncidence';
import KanbanIncidencias from '../../components/Operador/KanbanIncidencias';
import { useNavigate } from 'react-router-dom';
import { getAllIncidencesApi, createIncidenceApi } from '../../api/operador/incidenceApi';
import CreateFirstEntity from '../../components/CreateFirstEntity';
import Loading from '../../components/Loading';
import { toast } from 'sonner';
import { Autocomplete, TextField } from '@mui/material';
import { LayoutGrid, KanbanSquare, Plus } from 'lucide-react';
import { useSetPageTitle } from '../../contexts/PageTitleContext';

const IncidenciaOperador = () => {
    useSetPageTitle('Incidencias', 'Mis incidencias asignadas');
    const [showForm, setShowForm] = useState(false);
    const [incidencias, setIncidencias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [selectedIncidencia, setSelectedIncidencia] = useState(null);
    const [viewMode, setViewMode] = useState('kanban');
    const navigate = useNavigate();

    const fetchIncidencias = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const response = await getAllIncidencesApi({ page: 0, limit: 100 });
            setIncidencias(response.data?.data || response.data || []);
        } catch (error) {
            if (!silent) console.error('Error al obtener incidencias:', error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, []);

    const handleCreateIncidencia = async (payload) => {
        try {
            const response = await createIncidenceApi(payload);
            const newId = response?.data?.id;
            if (newId) {
                localStorage.setItem('last_created_incidence_id', newId);
                navigate('/dashboard/cazador/incidencia/detalle');
            }
            await fetchIncidencias();
            setShowForm(false);
        } catch (err) {
            toast.error('Error al crear incidencia: ' + err.message);
        }
    };

    const handleIncidenciaUpdate = (incidenciaId, nuevoEstado) => {
        setIncidencias((prev) =>
            prev.map((inc) => (inc.id === incidenciaId ? { ...inc, status: nuevoEstado } : inc))
        );
    };

    useEffect(() => {
        fetchIncidencias();
    }, [fetchIncidencias]);

    useIncidenceSocket(() => fetchIncidencias(true));

    const incidenciasFiltradas = selectedIncidencia
        ? [selectedIncidencia]
        : inputValue.trim()
            ? incidencias.filter((inc) =>
                inc.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
                inc.code?.toLowerCase().includes(inputValue.toLowerCase())
            )
            : incidencias;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loading message="Cargando incidencias..." />
            </div>
        );
    }

    if (incidencias.length === 0) {
        return (
            <div className="m-4">
                <div className="rounded-xl bg-slate-50 dark:bg-[#111827] shadow border border-gray-200 dark:border-white/10 p-6">
                    <CreateFirstEntity
                        title="No hay incidencias registradas"
                        body="Comienza creando tu primera incidencia para organizar tus registros"
                        button="Crear primera incidencia"
                        onCreate={() => setShowForm(true)}
                    />
                </div>
                <CreateFormIncidence open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreateIncidencia} />
            </div>
        );
    }

    /* ── Kanban view (default) ─────────────────────────────────── */
    if (viewMode === 'kanban') {
        return (
            <>
                <KanbanIncidencias
                    incidencias={incidencias}
                    onIncidenciaUpdate={handleIncidenciaUpdate}
                    onAddIncidencia={() => setShowForm(true)}
                />
                <CreateFormIncidence open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreateIncidencia} />
            </>
        );
    }

    /* ── Cards view ────────────────────────────────────────────── */
    return (
        <div className="p-4 h-[calc(100vh-5rem)] flex flex-col">
            <div className="flex-1 min-h-0 rounded-xl bg-slate-50 dark:bg-[#111827] shadow border border-gray-200 dark:border-white/10 p-6 flex flex-col">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:max-w-[32rem]">
                        {/* View toggle */}
                        <div className="flex bg-gray-100 dark:bg-white/8 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    viewMode === 'kanban'
                                        ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <KanbanSquare className="h-3.5 w-3.5" /> Kanban
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    viewMode === 'cards'
                                        ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" /> Cards
                            </button>
                        </div>

                        <Autocomplete
                            freeSolo
                            options={incidencias}
                            value={null}
                            inputValue={inputValue}
                            onInputChange={(_, newInputValue) => {
                                setInputValue(newInputValue);
                                if (newInputValue === '') setSelectedIncidencia(null);
                            }}
                            onChange={(_, newValue) => {
                                if (typeof newValue === 'string') {
                                    setInputValue(newValue);
                                    setSelectedIncidencia(null);
                                } else if (newValue) {
                                    setInputValue(newValue.code ? `${newValue.code} - ${newValue.name}` : newValue.name);
                                    setSelectedIncidencia(newValue);
                                } else {
                                    setInputValue('');
                                    setSelectedIncidencia(null);
                                }
                            }}
                            getOptionLabel={(option) => option?.code ? `${option.code} - ${option.name}` : option?.name || ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            sx={{ flex: 1 }}
                            renderInput={(params) => <TextField {...params} label="Buscar incidencia" size="small" />}
                        />

                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" /> Agregar
                        </button>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-auto mt-4">
                    <CardFormIncidence incidencias={incidenciasFiltradas} />
                </div>
            </div>

            <CreateFormIncidence open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreateIncidencia} />
        </div>
    );
};

export default IncidenciaOperador;
