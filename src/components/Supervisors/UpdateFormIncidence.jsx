import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaEye, FaEyeSlash, FaRegUser } from "react-icons/fa";

const UpdateFormIncidence = ({ isOpen, onClose, data, onSubmit }) => {
   
    const [form, setForm] = useState({
        code:'',
        name:'',
        description:'',
        date: '',
        status:'',
        observation:''
    });    
    
    // Precargar datos cuando se abra el modal
    useEffect(() => {
        if (data) {
            setForm({
                code: data.code || '',
                name: data.name || '',
                description: data.description || '',
                date: data.date || '',
                status: data.status || '',
                observation: data.observation,
                id: data.id,
            });
        }
    }, [data]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(form);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <div className='mb-2 flex'>
                        <Dialog.Title className="text-lg font-bold">Editar Incidencia</Dialog.Title>
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
                            <label className="block text-sm font-medium">Codigo</label>
                            <input
                                type="text"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded mt-1"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded mt-1"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Descripción</label>
                            <textarea
                                type="text"
                                name="description"
                                value={form.description ?? ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full border px-3 py-2 rounded mt-1"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Fecha</label>
                            <input
                                type="text"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded mt-1"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Estado</label>
                            <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded mt-1 border-gray-300 text-gray-900 text-sm focus:ring-block w-full p-2.5
                                ${form.status === "process" ? "bg-yellow-200 focus:ring-yellow-500 focus:border-yellow-500" : ""}
                                ${form.status === "finished" ? "bg-green-200 focus:ring-green-500 focus:border-green-500" : ""}
                                ${form.status === "completed" ? "bg-gray-200 focus:ring-gray-500 focus:border-gray-500" : ""}
                            `}
                            >
                                <option className='bg-white' value="process">En Proceso</option>
                                <option className='bg-white' value="completed">Completado</option>
                                <option className='bg-white' value="finished">Finalizado</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Observación</label>
                            <textarea
                                type="text"
                                name="observation"
                                value={form.observation ?? ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full border px-3 py-2 rounded mt-1"
                            />
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
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default UpdateFormIncidence;
