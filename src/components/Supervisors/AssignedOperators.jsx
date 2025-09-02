import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'sonner';
import TableForm from '../TableForm';
import Loading from '../Loading';
import { assignOperatorApi, deleteAssignApi, getAllAssignedOperatorsApi } from '../../api/supervisor/SupervidorService';
import { icons } from '../../plugins/IconLibrary';
import Icon from '@mdi/react';
import OperatorAssignmentForm from './OperatorAssignmentForm';
import CazadorAssignmentForm from './CazadorAssignmentForm';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation';

const AssignedOperators = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    incidenceId, 
    incidenceName 
}) => {
    const [assingments, setAssingments] = useState([]);
    const [showOperatorAssignForm, setShowOperatorAssignForm] = useState(false);
    const [showCazadorAssignForm, setShowCazadorAssignForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAssingments = async () => {
        try {
            setIsLoading(true);
            setAssingments([]);
            const data = await getAllAssignedOperatorsApi(incidenceId);
            console.log('Respuesta completa de assignments:', data);
            const assignments = data.data || [];
            console.log('Assignments procesados:', assignments);
            setAssingments(assignments);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            toast.error(`${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !incidenceId) return;
        console.log('Abriendo modal de assignments con incidenceId:', incidenceId);
        fetchAssingments();
    }, [isOpen, incidenceId]);

    const confirmDelete = useDeleteConfirmation({
        fetchData: fetchAssingments,
        deleteApiFn: deleteAssignApi,
        entityName: 'La Asignación',
    });

    const handleAssignOperator = async (payload) => {
        try {
            await assignOperatorApi({
                ...payload,
                userType: 'operator'
            });
            toast.success('Operador asignado exitosamente!');
            await fetchAssingments();
            setShowOperatorAssignForm(false);
        } catch (error) {
            toast.error(`Error al asignar operador: ${error.message}`);
        }
    };

    const handleAssignCazador = async (payload) => {
        try {
            console.log('Payload para asignar cazador:', payload); // Log the payload
            const response = await assignOperatorApi(payload);
            console.log('Respuesta de asignación:', response); // Log the response
            toast.success('Cazador asignado exitosamente!');
            await fetchAssingments();
            setShowCazadorAssignForm(false);
        } catch (error) {
            console.error('Error completo al asignar cazador:', error);
            toast.error(`Error al asignar cazador: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <Dialog open={isOpen} onClose={(onClose)} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-6">
                    <div className='mb-2 flex'>
                        <Dialog.Title className="text-lg font-bold text-gray-700">Personal asignado a: <span className="text-gray-500 ml-4">{incidenceName}</span></Dialog.Title>
                        <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <hr className='border-gray-200 mb-4' />
                    {isLoading ? (
                        <Loading message="Cargando Operadores" />
                    ) : (
                        <div>
                            <TableForm
                                data={assingments}
                                columns={[
                                    {
                                        label: 'Nombre',
                                        key: 'user',
                                        render: (v) => {
                                            console.log('Renderizando nombre para:', v);
                                            const user = v.user;
                                            if (!user) return '—';
                                            return user.name || '—';
                                        },
                                    },
                                    {
                                        label: 'Apellidos',
                                        key: 'user',
                                        render: (v) => {
                                            const user = v.user;
                                            if (!user) return '—';
                                            return user.lastname || '—';
                                        },
                                    },
                                    { 
                                        label: 'Rol', 
                                        key: 'user', 
                                        render: (v) => {
                                            const user = v.user;
                                            if (!user) return '—';
                                            return user.role || '—';
                                        }
                                    },
                                    {
                                        label: 'Asignado por',
                                        key: 'assignerId',
                                        render: (v) => {
                                            // Por ahora mostramos el ID del asignador, pero podríamos obtener más detalles si es necesario
                                            return /* v.assignerId ? `ID: ${v.assignerId}` : */ 'Automático';
                                        },
                                    },
                                ]}
                                actions={[
                                    {
                                        title: 'Eliminar',
                                        onClick: (assignment) =>
                                            confirmDelete(assignment, (as) => {
                                                const name = as.user?.name ?? '';
                                                const lastname = as.user?.lastname ?? '';
                                                const fullName = `${name} ${lastname}`.trim();

                                                return fullName !== '' ? fullName : 'Asignado no existente';
                                            }),
                                        icon: icons.delete,
                                        className: 'text-red-600 hover:text-red-800',
                                    },
                                ]}
                            />
                            {showOperatorAssignForm ? (
                                <OperatorAssignmentForm
                                    incidenceId={incidenceId}
                                    onClose={() => setShowOperatorAssignForm(false)}
                                    onSubmit={handleAssignOperator}
                                />
                            ) : showCazadorAssignForm ? (
                                <CazadorAssignmentForm
                                    incidenceId={incidenceId}
                                    onClose={() => setShowCazadorAssignForm(false)}
                                    onSubmit={handleAssignCazador}
                                />
                            ) : (
                                <div className='justify-self-end mt-4'>
                                    <div className='justify-row flex gap-2'>
                                        <button
                                            onClick={() => setShowOperatorAssignForm(true)}
                                            className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                                            type="button"
                                        >
                                            <Icon path={icons.add} size={1} />
                                            Asignar nuevo operador
                                        </button>
                                        <button
                                            onClick={() => setShowCazadorAssignForm(true)}
                                            className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                                            type="button"
                                        >
                                            <Icon path={icons.add} size={1} />
                                            Asignar nuevo cazador
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default AssignedOperators;
