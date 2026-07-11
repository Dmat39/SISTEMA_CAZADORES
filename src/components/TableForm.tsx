import Icon from '@mdi/react';

const TableForm = ({
  data = [],
  columns = [],
  actions = [],
  pagination = null,
  onPageChange = () => {},
  onRowClick = null
}) => {
  const actualData = Array.isArray(data?.data) ? data.data : data;
  const actualPagination = data?.pagination || pagination;
  const totalPages = actualPagination?.totalPages || 1;
  const currentPage = actualPagination?.page || 1;
  const isRowClickable = typeof onRowClick === 'function';

  return (
    <div className="pt-6">
      <div className="overflow-x-auto shadow rounded-lg max-h-[60vh] h-full border border-[#e8dfc8] dark:border-white/10">
        <table className="min-w-full divide-y divide-[#e8dfc8] dark:divide-white/10 bg-[#fdfbf5] dark:bg-[#111827]">
          <thead className="sticky top-0 bg-[#f0e6d0] dark:bg-[#1e293b] z-10">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-xs font-semibold text-[#a89878] dark:text-gray-400 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#a89878] dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8dfc8] dark:divide-white/5 bg-[#fdfbf5] dark:bg-[#111827]">
            {actualData.length > 0 ? (
              actualData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className={`transition-colors ${isRowClickable ? 'hover:bg-[#f7f0e0] dark:hover:bg-white/5 cursor-pointer' : 'hover:bg-[#f7f0e0] dark:hover:bg-white/5'}`}
                  onClick={() => isRowClickable && onRowClick(item)}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-6 py-4 text-sm text-[#7a6a52] dark:text-gray-300"
                    >
                      {(() => {
                        const value = typeof col.render === 'function'
                          ? col.render(item)
                          : col.key.split('.').reduce((acc, key) => acc?.[key], item) || '—';

                        if (typeof value === 'string' && value.length > 50 && col.label.toLowerCase() !== 'acciones') {
                          return value.slice(0, 50) + ' . . .';
                        }

                        return value;
                      })()}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 text-sm">
                      <div className="flex justify-center">
                        {actions.map((action, actIdx) => (
                          <button
                            key={actIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(item);
                            }}
                            title={action.title}
                            className="cursor-pointer p-1.5 rounded-lg hover:bg-[#f7f0e0] dark:hover:bg-white/10 transition-colors"
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
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-8 text-center text-sm text-[#a89878] dark:text-gray-400"
                >
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
            className="px-3 py-1 bg-[#f0e6d0] dark:bg-white/10 text-[#7a6a52] dark:text-gray-300 rounded disabled:opacity-50 hover:bg-[#e8dfc8] dark:hover:bg-white/15 transition-colors"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Anterior
          </button>
          <span className="text-sm text-[#7a6a52] dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="px-3 py-1 bg-[#f0e6d0] dark:bg-white/10 text-[#7a6a52] dark:text-gray-300 rounded disabled:opacity-50 hover:bg-[#e8dfc8] dark:hover:bg-white/15 transition-colors"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default TableForm;
