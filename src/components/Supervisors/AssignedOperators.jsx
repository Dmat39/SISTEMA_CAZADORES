import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'sonner';
import TableForm from '../TableForm';
import Loading from '../Loading';
import { getAllAssignedOperatorsApi } from '../../api/supervisor/SupervidorService';
import { icons } from '../../plugins/IconLibrary';
import Icon from '@mdi/react';
import OperatorAssignmentForm from './OperatorAssignmentForm';

const AssignedOperators = ({ isOpen, onClose, onSubmit, operators, incidenceId, incidenceName }) => {
    const [assingments, setAssingments] = useState([]);
    const [showOperatorAssignForm, setShowOperatorAssignForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAssingments = async () => {
        try {
            setIsLoading(true);
            const data = await getAllAssignedOperatorsApi(incidenceId);
            setAssingments(data.data);
        } catch (error) {
            toast.error(` Error al obtener las asignaciones: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !incidenceId) return;
        fetchAssingments();
    }, [isOpen, incidenceId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.userId || !incidenceId) {
            toast.error('Debes seleccionar un operador');
            return;
        }
        onSubmit?.({ userId: form.userId, incidenceId });
        setForm({ userId: '' });
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
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
                                        onClick: (op) => confirmDelete(op, (p) => `${p.code}: ${p.name}`),
                                        icon: icons.delete,
                                        className: 'text-red-600 hover:text-red-800',
                                    },
                                ]}
                            />
                            {showOperatorAssignForm ? (
                                // <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                //     <h3 className="text-md font-semibold mb-4">Asignar nuevo operador</h3>
                                //     <form onSubmit={handleSubmit}>
                                //         <div className="mb-4">
                                //             <label className="block text-sm font-medium mb-2">Operador</label>
                                //             <select
                                //                 name="userId"
                                //                 value={form.userId}
                                //                 onChange={handleChange}
                                //                 className="w-full border px-3 py-2 rounded border-gray-300 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                //             >
                                //                 <option value="" disabled hidden>Selecciona un operador</option>
                                //                 {operators.map((op) => (
                                //                     <option key={op.id} value={op.id}>
                                //                         {op.name} {op.lastname}
                                //                     </option>
                                //                 ))}
                                //             </select>
                                //         </div>
                                        
                                //         <div className="flex justify-end gap-2">
                                //             <button
                                //                 type="button"
                                //                 onClick={handleCancel}
                                //                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                                //             >
                                //                 Cancelar
                                //             </button>
                                //             <button
                                //                 type="submit"
                                //                 className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-[#32A3B5] cursor-pointer transition-colors"
                                //             >
                                //                 Asignar
                                //             </button>
                                //         </div>
                                //     </form>
                                // </div>
                                <OperatorAssignmentForm
                                    
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
