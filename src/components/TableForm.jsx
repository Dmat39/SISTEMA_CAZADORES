import Icon from '@mdi/react';

const TableForm = ({
  data = [],
  columns = [],
  actions = [],
  pagination = null,
  onPageChange = () => {} 
}) => {
  const actualData = Array.isArray(data?.data) ? data.data : data;
  const actualPagination = data?.pagination || pagination;
  const totalPages= data?.pagination ? data?.pagination.totalPages : 1;
  return (
    <div className="pt-6">
      <div className="overflow-x-auto shadow rounded-lg max-h-[60vh] h-full">
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{ textAlign: 'center' }}>Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {actualData.length > 0 ? (
              actualData.map((item, idx) => (
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
                      <div className="flex justify-center">
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
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                  No hay datos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {actualPagination && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => onPageChange(actualPagination.page - 1)}
            disabled={actualPagination.page <= 1}
          >
            Anterior
          </button>

          <span className="text-sm">
            Página {actualPagination.page} de {totalPages}
          </span>

          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => onPageChange(actualPagination.page + 1)}
            disabled={actualPagination.page >= totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default TableForm;