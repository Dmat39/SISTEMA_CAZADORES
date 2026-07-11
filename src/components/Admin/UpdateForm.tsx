import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTheme } from '../../contexts/ThemeContext';

const UpdateForm = ({ isOpen, onClose, data, onSubmit }) => {
    const { isDark } = useTheme();
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        lastname: '',
        dmi: '',
        phone: '',
    });

    // Precargar datos cuando se abra el modal
    useEffect(() => {
        if (data) {
            setForm({
                username: data.user?.username || '',
                password: data.user?.password || '',
                name: data.name || '',
                lastname: data.lastname || '',
                dni: data.dni || '',
                phone: data.phone || '',
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
                <Dialog.Panel className={`rounded-lg shadow-lg max-w-md w-full p-6 ${isDark ? 'bg-gray-800' : 'bg-[#fdfbf5]'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-[#3d2f1f]'}`}>Editar Supervisor</h3>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-[#fdfbf5] border-[#e8dfc8] text-[#3d2f1f]'}`}
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Apellido</label>
                            <input
                                type="text"
                                name="lastname"
                                value={form.lastname}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-[#fdfbf5] border-[#e8dfc8] text-[#3d2f1f]'}`}
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Dni</label>
                            <input
                                type="text"
                                name="dni"
                                value={form.dni}
                                onChange={handleChange}
                                pattern="\d{8}"
                                title="El DNI debe tener exactamente 8 dígitos."
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-[#fdfbf5] border-[#e8dfc8] text-[#3d2f1f]'}`}
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Teléfono</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                pattern="\d{9}"
                                title="El número de teléfono debe tener exactamente 9 dígitos."
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-[#fdfbf5] border-[#e8dfc8] text-[#3d2f1f]'}`}
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Usuario</label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-[#fdfbf5] border-[#e8dfc8] text-[#3d2f1f]'}`}
                            />
                        </div>

                        <div className="mb-6">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-[#fdfbf5] border-[#e8dfc8] text-[#3d2f1f]'}`}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`mr-2 px-4 py-2 border rounded ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-[#e8dfc8] text-[#3d2f1f] hover:bg-[#f0e6d0]'}`}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2 rounded text-white ${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-black hover:bg-gray-800'}`}
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

export default UpdateForm;
