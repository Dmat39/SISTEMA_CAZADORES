import React from 'react';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js'; // Ajusta la ruta si es necesario

const TableForm = ({ data = [], onEdit, onDelete }) => {

    const columns = ['Nombre', 'Apellido', 'DNI', 'Teléfono', 'Usuario', 'Rol', 'Acciones'];

    return (
        <div className="pt-6">
            <div className="overflow-x-auto shadow rounded-lg max-h-[60vh] h-full">
                <table className="min-w-full divide-y divide-[#e8dfc8] bg-[#fdfbf5]">
                    <thead className="bg-[#f0e6d0]">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className="px-6 py-3 text-left text-xs font-semibold text-[#7a6a52] uppercase tracking-wider"
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8dfc8]">
                    {data.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-[#f7f0e0]">
                            <td className="px-6 py-4 text-sm text-[#3d2f1f]">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-[#3d2f1f]">{item.lastname}</td>
                            <td className="px-6 py-4 text-sm text-[#3d2f1f]">{item.dni || '—'}</td>
                            <td className="px-6 py-4 text-sm text-[#3d2f1f]">{item.phone}</td>
                            <td className="px-6 py-4 text-sm text-[#3d2f1f]">{item.user?.username || '—'}</td>
                            <td className="px-6 py-4 text-sm text-[#3d2f1f]">{item.user?.role || '—'}</td>
                            <td className="px-6 py-4 text-sm text-[#3d2f1f] flex space-x-2">
                                <button
                                    onClick={() => {
                                        onEdit?.(item);
                                    }}
                                    title="Editar"
                                >
                                    <Icon path={icons.edit} size={1} className="text-blue-600 hover:text-blue-800" />
                                </button>

                                <button onClick={() => { ;
                                    onDelete?.(item)}} title="Eliminar">
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
