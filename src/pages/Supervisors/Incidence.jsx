import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js';
import Loading from '../../components/Loading.jsx';
import { createIncidenceApi, deleteIncidenceApi, getAllIncidenceComunicationApi, getAllIncidencesApi, getAllIncidenceZonesApi, updateIncidenceApi } from '../../api/operador/incidenceApi.jsx';
import CustomTable from '../../components/CustomTable.jsx';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation.jsx';
import UpdateFormIncidence from '../../components/Supervisors/UpdateFormIncidence.jsx';
import { getAllOperatorApi } from '../../api/supervisor/OperatorService.jsx';
import AssignedOperators from '../../components/Supervisors/AssignedOperators.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { Autocomplete, TextField } from '@mui/material';
import CreateFormIncidence from "../../components/Operador/CreateFormIncidence";
import { useSelector } from 'react-redux';
import FilterCrimer from '../../components/Supervisors/FilterCrimer.jsx';
import DateFilter from '../../components/Supervisors/DateFilter.jsx';
import DateRangeFilter from '../../components/Supervisors/DateRangeFilter.jsx';

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
                ...(endDate && { end: endDate })
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
    }, [currentPage, limit, inputValue, JSON.stringify(crimeIds), selectedDate, startDate, endDate]); // Agregar startDate y endDate como dependencias
    
    const handleCreateIncidencia = async (payload) => {
        try {
            const response = await createIncidenceApi(payload);
            const newId = response?.data?.id;
            if (newId) {
                localStorage.setItem("last_created_incidence_id", newId);
                if (role === 'admin') {
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
        <div className="m-4 h-[calc(100vh-2rem)] flex flex-col">
            <div className="bg-white rounded-xl shadow-md p-6 flex-1 flex flex-col">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                    <div className="block">
                        <h2 className="text-2xl font-bold">Incidencias</h2>
                        <p className="text-gray-600">Gestiona y organiza todas tus incidencias</p>
                    </div>
                    <div className='flex flex-col md:flex-row items-center w-full max-w-[90rem] gap-2'>
                        {/* Filtro de rango de fechas */}
                        <DateRangeFilter />
                        
                        {/* Filtro de fecha */}
                        {/* <DateFilter /> */}
                        
                        {/* Filtro de crímenes */}
                        <FilterCrimer />
                        
                        {/* Campo de búsqueda */}
                        <div className="mt-2 md:mt-0 w-full min-w-[100px]">
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
                                    className="w-full h-10 pl-3 pr-3 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        
                        {/* Botón agregar */}
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-2 md:mt-0 ml-0 md:ml-2 cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                            type="button"
                        >
                            <Icon path={icons.add} size={1} />
                            Agregar
                        </button>
                    </div>
                </div>
                <hr className='border-gray-200' />
                <div className="flex-1 flex flex-col min-h-0">
                    {isLoading ? (
                        <Loading message= "Cargando Incidencias"/>
                    ) : 
                        incidents?.length > 0 ?(
                            <CustomTable
                            data={incidents}
                            loading={isLoading}
                            columns={[
                                { label: 'Cod.', key: 'code'},
                                { label: 'Nombre', key: 'name' },
                                { label: 'Crimen', key: 'crime', render: (value) => value.crime?.name ?? '—'},
                                { label: 'Descripción', key: 'description' },
                                { label: 'Zona', key: 'zone', render: (value) => value.zone?.name ?? '—'},
                                { label: 'Medio', key: 'comunication', render: (value) => value.comunication?.name ?? '—'},
                                { label: 'Fecha incidente', key: 'incidentDate', render: (value) =>{return new Date(value.date).toISOString().split('T')[0] }},
                                { label: 'Hora incidente', key: 'incidentTime', 
                                      render: (value) => {
                                        const date = new Date(value.date);
                                        const hours = date.getHours();
                                        const minutes = date.getMinutes().toString().padStart(2, '0');
                                        return `${hours}:${minutes}`;
                                    }  
                                },
                                {
                                    label: 'Estado',
                                    key: 'status',
                                    render: (value) => {
                                        let text = '';
                                        let colorClass = '';

                                        switch (value.status) {
                                            case 'process':
                                                text = 'En Proceso';
                                                colorClass = 'bg-blue-100 text-blue-800';
                                                break;
                                            case 'completed':
                                                text = 'Completado';
                                                colorClass = 'bg-green-100 text-green-800';
                                                break;
                                            case 'finished':
                                                text = 'Finalizado';
                                                colorClass = 'bg-red-100 text-red-800';
                                                break;
                                            default:
                                                text = value.status;
                                                colorClass = 'bg-gray-100 text-gray-800';
                                                break;
                                        }

                                        return (
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass} whitespace-nowrap`}
                                            >
                                                {text}
                                            </span>
                                        );
                                    }
                                },
                                { label: 'Observación', key: 'observation' },
                                {
                                    label: 'Creado por',
                                    key: 'user',
                                    render: (value) => {
                                        const username = value.user?.username || '—';
                                        const isDeleted = !!value.user?.deletedAt;
                                        return isDeleted ? <del className='text-gray-400'>{username}</del> : username;
                                    },
                                },
                                { label: 'creado en ', key: 'createdAt', render: (value) => { return new Date(value.createdAt).toISOString().split('T')[0] }},
                                {
                                    label: 'Actualizado por',
                                    key: 'userIdWhoUpdated',
                                    render: (value) => {
                                        const username = value.userWhoUpdated?.username || '—';
                                        const isDeleted = !!value.userWhoUpdated?.deletedAt;
                                        return value.userWhoUpdated ? (isDeleted ? <del className='text-gray-400'>{username}</del> : username) : '—';
                                    },
                                },
                                { label: 'Actualizado en', key: 'updatedAt', render: (value) => { return new Date(value.updatedAt).toISOString().split('T')[0]} },
                            ]}
                            actions={[
                                {
                                    title: 'Operadores asignados',
                                    onClick: (incidence) => {
                                        setSelectedIncidenceId(incidence.id);
                                        setSelectedIncidenceName(incidence.name);
                                        setShowAssignedOperators(true);
                                    },
                                    icon: <Icon path={icons.mdiAccountGroup} size={0.8} />,
                                    className: 'text-black-600 hover:text-black-800',
                                },
                                {
                                    title: 'Editar',
                                    onClick: openModalEdit,
                                    icon: <Icon path={icons.edit} size={0.8} />,
                                    className: 'text-blue-600 hover:text-blue-800',
                                },
                                {
                                    title: 'Eliminar',
                                    onClick: (op) => confirmDelete(op, (p) => `${p.code}: ${p.name}`),
                                    icon: <Icon path={icons.delete} size={0.8} />,
                                    className: 'text-red-600 hover:text-red-800',
                                },
                            ]}
                            count={totalCount}
                            page={currentPage}
                            limit={limit}
                            handlePageLimitChange={handlePageLimitChange}
                            rowOnClick={(item) => {
                                localStorage.setItem("last_created_incidence_id", item.id);
                                if (role === 'admin') {
                                    navigate("/dashboard/admin/incidencia/detalle");
                                } else {
                                    navigate("/dashboard/supervisors/incidencia/detalle");
                                }
                            }}
                        />
                    ) : (
                        <div>
                            <div className="flex flex-col items-center justify-center max-w-4xl mx-auto h-150">
                                <div className="flex flex-col items-center justify-center">
                                    <Icon path={icons.mdiNoteAlertOutline} size={2} />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No hay incidencias registradas
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Aún no se han reportado incidencias por parte de los operadores
                                    </p>
                                </div>
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
                operators={operators}
                incidenceId={selectedIncidenceId}
                incidenceName={selectedIncidenceName}
            />
        </div>
    );
};

export default Incidence;
