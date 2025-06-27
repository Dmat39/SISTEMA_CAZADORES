import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';

const UpdateForm = ({ isOpen, onClose, data, onSubmit }) => {
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
                <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <Dialog.Title className="text-lg font-bold mb-4">Editar Supervisor</Dialog.Title>

                    <form onSubmit={handleSubmit}>
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
                            <label className="block text-sm font-medium">Apellido</label>
                            <input
                                type="text"
                                name="lastname"
                                value={form.lastname}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded mt-1"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Dni</label>
                            <input
                                type="text"
                                name="dni"
                                value={form.dni}
                                onChange={handleChange}
                                pattern="\d{8}"
                                title="El DNI debe tener exactamente 8 dígitos."
                                className="w-full border px-3 py-2 rounded mt-1"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Teléfono</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                pattern="\d{9}"
                                title="El número de teléfono debe tener exactamente 9 dígitos."
                                className="w-full border px-3 py-2 rounded mt-1"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Usuario</label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded mt-1"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium">Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded mt-1"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-2 px-4 py-2 border rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
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
