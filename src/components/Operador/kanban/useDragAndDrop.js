import { useState } from 'react';
import { toast } from 'sonner';
import { updateIncidenceStatusApi } from '../../../api/operador/incidenceApi';
import { KANBAN_STATES } from './kanbanConfig';
import { validateStatusTransition } from './statusValidation';

export const useDragAndDrop = (incidencias, onIncidenciaUpdate) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Estados para el modal de confirmación
  const [showModal, setShowModal] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const handleDragStart = (e, incidenciaId) => {
    console.log("Drag started for:", incidenciaId);
    setDraggedItem(incidenciaId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", incidenciaId);
    e.target.style.opacity = "0.8";
    e.stopPropagation();
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setIsDragging(false);
    setTimeout(() => setDraggedItem(null), 100);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e, nuevoEstado) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedItem && !isUpdating) {
      const incidencia = incidencias.find(inc => inc.id === draggedItem);

      if (incidencia && incidencia.status !== nuevoEstado) {
        // Validar la transición
        const validation = validateStatusTransition(incidencia.status, nuevoEstado, incidencia);
        
        // Configurar el cambio pendiente
        setPendingChange({
          incidencia,
          fromStatus: incidencia.status,
          toStatus: nuevoEstado
        });

        if (!validation.isValid) {
          // Mostrar modal con error
          setValidationError(validation.errorMessage);
          setShowModal(true);
        } else {
          // Mostrar modal de confirmación
          setValidationError(null);
          setShowModal(true);
        }
      }

      setDraggedItem(null);
      setIsDragging(false);
    }
  };

  // Confirmar el cambio de estado
  const confirmStatusChange = async () => {
    if (!pendingChange) return;

    try {
      setIsUpdating(true);
      
      // Actualizar estado local inmediatamente
      if (onIncidenciaUpdate) {
        onIncidenciaUpdate(pendingChange.incidencia.id, pendingChange.toStatus);
      }

      // Llamar API
      await updateIncidenceStatusApi(pendingChange.incidencia.id, pendingChange.toStatus);
      toast.success(`Incidencia movida a ${KANBAN_STATES[pendingChange.toStatus]?.titulo}`);
      
      // Cerrar modal
      setShowModal(false);
      setPendingChange(null);
      setValidationError(null);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error("Error al actualizar el estado de la incidencia");
      
      // Revertir cambio si falla
      if (onIncidenciaUpdate && pendingChange.incidencia) {
        onIncidenciaUpdate(pendingChange.incidencia.id, pendingChange.fromStatus);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancelar el cambio de estado
  const cancelStatusChange = () => {
    setShowModal(false);
    setPendingChange(null);
    setValidationError(null);
  };

  return {
    draggedItem,
    isDragging,
    isUpdating,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDrop,
    // Modal states
    showModal,
    pendingChange,
    validationError,
    confirmStatusChange,
    cancelStatusChange
  };
};