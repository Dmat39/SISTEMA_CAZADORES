import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from '../contexts/ThemeContext';

const NewPwdForm = ({ isOpen, onClose, data, onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);
    const { isDark } = useTheme();
    
    const [form, setForm] = useState({
        password: '',
    });    
    
    // Precargar datos cuando se abra el modal
    useEffect(() => {
        if (data) {
            setForm({
                password: data.user?.password || '',
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className={`rounded-lg shadow-lg max-w-md w-full p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <Dialog.Title className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Nueva contraseña</Dialog.Title>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Contraseña</label>
                            <div className='relative mt-1'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={`w-full border px-3 py-2 rounded ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
                                    title="La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un símbolo."
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <button type="button" onClick={togglePasswordVisibility} className="focus:outline-none cursor-pointer">
                                        {showPassword ? (
                                            <FaEyeSlash className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-400'}`} />
                                        ) : (
                                            <FaEye className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-400'}`} />
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
                                className={`mr-2 px-4 py-2 border rounded cursor-pointer ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={`text-white px-4 py-2 rounded cursor-pointer ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-black hover:bg-gray-800'}`}
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

export default NewPwdForm;
