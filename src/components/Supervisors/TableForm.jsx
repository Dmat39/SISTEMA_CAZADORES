import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js'; // Ajusta la ruta si es necesario

const TableForm = ({ data = [], onEdit, onDelete }) => {

    const columns = ['Nombre', 'Apellido', 'Teléfono', 'Dni', 'Usuario', 'Rol', 'Acciones'];

    return (
        <div className="pt-6">
            <div className="overflow-x-auto shadow rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-100">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {data.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-800">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{item.lastname}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{item.phone}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{item.dni}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{item.user?.username || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{item.user?.role || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-800 flex space-x-2">
                                <button
                                    onClick={() => {
                                        onEdit?.(item);
                                    }}
                                    title="Editar"
                                    className='cursor-pointer'
                                >
                                    <Icon path={icons.edit} size={1} className="text-blue-600 hover:text-blue-800" />
                                </button>

                                <button 
                                    onClick={() => {
                                        onDelete?.(item)
                                    }} 
                                    title="Eliminar"
                                    className='cursor-pointer'
                                >
                                    <Icon path={icons.delete} size={1} className="text-red-600 hover:text-red-800" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableForm;
