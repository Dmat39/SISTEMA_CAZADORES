import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaEye, FaEyeSlash, FaRegUser } from 'react-icons/fa';

const CreateFormOperator = ({ isOpen, onClose, onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        lastname: '',
        phone: '',
        dni: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = (name === "phone" || name === "dni") ? value.replace(/\D/g, "") : value;
        setForm((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(form);
        setForm({// Resetea los datos
            username: '',
            password: '',
            name: '',
            lastname: '',
            phone: '',
            dni: ''
        });
        setShowPassword(false);
        onClose();
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <div className='mb-2 flex'>
                        <Dialog.Title className="text-lg font-bold">Crear nuevo operador</Dialog.Title>
                        <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <hr className='border-gray-200 mb-4'/>
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
                                pattern="\d{9}"
                                title="El número de teléfono debe tener exactamente 9 dígitos."
                                className="w-full border px-3 py-2 rounded mt-1"
                                required
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
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Usuario</label>
                            <div className="relative mt-1">
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <FaRegUser className="w-5 h-5 text-gray-400" />
                                </div>                                
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium">Contraseña</label>
                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
                                    title="La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un símbolo."
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <button type="button" onClick={togglePasswordVisibility} className="focus:outline-none cursor-pointer">
                                        {showPassword ? (
                                            <FaEyeSlash className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <FaEye className="w-5 h-5 text-gray-400" />
                                        )
                                        }
                                    </button>
                                </div>
                            </div>
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

export default CreateFormOperator;
