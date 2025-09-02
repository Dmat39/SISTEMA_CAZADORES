import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateOperatorProfileApi } from '../../api/operador/profileApi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const FormProfile = ({ operatorData, onProfileUpdated }) => {
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        lastname: '',
        phone: '',
        dni: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { isDark } = useTheme();

    useEffect(() => {
        if (operatorData) {
            setForm({
                username: operatorData.user?.username || '',
                password: '', // No mostrar la contraseña real
                name: operatorData.name || '',
                lastname: operatorData.lastname || '',
                phone: operatorData.phone || '',
                dni: operatorData.dni || ''
            });
        }
    }, [operatorData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Preparar datos para actualizar
            const updateData = {
                name: form.name.trim(),
                lastname: form.lastname.trim(),
                phone: form.phone.trim(),
                dni: form.dni.trim(),
            };

            // Solo incluir username si ha cambiado
            if (form.username !== operatorData.user?.username) {
                updateData.username = form.username.trim();
            }

            // Solo incluir password si se proporcionó una nueva
            if (form.password && form.password.trim()) {
                updateData.password = form.password;
            }

            console.log('Datos a actualizar:', updateData);
            
            // Llamar a la API de actualización
            const response = await updateOperatorProfileApi(operatorData.id, updateData);
            
            if (response.status) {
                toast.success('Perfil actualizado correctamente');
                
                // Limpiar el campo de contraseña después de actualizar
                setForm(prev => ({ ...prev, password: '' }));
                
                // Notificar al componente padre para que recargue los datos
                if (onProfileUpdated) {
                    onProfileUpdated();
                }
            } else {
                toast.error('Error al actualizar el perfil');
            }
            
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            
            // Manejar diferentes tipos de errores
            let errorMessage = 'Error al actualizar perfil';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.error) {
                errorMessage = error.error;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    return (
        <div className={`p-4 min-h-screen transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E8E8E8]'}`}>
            <div className={`rounded-xl shadow-md p-6 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                <div className={`border-b pb-4 mb-6 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Configuración del Perfil</h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Actualiza tu información personal y credenciales de acceso
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Información Personal */}
                        <div className="space-y-1">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                minLength={2}
                                maxLength={50}
                                className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                placeholder="Ingresa tu nombre"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                Apellido *
                            </label>
                            <input
                                type="text"
                                name="lastname"
                                value={form.lastname}
                                onChange={handleChange}
                                required
                                minLength={2}
                                maxLength={50}
                                className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                placeholder="Ingresa tu apellido"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{9,15}"
                                className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                placeholder="Ingresa tu teléfono"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                DNI *
                            </label>
                            <input
                                type="text"
                                name="dni"
                                value={form.dni}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{8}"
                                maxLength={8}
                                className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                placeholder="Ingresa tu DNI"
                            />
                        </div>

                        {/* Información de Acceso */}
                        <div className="space-y-1">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                Usuario
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                minLength={3}
                                maxLength={20}
                                className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-600 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                                placeholder="Nombre de usuario"
                            />
                        </div>

                        <div className="space-y-1 relative">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                Nueva Contraseña
                            </label>
                            <div className="relative mt-2">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength={8}
                                    className={`w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                    placeholder="Dejar en blanco para no cambiar"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <button type="button" onClick={togglePasswordVisibility} className="focus:outline-none cursor-pointer">
                                        {showPassword ? (
                                            <FaEyeSlash className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-400'}`} />
                                        ) : (
                                            <FaEye className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-400'}`} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Mínimo 8 caracteres (opcional)
                            </p>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="mt-8 flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`cursor-pointer px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-white ${
                                isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : isDark 
                                        ? 'bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2' 
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            }`}
                        >
                            {isSubmitting ? 'Actualizando...' : 'Actualizar Perfil'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormProfile;
