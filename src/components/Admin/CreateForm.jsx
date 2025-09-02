import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTheme } from '../../contexts/ThemeContext';

const CreateForm = ({ isOpen, onClose, onSubmit }) => {
    const { isDark } = useTheme();
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        lastname: '',
        dni:'',
        phone: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = (name === "phone" || name === "dni") ? value.replace(/\D/g, "") : value;
        setForm((prev) => ({ ...prev, [name]: newValue }));
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
            dni:'',
            phone: '',
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className={`rounded-lg shadow-lg max-w-md w-full p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <Dialog.Title className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Crear Supervisor</Dialog.Title>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Apellido</label>
                            <input
                                type="text"
                                name="lastname"
                                value={form.lastname}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Dni</label>
                            <input
                                type="text"
                                name="dni"
                                value={form.dni}
                                onChange={handleChange}
                                pattern='\d{8}'
                                title='El DNI debe tener exactamente 8 dígitos.'
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Teléfono</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                pattern='\d{9}'
                                title='El número de teléfono debe tener exactamente 9 dígitos.'
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Usuario</label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`mr-2 px-4 py-2 border rounded cursor-pointer ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={`text-white px-4 py-2 rounded cursor-pointer ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-black hover:bg-gray-800'}`}
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
