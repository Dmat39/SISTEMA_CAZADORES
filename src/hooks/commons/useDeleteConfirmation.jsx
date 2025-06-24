import { toast } from 'sonner';

/**
 * Hook para mostrar una confirmación antes de eliminar un recurso.
 * 
 * @param {Object} options - Configuración del hook.
 * @param {Function} options.fetchData - Función para refrescar la lista después de borrar.
 * @param {Function} options.deleteApiFn - Función que hace la llamada DELETE (por id).
 * @param {string} options.entityName - Nombre de la entidad que se está eliminando (para mostrar).
 * 
 * @returns {Function} confirmDelete(payload, getEntityLabel)
 */
export const useDeleteConfirmation = ({ fetchData, deleteApiFn, entityName }) => {
  const confirmDelete = (payload, getEntityLabel, onConfirmed) => {
    const label = typeof getEntityLabel === 'function' ? getEntityLabel(payload) : '';
    
    toast(
      () => (
        <div className="flex flex-col space-y-2">
          <p>
            ¿Estás seguro de eliminar <strong>{entityName}</strong>
            {label ? `: ${label}` : ''}?
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => toast.dismiss()}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                toast.dismiss();
                try {
                  if (onConfirmed) {
                    await onConfirmed();
                  } else {
                    await deleteApiFn(payload.id);
                    await fetchData();
                    toast.success(`${entityName} eliminado exitosamente`, {
                      position: 'top-right',
                    });
                  }
                } catch (err) {
                  toast.error(`Error al eliminar ${entityName}: ${err.message}`);
                }
              }}
              className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        </div>
      ),
      {
        position: 'top-center',
        duration: 999999,
        className: 'flex justify-center',
      }
    );
  };

  return confirmDelete;
};

