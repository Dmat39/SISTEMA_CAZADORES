import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js';
import Loading from '../../components/Loading.jsx';
import { deleteIncidenceApi, getAllIncidencesApi, updateIncidenceApi } from '../../api/operador/incidenceApi.jsx';
import TableForm from '../../components/TableForm.jsx';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation.jsx';
import UpdateFormIncidence from '../../components/Supervisors/UpdateFormIncidence.jsx';
import OperatorAssignmentForm from '../../components/Supervisors/OperatorAssignmentForm.jsx';
import { getAllOperatorApi } from '../../api/supervisor/OperatorService.jsx';
import { assignOperatorApi } from '../../api/supervisor/SupervidorService.jsx';

const Incidence = () => {
    const [incidents, setIncidents] = useState([]);
    const [operators, setOperators] = useState([]);
    const [selectedIncidenceId, setSelectedIncidenceId] = useState(null);

    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);
    
    const [showUpdate, setShowUpdate] = useState(false);
    const [showAssignOperator, setShowAssignOperator] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const openModalEdit = (payload) => {
        setDataEdit(payload);
        setShowUpdate(true);
    };

    const fetchIncidents = async () => {
        try {
            setIsLoading(true);
            const data = await getAllIncidencesApi();
            setIncidents(data.data);
        } catch (error) {
            toast.error(` Error al obtener las incidencias: ${error.message}`);
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
        fetchIncidents();
        fetchOperators();
    }, []);
        
    const handleUpdateIncidence = async (payload) => {
        try {
            await updateIncidenceApi(payload, payload.id);
            await fetchOperators();
            setShowUpdate(false);
            toast.success('Incidencia actualizada exitosamente!');
        } catch (error) {
            toast.error(` Error al actualizar la incidencia: ${error.message}`);
        }
    }
    
    const handleAssignOperator = async (newAssign) => {
        try {
            await assignOperatorApi(newAssign);
            await fetchIncidents();
            setShowAssignOperator(false);
            toast.success('Incidencia assignada a un nuevo operador exitosamente!');
        } catch (error) {
            toast.error(` Error al asignar la incidencia: ${error.message}`);
        }
    };

    return (
        <div className="m-4">
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="block">
                        <h2 className="text-2xl font-bold">Incidencias</h2>
                        <p className="text-gray-600">Gestiona y organiza todas tus incidencias</p>
                    </div>
                </div>
                <hr className='border-gray-200' />
                {isLoading ? (
                    <Loading message= "Cargando Operadores"/>
                ) : 
                    incidents.length > 0 ?(
                        <TableForm
                            data={incidents}
                            columns={[
                                { label: 'Cod.', key: 'code' },
                                { label: 'Nombre', key: 'name' },
                                { label: 'Descripción', key: 'description' },
                                { label: 'Fecha incidente', key: 'date', render: (value) =>{return new Date(value.date).toISOString().split('T')[0] }},
                                { label: 'Hora incidente', key: 'date', 
                                      render: (value) => {
                                        const date = new Date(value.date);
                                        const hours = date.getHours();
                                        const minutes = date.getMinutes().toString().padStart(2, '0');
                                        const ampm = hours >= 12 ? 'PM' : 'AM';
                                        const hour12 = hours % 12 || 12;
                                        return `${hour12}:${minutes} ${ampm}`;
                                    }  
                                },
                                { label: 'Estado', key: 'status', render: (value) =>{
                                    switch(value.status){
                                        case "process": return 'En Proceso';
                                        case "completed": return 'Completado';
                                        case "finished": return 'Finalizado';
                                        default: return value.status;
                                    }
                                }},
                                { label: 'Observación', key: 'observation' },
                                { label: 'Creado por', key: 'user', render: (value) => {return value.user.username} },
                                { label: 'creado en ', key: 'createdAt', render: (value) => { return new Date(value.createdAt).toISOString().split('T')[0] }},
                                { label: 'Actualizado por', key: 'userIdWhoUpdated', render: (value) => value.userWhoUpdated?.username ?? '—'},
                                { label: 'Actualizado en', key: 'updatedAt', render: (value) => { return new Date(value.updatedAt).toISOString().split('T')[0]} },
                            ]}
                            actions={[
                                {
                                    title: 'Asignar a un nuevo operador',
                                    onClick: (incidence) => {
                                        setSelectedIncidenceId(incidence.id);
                                        setShowAssignOperator(true);
                                    },
                                    icon: icons.mdiAccountMultiplePlus,
                                    className: 'text-black-600 hover:text-black-800',
                                },
                                {
                                    title: 'Editar',
                                    onClick: openModalEdit,
                                    icon: icons.edit,
                                    className: 'text-blue-600 hover:text-blue-800',
                                },
                                {
                                    title: 'Eliminar',
                                    onClick: (op) => confirmDelete(op, (p) => `${p.code}: ${p.name}`),
                                    icon: icons.delete,
                                    className: 'text-red-600 hover:text-red-800',
                                },
                            ]}
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

            <UpdateFormIncidence
                isOpen={showUpdate}
                onClose={() => setShowUpdate(false)}
                data={dataEdit}
                onSubmit={handleUpdateIncidence}
            />

            <OperatorAssignmentForm
                isOpen={showAssignOperator}
                onClose={() => setShowAssignOperator(false)}
                onSubmit={handleAssignOperator}
                operators={operators}
                incidenceId={selectedIncidenceId}
            />
        </div>
    );
};

export default Incidence;
