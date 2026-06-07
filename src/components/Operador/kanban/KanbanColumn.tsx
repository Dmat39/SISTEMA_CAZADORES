import { Button } from "../../UI/button";
import { cn } from "../../../lib/utils";
import Icon from "@mdi/react";
import { icons } from "../../../plugins/IconLibrary";
import IncidenciaCard from './IncidenciaCard';

const KanbanColumn = ({
  estado,
  config,
  stats,
  incidencias,
  isDragging,
  scrollState,
  scrollRef,
  onDragOver,
  onDragEnter,
  onDrop,
  onScroll,
  onCardDragStart,
  onCardDragEnd,
  onCardClick,
  onAddIncidencia,
  checkScrollable
}) => {
  return (
    <div
      className={cn(
        "flex flex-col transition-all duration-200",
        isDragging && "ring-2 ring-blue-500/30 rounded-lg"
      )}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDrop={(e) => onDrop(e, estado)}
    >
      {/* Column Header */}
      <div className={cn("flex items-center justify-between mb-4 px-3 py-2 rounded-lg",config.borderColor, config.bgColor, "border")}>
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", config.bgColor, config.borderColor, "border")} />
          <span className="text-white font-medium text-sm">{config.titulo}</span>
          <span className="text-gray-400 text-sm">{stats.count}</span>
          {/* <span className="text-gray-500 text-xs">Estimate: {stats.estimate}</span> */}
        </div>
      </div>

      {/* Column Description */}
      <p className="text-gray-400 text-xs mb-4 px-3">
        {config.description}
      </p>

      {/* Cards Container */}
      <div className="flex-1 relative">
        <div
          ref={(el) => {
            if (el) {
              scrollRef.current[estado] = el;
              setTimeout(() => checkScrollable(estado), 300);
            }
          }}
          className="space-y-3 min-h-[500px] max-h-[calc(100vh-300px)] overflow-y-auto px-2 scrollbar-hide"
          onScroll={() => onScroll(estado)}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {incidencias.map((incidencia) => (
            <IncidenciaCard
              key={incidencia.id}
              incidencia={incidencia}
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
              onClick={onCardClick}
            />
          ))}

          {/* Add Item Button - Only in first column */}
          {estado === "previous" && (
            <Button
              onClick={onAddIncidencia}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50 border border-dashed border-gray-700 hover:border-gray-600 bg-transparent h-auto py-3"
            >
              <Icon path={icons.add} size={0.6} className="mr-2" />
              Agregar elemento
            </Button>
          )}
        </div>

        {/* Fade effect */}
        {scrollState?.showFade && (
          <div
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to top, rgb(3 7 18) 0%, rgb(3 7 18 / 0.95) 30%, rgb(3 7 18 / 0.7) 60%, transparent 100%)'
            }}
          />
        )}

        {/* Scroll indicator */}
        {scrollState?.isScrollable && !scrollState?.isAtBottom && (
          <div className="absolute bottom-2 right-2 flex items-center justify-center w-6 h-6 bg-gray-700/80 rounded-full pointer-events-none z-20">
            <div className="w-1 h-3 bg-gray-400 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;