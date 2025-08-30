import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js';
import Loading from '../../components/Loading.jsx';
import { createIncidenceApi, deleteIncidenceApi, getAllIncidenceComunicationApi, getAllIncidencesApi, getAllIncidenceZonesApi, updateIncidenceApi } from '../../api/operador/incidenceApi.jsx';
import CustomTablePagination from '../../components/Pagination/TablePagination.jsx';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation.jsx';
import UpdateFormIncidence from '../../components/Supervisors/UpdateFormIncidence.jsx';
import { getAllOperatorApi } from '../../api/supervisor/OperatorService.jsx';
import AssignedOperators from '../../components/Supervisors/AssignedOperators.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { Autocomplete, TextField } from '@mui/material';
import CreateFormIncidence from "../../components/Operador/CreateFormIncidence";
import { useSelector } from 'react-redux';
import FilterCrimer from '../../components/Supervisors/FilterCrimer.jsx';
import DateRangeFilter from '../../components/Supervisors/DateRangeFilter.jsx';
import StatusFilter from '../../components/Supervisors/StatusFilter.jsx';

const Incidence = () => {
    const { role } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    const [incidents, setIncidents] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [operators, setOperators] = useState([]);
    const [zones, setZones] = useState([]);
    const [communications, setCommunications] = useState([]);
    const [selectedIncidenceId, setSelectedIncidenceId] = useState(null);
    const [selectedIncidenceName, setSelectedIncidenceName] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [showForm, setShowForm] = useState(false);

    const rowsPerPage = 10;

    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);

    const [showUpdate, setShowUpdate] = useState(false);
    const [showAssignedOperators, setShowAssignedOperators] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Obtener parámetros de URL para paginación
    const searchParams = new URLSearchParams(location.search);
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || rowsPerPage;
    const crimeIds = searchParams.getAll('crimeIds') || []; // Obtener array de crimeIds
    const selectedDate = searchParams.get('date') || ''; // Obtener fecha seleccionada
    const startDate = searchParams.get('start') || ''; // Obtener fecha de inicio del rango
    const endDate = searchParams.get('end') || ''; // Obtener fecha de fin del rango
    const selectedStatus = searchParams.get('status') || ''; // Obtener estado seleccionado

    const openModalEdit = (payload) => {
        setDataEdit(payload);
        setShowUpdate(true);
    };

    const fetchZones = async () => {
        try {
            const data = await getAllIncidenceZonesApi();
            setZones(data.data);
        } catch (error) {
            toast.error(` Error al obtener las zonas: ${error.message}`);
        }
    };

    const fetchCommunications = async () => {
        try {
            const data = await getAllIncidenceComunicationApi();
            setCommunications(data.data);
        } catch (error) {
            toast.error(` Error al obtener las zonas: ${error.message}`);
        }
    };

    const fetchIncidents = async () => {
        try {
            setIsLoading(true);
            const params = {
                page: currentPage,
                limit: limit,
                // Agregar búsqueda si hay input
                ...(inputValue.trim() && { search: inputValue.trim() }),
                // Agregar filtro de crímenes si están seleccionados
                ...(crimeIds.length > 0 && { crimeIds: crimeIds }),
                // Agregar filtro de fecha si está seleccionada
                ...(selectedDate && { date: selectedDate }),
                // Agregar filtro de rango de fechas si están seleccionadas
                ...(startDate && { start: startDate }),
                ...(endDate && { end: endDate }),
                // Agregar filtro de estado si está seleccionado
                ...(selectedStatus && { status: selectedStatus })
            };

            const response = await getAllIncidencesApi(params);
            // La respuesta tiene estructura: { data: { data: [...], totalCount: ..., totalPages: ... } }
            const incidentsData = response.data.data || [];
            setIncidents(incidentsData);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            toast.error(`Error al obtener las incidencias: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOperators = async () => {
        try {
            const data = await getAllOperatorApi();
            setOperators(data.data);
        } catch (error) {
            toast.error(`Error al obtener operadores: ${error.message}`);
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
        // Solo cargar datos auxiliares en el primer mount
        // fetchIncidents se maneja en los otros useEffect
        fetchOperators();
        fetchZones();
        fetchCommunications();
    }, []);

    // Función para manejar cambio de página/límite
    const handlePageLimitChange = (newPage, newLimit) => {
        const searchParams = new URLSearchParams(location.search);

        if (newLimit !== limit) {
            searchParams.set('limit', newLimit.toString());
            searchParams.set('page', '1'); // Reset a página 1 cuando cambia el límite
        } else {
            searchParams.set('page', newPage.toString());
        }

        navigate({ search: searchParams.toString() });
    };

    // Ejecutar fetchIncidents cuando cambien las dependencias
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchIncidents();
        }, inputValue ? 500 : 0); // Debounce solo si hay búsqueda

        return () => clearTimeout(timer);
    }, [currentPage, limit, inputValue, JSON.stringify(crimeIds), selectedDate, startDate, endDate, selectedStatus]); // Agregar selectedStatus como dependencia

    const handleCreateIncidencia = async (payload) => {
        try {
            const response = await createIncidenceApi(payload);
            const newId = response?.data?.id;
            if (newId) {
                localStorage.setItem("last_created_incidence_id", newId);
                const normalizedRole = role?.toLowerCase();
                if (normalizedRole === 'administrator') {
                    navigate("/dashboard/admin/incidencia/detalle");
                } else {
                    navigate("/dashboard/supervisors/incidencia/detalle");
                }
            }

            await fetchIncidents();
            setShowForm(false);
        } catch (err) {
            toast.error("Error al crear incidencia: " + err.message);
            console.error("Error al crear incidencia:", err);
        }
    };

    const handleUpdateIncidence = async (payload) => {
        try {
            await updateIncidenceApi(payload, payload.id);
            await fetchIncidents();
            setShowUpdate(false);
            toast.success('Incidencia actualizada exitosamente!');
        } catch (error) {
            toast.error(` Error al actualizar la incidencia: ${error.message}`);
        }
    }

    return (
        <div className="m-2 sm:m-4 h-[calc(90vh-1rem)] sm:h-auto flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-6 flex-1 flex flex-col transition-colors duration-200">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6">
                    <div className="block mb-4 lg:mb-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Incidencias</h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 transition-colors duration-200">Gestiona y organiza todas tus incidencias</p>
                    </div>
                    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end w-full lg:max-w-[60rem] xl:max-w-[70rem] gap-2 mt-2 sm:mt-0'>
                        
                        {/* Filtro de crímenes */}
                        <FilterCrimer />

                        {/* Filtro de estado */}
                        <StatusFilter />

                        {/* Filtro de rango de fechas */}
                        <DateRangeFilter />
                        
                        {/* Campo de búsqueda */}
                        <div className="w-full sm:flex-1 sm:min-w-[200px] lg:max-w-[300px]">
                            <div className='relative w-full'>
                                <Icon
                                    path={icons.searchIcon}
                                    size={0.8}
                                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10'
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar incidencia..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="w-full h-10 pl-3 pr-3 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Botón agregar */}
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full sm:w-auto cursor-pointer flex flex-row items-center justify-center text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out whitespace-nowrap"
                            type="button"
                        >   <Icon path={icons.add} size={1} />
                            <span className="block sm:hidden">Agregar Incidencias</span>
                            <span className="hidden sm:block"> Agregar</span>
                        </button>
                    </div>
                </div>
                {/* <hr className='border-gray-200' /> */}
                <div className="flex-1 flex flex-col min-h-0">
                    {isLoading ? (
                        <Loading message="Cargando Incidencias" />
                    ) :
                        incidents?.length > 0 ? (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* Paginación superior */}
                                {/* <div className="flex justify-center items-center mb-3">
                                    <CustomTablePagination
                                        count={totalCount}
                                        page={currentPage}
                                        limit={limit}
                                        handlePageLimitChange={handlePageLimitChange}
                                    />
                                </div> */}

                                {/* Tabla */}
                                <div className="overflow-x-auto shadow rounded-lg max-h-[67vh] h-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
                                        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10 transition-colors duration-200">
                                            <tr>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Cod.</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Nombre</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Crimen</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Descripción</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Zona</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Medio</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Fecha incidente</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Hora incidente</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Estado</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Observación</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Creado por</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Creado en</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Actualizado por</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Actualizado en</th>
                                                <th className="px-3 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200" style={{ textAlign: 'center' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                                            {incidents.map((item, idx) => (
                                                <tr
                                                    key={item.id || idx}
                                                    className="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                                                    onClick={() => {
                                                        localStorage.setItem("last_created_incidence_id", item.id);
                                                        const normalizedRole = role?.toLowerCase();
                                                        if (normalizedRole === 'administrator') {
                                                            navigate("/dashboard/admin/incidencia/detalle");
                                                        } else {
                                                            navigate("/dashboard/supervisors/incidencia/detalle");
                                                        }
                                                    }}
                                                >
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {item.code || '—'}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {(() => {
                                                            const value = item.name || '—';
                                                            return typeof value === 'string' && value.length > 50 ? value.slice(0, 50) + ' . . .' : value;
                                                        })()}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {item.crime?.name ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-1  text-xs text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {(() => {
                                                            const value = item.description || '—';
                                                            return typeof value === 'string' && value.length > 50 ? value.slice(0, 50) + ' . . .' : value;
                                                        })()}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {item.zone?.name ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {item.comunication?.name ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {new Date(item.date).toISOString().split('T')[0]}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {(() => {
                                                            const date = new Date(item.date);
                                                            const hours = date.getHours();
                                                            const minutes = date.getMinutes().toString().padStart(2, '0');
                                                            return `${hours}:${minutes}`;
                                                        })()}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {(() => {
                                                            let text = '';
                                                            let colorClass = '';

                                                            switch (item.status) {
                                                                case 'process':
                                                                    text = 'En Proceso';
                                                                    colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200';
                                                                    break;
                                                                case 'completed':
                                                                    text = 'Completado';
                                                                    colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200';
                                                                    break;
                                                                case 'finished':
                                                                    text = 'Finalizado';
                                                                    colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
                                                                    break;
                                                                default:
                                                                    text = item.status;
                                                                    colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
                                                                    break;
                                                            }

                                                            return (
                                                                <span
                                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass} whitespace-nowrap`}
                                                                >
                                                                    {text}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {(() => {
                                                            const value = item.observation || '—';
                                                            return typeof value === 'string' && value.length > 50 ? value.slice(0, 50) + ' . . .' : value;
                                                        })()}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {(() => {
                                                            const username = item.user?.username || '—';
                                                            const isDeleted = !!item.user?.deletedAt;
                                                            return isDeleted ? <del className='text-gray-400'>{username}</del> : username;
                                                        })()}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {new Date(item.createdAt).toISOString().split('T')[0]}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {(() => {
                                                            const username = item.userWhoUpdated?.username || '—';
                                                            const isDeleted = !!item.userWhoUpdated?.deletedAt;
                                                            return item.userWhoUpdated ? (isDeleted ? <del className='text-gray-400'>{username}</del> : username) : '—';
                                                        })()}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors duration-200">
                                                        {new Date(item.updatedAt).toISOString().split('T')[0]}
                                                    </td>
                                                    <td className="px-3 py-1  text-sm text-gray-800 dark:text-gray-200 space-x-2 transition-colors duration-200">
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedIncidenceId(item.id);
                                                                    setSelectedIncidenceName(item.name);
                                                                    setShowAssignedOperators(true);
                                                                }}
                                                                title="Operadores asignados"
                                                                className="cursor-pointer p-1"
                                                            >
                                                                <Icon
                                                                    path={icons.mdiAccountGroup}
                                                                    size={1}
                                                                    className="text-black-600 dark:text-gray-300 hover:text-black-800 dark:hover:text-white"
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openModalEdit(item);
                                                                }}
                                                                title="Editar"
                                                                className="cursor-pointer p-1"
                                                            >
                                                                <Icon
                                                                    path={icons.edit}
                                                                    size={1}
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    confirmDelete(item, (p) => `${p.code}: ${p.name}`);
                                                                }}
                                                                title="Eliminar"
                                                                className="cursor-pointer p-1"
                                                            >
                                                                <Icon
                                                                    path={icons.delete}
                                                                    size={1}
                                                                    className="text-red-600 hover:text-red-800"
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación inferior */}
                                <div className="flex justify-center items-center mt-3">
                                    <CustomTablePagination
                                        count={totalCount}
                                        page={currentPage}
                                        limit={limit}
                                        handlePageLimitChange={handlePageLimitChange}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="flex flex-col items-center justify-center text-center px-4 py-8">
                                    <Icon path={icons.mdiNoteAlertOutline} size={2} className="mb-4 text-gray-400" />
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                                        No hay incidencias registradas
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md">
                                        Aún no se han reportado incidencias por parte de los operadores
                                    </p>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-[#32A3B5] text-white rounded-lg text-sm font-medium transition-colors duration-200"
                                    >
                                        Crear primera incidencia
                                    </button>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>

            <CreateFormIncidence
                open={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreateIncidencia}
            />

            <UpdateFormIncidence
                isOpen={showUpdate}
                onClose={() => setShowUpdate(false)}
                data={dataEdit}
                dataSelect={{ zones, communications }}
                onSubmit={handleUpdateIncidence}
            />

            <AssignedOperators
                isOpen={showAssignedOperators}
                onClose={() => setShowAssignedOperators(false)}
                incidenceId={selectedIncidenceId}
                incidenceName={selectedIncidenceName}
            />
        </div>
    );
};

export default Incidence;
