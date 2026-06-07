import { Button } from "../UI/button";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import { useNavigate } from "react-router-dom";
import { KANBAN_STATES } from "./kanban/kanbanConfig";
import { useDragAndDrop } from "./kanban/useDragAndDrop";
import { useKanbanScroll } from "./kanban/useKanbanScroll";
import KanbanColumn from "./kanban/KanbanColumn";
import StatusChangeModal from "./kanban/StatusChangeModal";
const KanbanIncidencias = ({ incidencias = [], onIncidenciaUpdate, onAddIncidencia }) => {
  const navigate = useNavigate();

  // Custom hooks
  const dragAndDrop = useDragAndDrop(incidencias, onIncidenciaUpdate);
  const scroll = useKanbanScroll(incidencias);

  // Utility functions
  const getIncidenciasPorEstado = (estado) => {
    return incidencias.filter(inc => inc.status === estado);
  };

  const getColumnStats = (estado) => {
    const items = getIncidenciasPorEstado(estado);
    return {
      count: items.length,
      estimate: items.length * 2
    };
  };

  const handleCardClick = (e, id) => {
    if (!dragAndDrop.isDragging && !dragAndDrop.draggedItem) {
      localStorage.setItem("last_created_incidence_id", id);
      navigate('/dashboard/cazador/incidencia/detalle');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Sistema de Control de Incidencias</h1>
          <p className="text-gray-500 dark:text-gray-400">Flujo de seguimiento para operadores</p>
        </div>
        <Button
          onClick={onAddIncidencia}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Icon path={icons.add} size={0.8} className="mr-2" />
          Agregar Incidencia
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(KANBAN_STATES).map(([estado, config]) => {
          const stats = getColumnStats(estado);
          return (
            <KanbanColumn
              key={estado}
              estado={estado}
              config={config}
              stats={stats}
              incidencias={getIncidenciasPorEstado(estado)}
              isDragging={dragAndDrop.isDragging}
              scrollState={scroll.scrollStates[estado]}
              scrollRef={scroll.scrollRefs}
              onDragOver={dragAndDrop.handleDragOver}
              onDragEnter={dragAndDrop.handleDragEnter}
              onDrop={dragAndDrop.handleDrop}
              onScroll={scroll.handleScroll}
              onCardDragStart={dragAndDrop.handleDragStart}
              onCardDragEnd={dragAndDrop.handleDragEnd}
              onCardClick={handleCardClick}
              onAddIncidencia={onAddIncidencia}
              checkScrollable={scroll.checkScrollable}
            />
          );
        })}
      </div>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={dragAndDrop.showModal}
        onClose={dragAndDrop.cancelStatusChange}
        onConfirm={dragAndDrop.confirmStatusChange}
        incidencia={dragAndDrop.pendingChange?.incidencia}
        fromStatus={dragAndDrop.pendingChange?.fromStatus}
        toStatus={dragAndDrop.pendingChange?.toStatus}
        errorMessage={dragAndDrop.validationError}
        isLoading={dragAndDrop.isUpdating}
      />

      {/* Loading overlay */}
      {dragAndDrop.isUpdating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
            <span className="text-gray-900 dark:text-white">Actualizando estado...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanIncidencias;
