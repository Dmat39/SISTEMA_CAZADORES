import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js';
import Loading from '../../components/Loading.jsx';
import CreateFirstEntity from '../../components/CreateFirstEntity.jsx';
import { createIncidenceApi, deleteIncidenceApi, getAllIncidencesApi, updateIncidenceApi } from '../../api/operador/incidenceApi.jsx';
import TableForm from '../../components/TableForm.jsx';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation.jsx';
import UpdateFormIncidence from '../../components/Supervisors/UpdateFormIncidence.jsx';
import CreateFormIncidence from '../../components/Supervisors/CreateFormIncidence.jsx';

const Incidence = () => {
    const [incidents, setIncidents] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);

    const [showUpdate, setShowUpdate] = useState(false);
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

    const confirmDelete = useDeleteConfirmation({
        fetchData: fetchIncidents,
        deleteApiFn: deleteIncidenceApi,
        entityName: 'incidence',
    });

    const updateIncidence = async (payload) => {
        try {
            await updateIncidenceApi(payload, payload.id);
            toast.success('Incidencia actualizada exitosamente!');
        } catch (error) {
            toast.error(` Error al actualizar la incidencia: ${error.message}`);
        }
    }

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        fetchIncidents();
    }, []);

    const handleCreate = async (newIncidence) => {
        try {
            await createIncidenceApi(newIncidence);
            await fetchIncidents();
            setShowCreate(false);
            toast.success('Incidencia creada exitosamente!');
        } catch (error) {
            toast.error(` Error al crear al incidencia: ${error.message}`);
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
                    {incidents.length > 0 ?(
                        <button
                            onClick={() => setShowCreate(true)}
                            className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                            type="button"
                        >
                            <Icon path={icons.add} size={1} />
                            Agregar Incidencia
                        </button>                        
                    ) : null}
                </div>
                <hr className='border-gray-200' />
                {isLoading ? (
                    <Loading message= "Cargando Operadores"/>
                ) : 
                    incidents.length > 0 ?(
                        <TableForm
                            data={incidents}
                            onEdit={openModalEdit}
                            onDelete={(op) => confirmDelete(op, (p) => `${p.name} ${p.lastname}`)}
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
                        />
                    ) : (
                        <CreateFirstEntity 
                            title="No hay incidencias" 
                            body="Comienza creando tu primer incidencia para organizar tus registros" 
                            button="Crear primer incidencia" onCreate={() => setShowCreate(true)}
                        />
                    )
                }
            </div>

            <UpdateFormIncidence
                isOpen={showUpdate}
                onClose={() => setShowUpdate(false)}
                data={dataEdit}
                onSubmit={async (updatedOperator) => {
                    await updateIncidence(updatedOperator);
                    await fetchIncidents();
                    setShowUpdate(false);
                }}
            />

            <CreateFormIncidence
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreate}
            />
        </div>
    );
};

export default Incidence;
