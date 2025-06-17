import Icon from '@mdi/react';
import { icons } from '../plugins/IconLibrary.js';

const TableForm = ({
  data = [],
  columns = [],
  onEditPwd,
  onEdit,
  onDelete
}) => {
  return (
    <div className="pt-6">
      <div className="overflow-x-auto shadow rounded-lg max-h-[70vh] h-full">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {( onEditPwd || onEdit || onDelete) && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-gray-50">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-sm text-gray-800">
                    {typeof col.render === 'function'
                      ? col.render(item)
                      : col.key.split('.').reduce((acc, key) => acc?.[key], item) || '—'}
                  </td>
                ))}

                {(onEditPwd || onEdit || onDelete) && (
                  <td className="px-6 py-4 text-sm text-gray-800 space-x-2">
                    <div>
                      {onEditPwd && (
                        <button onClick={() => onEditPwd(item)} title="Editar contraseña" className="cursor-pointer">
                          <Icon path={icons.lockReset} size={1} className="text-black-600 hover:text-black-800"/>
                        </button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(item)} title="Editar" className="cursor-pointer">
                          <Icon path={icons.edit} size={1} className="text-blue-600 hover:text-blue-800" />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item)} title="Eliminar" className="cursor-pointer">
                          <Icon path={icons.delete} size={1} className="text-red-600 hover:text-red-800" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableForm;