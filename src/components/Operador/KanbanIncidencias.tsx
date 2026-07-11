import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MousePointer2, X } from "lucide-react";
import { KANBAN_STATES } from "./kanban/kanbanConfig";
import { useDragAndDrop } from "./kanban/useDragAndDrop";
import { useKanbanScroll } from "./kanban/useKanbanScroll";
import KanbanColumn from "./kanban/KanbanColumn";
import StatusChangeModal from "./kanban/StatusChangeModal";

const HINT_DISMISSED_KEY = "kanban_drag_hint_dismissed";

const KanbanIncidencias = ({ incidencias = [], onIncidenciaUpdate, onAddIncidencia }) => {
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(() => localStorage.getItem(HINT_DISMISSED_KEY) !== "1");

  const dismissHint = () => {
    localStorage.setItem(HINT_DISMISSED_KEY, "1");
    setShowHint(false);
  };

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
      {/* Aviso de uso: arrastrar para cambiar de estado */}
      {showHint && (
        <div className="flex items-center gap-2.5 mb-4 px-4 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-300 text-sm">
          <MousePointer2 className="h-4 w-4 shrink-0" />
          <span className="flex-1">Tip: arrastra una tarjeta a otra columna para cambiar su estado (si prefieres no arrastrar, usa la vista <strong>Tabla</strong>). Mientras esté en <strong>Previo</strong>, no puedes editarla ni subir registros — primero acéptala pasándola a "En Proceso".</span>
          <button onClick={dismissHint} className="p-1 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
