import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'sonner';

const OperatorAssignmentForm = ({ isOpen, onClose, onSubmit, operators, incidenceId }) => {
    const [form, setForm] = useState({
        userId: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

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
                <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <div className='mb-2 flex'>
                        <Dialog.Title className="text-lg font-bold">Asignar a un nuevo operador</Dialog.Title>
                        <button type="button" onClick={onClose} class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <hr className='border-gray-200 mb-4'/>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Operador</label>
                            <select
                                name="userId"
                                value={form.userId}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded mt-1 border-gray-300 text-gray-900 text-sm focus:ring-block p-2.5"
                            >
                                <option value="" disabled hidden>Selecciona un operador</option>
                                {operators.map((op) => (
                                    <option key={op.id} value={op.id}>
                                        {op.name} {op.lastname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-2 px-4 py-2 border rounded cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 cursor-pointer"
                            >
                                Agregar
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default OperatorAssignmentForm;
