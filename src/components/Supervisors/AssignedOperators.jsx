import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'sonner';
import TableForm from '../TableForm';
import Loading from '../Loading';
import { assignOperatorApi, deleteAssignApi, getAllAssignedOperatorsApi } from '../../api/supervisor/SupervidorService';
import { icons } from '../../plugins/IconLibrary';
import Icon from '@mdi/react';
import OperatorAssignmentForm from './OperatorAssignmentForm';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation';

const AssignedOperators = ({ isOpen, onClose, onSubmit, operators, incidenceId, incidenceName }) => {
    const [assingments, setAssingments] = useState([]);
    const [showOperatorAssignForm, setShowOperatorAssignForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAssingments = async () => {
        try {
            setIsLoading(true);
            setAssingments([]);
            const data = await getAllAssignedOperatorsApi(incidenceId);
            setAssingments(data.data);
        } catch (error) {
            toast.error(`${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !incidenceId) return;
        fetchAssingments();
    }, [isOpen, incidenceId]);

    const confirmDelete = useDeleteConfirmation({
        fetchData: fetchAssingments,
        deleteApiFn: deleteAssignApi,
        entityName: 'La Asignación',
    });

    const handleAssignOperator = async (payload) => {
        try {
            await assignOperatorApi(payload);
            toast.success('Operador asignado exitosamente!');
            await fetchAssingments();
            setShowOperatorAssignForm(false);
        } catch (error) {
            toast.error(`Error al asignar operador: ${error.message}`);
        }
    };

    return (
        <Dialog open={isOpen} onClose={(onClose)} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-6">
                    <div className='mb-2 flex'>
                        <Dialog.Title className="text-lg font-bold">Operadores asignados a: <span className="text-gray-500 ml-4">{incidenceName}</span></Dialog.Title>
                        <button type="button" onClick={onClose} class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <hr className='border-gray-200 mb-4'/>
                    {isLoading ? (
                        <Loading message= "Cargando Operadores"/>
                    ) : (
                        <div>
                            <TableForm
                                data={assingments}
                                columns={[
                                    { label: 'Nombre', key: 'code', render: (value) => value.operator?.name ?? '—'},
                                    { label: 'Apellidos', key: 'lastname' , render: (value) => value.operator?.lastname ?? '—'},
                                    { label: 'Asignado por', key: 'asignedByUserId', render: (value) => value.asignedByUserId?.username ?? 'automático'},
                                ]}
                                actions={[
                                    {
                                        title: 'Eliminar',
                                        onClick: (assignment) =>
                                        confirmDelete(assignment, (as) => {
                                            const name = as.operator?.name ?? '';
                                            const lastname = as.operator?.lastname ?? '';
                                            const fullName = `${name} ${lastname}`.trim();

                                            return fullName !== '' ? fullName : 'Operador no existente';
                                        }),
                                        icon: icons.delete,
                                        className: 'text-red-600 hover:text-red-800',
                                    },
                                ]}
                            />
                            {showOperatorAssignForm ? (
                                <OperatorAssignmentForm
                                    operators={operators}
                                    incidenceId={incidenceId}
                                    onClose={() => setShowOperatorAssignForm(false)}
                                    onSubmit={handleAssignOperator}
                                />
                            ):(
                                <div className='justify-self-end mt-4'>
                                    <button
                                        onClick={() => setShowOperatorAssignForm(true)}
                                        className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                                        type="button"
                                    >
                                        <Icon path={icons.add} size={1} />
                                        Asignar nuevo operador
                                    </button> 
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
