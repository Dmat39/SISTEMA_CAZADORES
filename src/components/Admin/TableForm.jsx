import React from 'react';

const TableForm = () => {
    const data = [
        { name: 'Carlos Pérez', email: 'carlos@example.com', role: 'Supervisor' },
        { name: 'Ana Torres', email: 'ana@example.com', role: 'Supervisor' },
    ];

    const columns = ['Nombre', 'Correo', 'Rol'];

    return (
        <div className="p-6">

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
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-800">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{item.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{item.role}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableForm;
