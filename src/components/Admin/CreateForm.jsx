import { useState } from 'react';
import { Dialog } from '@headlessui/react';

const CreateForm = ({ isOpen, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        lastname: '',
        phone: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(form);
        // Resetear el formulario después de enviar
        setForm({
            username: '',
            password: '',
            name: '',
            lastname: '',
            phone: '',
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <Dialog.Title className="text-lg font-bold mb-4">Crear Supervisor</Dialog.Title>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded mt-1"
                                required
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
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Teléfono</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded mt-1"
                                required
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
                                required
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
                                required
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
                                Guardar
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default CreateForm;
