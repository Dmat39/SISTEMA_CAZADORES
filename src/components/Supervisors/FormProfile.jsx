import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateOperatorProfileApi } from '../../api/supervisor/ProfileApi';

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
          
            const updateData = {
                name: form.name.trim(),
                lastname: form.lastname.trim(),
                phone: form.phone.trim(),
                dni: form.dni.trim(),
            };

            if (form.username !== operatorData.user?.username) {
                updateData.username = form.username.trim();
            }

            if (form.password && form.password.trim()) {
                updateData.password = form.password;
            }

            console.log('Datos a actualizar:', updateData);
            
            const response = await updateOperatorProfileApi(operatorData.id, updateData);
            
            if (response.status) {
                toast.success('Perfil actualizado correctamente');
                
                setForm(prev => ({ ...prev, password: '' }));
                
                if (onProfileUpdated) {
                    onProfileUpdated();
                }
            } else {
                toast.error('Error al actualizar el perfil');
            }
            
        } catch (error) {
            console.error('Error al actualizar perfil:', error);

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

    return (
        <div className="p-4">
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="border-b border-gray-200 pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Configuración del Perfil</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Actualiza tu información personal y credenciales de acceso
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Información Personal */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
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
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Ingresa tu nombre"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
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
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Ingresa tu apellido"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{9,15}"
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Ingresa tu teléfono"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
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
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Ingresa tu DNI"
                            />
                        </div>

                        {/* Información de Acceso */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Usuario
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                minLength={3}
                                maxLength={20}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg mt-1 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Nombre de usuario"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                minLength={8}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Dejar en blanco para no cambiar"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Mínimo 8 caracteres (opcional)
                            </p>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="mt-8 flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`cursor-pointer px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            } text-white`}
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