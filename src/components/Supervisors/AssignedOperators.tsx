import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'sonner';
import TableForm from '../TableForm';
import Loading from '../Loading';
import { assignOperatorApi, deleteAssignApi, getAllAssignedOperatorsApi } from '../../api/supervisor/SupervidorService';
import { icons } from '../../plugins/IconLibrary';
import Icon from '@mdi/react';
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
    const [showCazadorAssignForm, setShowCazadorAssignForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAssingments = async () => {
        try {
            setIsLoading(true);
            setAssingments([]);
            const data = await getAllAssignedOperatorsApi(incidenceId);
            setAssingments(data.data || []);
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

    const handleAssignCazador = async (payload) => {
        try {
            await assignOperatorApi(payload);
            toast.success('Cazador asignado exitosamente!');
            await fetchAssingments();
            setShowCazadorAssignForm(false);
        } catch (error) {
            toast.error(`Error al asignar cazador: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-slate-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl max-w-6xl w-full p-6">
                    <div className="mb-2 flex items-center">
                        <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                            Personal asignado a:{' '}
                            <span className="text-gray-500 dark:text-gray-400 ml-2 font-normal">{incidenceName}</span>
                        </Dialog.Title>
                        <button
                            type="button"
                            onClick={onClose}
                            className="ms-auto text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white rounded-lg w-8 h-8 inline-flex justify-center items-center transition-colors"
                        >
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                        </button>
                    </div>
                    <hr className="border-gray-200 dark:border-white/10 mb-4" />

                    {isLoading ? (
                        <Loading message="Cargando asignaciones" />
                    ) : (
                        <div>
                            <TableForm
                                data={assingments}
                                columns={[
                                    {
                                        label: 'Nombre',
                                        key: 'user',
                                        render: (v) => v.user?.name || '—',
                                    },
                                    {
                                        label: 'Apellidos',
                                        key: 'user',
                                        render: (v) => v.user?.lastname || '—',
                                    },
                                    {
                                        label: 'Rol',
                                        key: 'user',
                                        render: (v) => v.user?.role || '—',
                                    },
                                    {
                                        label: 'Asignado por',
                                        key: 'assignerId',
                                        render: () => 'Automático',
                                    },
                                ]}
                                actions={[
                                    {
                                        title: 'Eliminar',
                                        onClick: (assignment) =>
                                            confirmDelete(assignment, (as) => {
                                                const fullName = `${as.user?.name ?? ''} ${as.user?.lastname ?? ''}`.trim();
                                                return fullName || 'Asignado no existente';
                                            }),
                                        icon: icons.delete,
                                        className: 'text-red-600 hover:text-red-800',
                                    },
                                ]}
                            />
                            {showCazadorAssignForm ? (
                                <CazadorAssignmentForm
                                    incidenceId={incidenceId}
                                    onClose={() => setShowCazadorAssignForm(false)}
                                    onSubmit={handleAssignCazador}
                                />
                            ) : (
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => setShowCazadorAssignForm(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                                        type="button"
                                    >
                                        <Icon path={icons.add} size={0.8} />
                                        Asignar cazador
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
