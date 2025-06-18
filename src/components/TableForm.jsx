import Icon from '@mdi/react';
import { icons } from '../plugins/IconLibrary.js';

const TableForm = ({
  data = [],
  columns = [],
  actions = []
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
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
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

                {actions.length > 0 && (
                  <td className="px-6 py-4 text-sm text-gray-800 space-x-2">
                    <div className='flex'>
                      {actions.map((action, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => action.onClick(item)}
                          title={action.title}
                          className="cursor-pointer p-1"
                        >
                          <Icon
                            path={action.icon}
                            size={1}
                            className={action.className}
                          />
                        </button>
                      ))}
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