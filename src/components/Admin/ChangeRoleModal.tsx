import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTheme } from '../../contexts/ThemeContext';
import type { UserRole } from '../../api/admin/userApi';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'administrator', label: 'Administrador' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'hunter', label: 'Cazador' },
    { value: 'visualizer', label: 'Visualizador' },
];

interface ChangeRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: { id: string; name: string; lastname: string; role?: UserRole } | null;
    onSubmit: (id: string, role: UserRole) => void;
}

const ChangeRoleModal = ({ isOpen, onClose, data, onSubmit }: ChangeRoleModalProps) => {
    const { isDark } = useTheme();
    const [role, setRole] = useState<UserRole>('hunter');

    useEffect(() => {
        if (data?.role) setRole(data.role);
    }, [data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        onSubmit(data.id, role);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className={`rounded-lg shadow-lg max-w-md w-full p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <Dialog.Title className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        Cambiar rol{data ? ` de ${data.name} ${data.lastname}` : ''}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Nuevo rol</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className={`w-full border px-3 py-2 rounded ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                            >
                                {ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
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
                                className="text-white px-4 py-2 rounded cursor-pointer bg-orange-500 hover:bg-orange-600"
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

export default ChangeRoleModal;
