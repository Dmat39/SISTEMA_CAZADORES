import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaEye, FaEyeSlash, FaRegUser } from "react-icons/fa";

const UpdateFormIncidence = ({ isOpen, onClose, data, onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);
    
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
        const newValue = (name === "phone" || name === "dni") ? value.replace(/\D/g, "") : value;
        setForm((prev) => ({ ...prev, [name]: newValue }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(form);
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <Dialog.Title className="text-lg font-bold mb-4">Editar Incidencia</Dialog.Title>

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
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
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
                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                style={{
                                    backgroundColor: 'red',
                                    color: 'white',
                                    appearance: 'none',
                                    borderColor: 'oklch(1 0 0)',
                                    '--tw-ring-color': 'oklch(1 0 0)', 
                                }}
                            >
                                <option value="process">En Proceso</option>
                                <option value="finished">Finalizado</option>
                                <option value="completed">Completado</option>
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
