import { toast } from 'sonner';

/**
 * Hook para mostrar una confirmación antes de descartar cambios no guardados.
 *
 * @param {Object} options - Configuración del hook.
 * @param {Function} options.onConfirm - Función que se llama si el usuario confirma.
 * @param {Function} [options.onCancel] - Función opcional que se llama si el usuario cancela.
 * @param {string} [options.message] - Mensaje personalizado de advertencia.
 *
 * @returns {Function} confirmDiscardChanges
 */
export const useConfirmDiscard = ({
  onConfirm,
  onCancel,
  message = 'Tienes cambios sin guardar. ¿Estás seguro de que deseas descartarlos?',
}) => {
  const confirmDiscardChanges = () => {
    toast(
      () => (
        <div className="flex flex-col space-y-2">
          <p>{message}</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                toast.dismiss();
                if (onCancel) onCancel();
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                toast.dismiss();
                onConfirm();
              }}
              className="px-3 py-1 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700 cursor-pointer"
            >
              Descartar cambios
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

  return confirmDiscardChanges;
};
