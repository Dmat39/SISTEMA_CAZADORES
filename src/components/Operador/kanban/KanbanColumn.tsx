import { Button } from "../../UI/button";
import { cn } from "../../../lib/utils";
import Icon from "@mdi/react";
import { icons } from "../../../plugins/IconLibrary";
import IncidenciaCard from './IncidenciaCard';
import { useTheme } from "../../../contexts/ThemeContext";

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
  const { isDark } = useTheme();

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
      <div className={cn("relative overflow-hidden mb-3 px-3.5 py-3 rounded-xl border", config.borderColor, config.bgColor)}>
        <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.accentColor)} />
        <div className="flex items-center justify-between pl-1.5">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full shrink-0", config.solidColor)} />
            <span className="text-[#3d2f1f] dark:text-white font-semibold text-sm">{config.titulo}</span>
          </div>
          <span className={cn("inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold text-white", config.solidColor)}>
            {stats.count}
          </span>
        </div>
        <p className={cn("text-xs mt-1 pl-1.5 font-medium", config.color)}>
          {config.description}
        </p>
      </div>

      {/* Cards Container: altura fija (no visible) para que las 3 columnas se vean parejas */}
      <div className="flex-1 relative">
        <div
          ref={(el) => {
            if (el) {
              scrollRef.current[estado] = el;
              setTimeout(() => checkScrollable(estado), 300);
            }
          }}
          className="space-y-3 h-[calc(100vh-320px)] overflow-y-auto px-2 scrollbar-hide"
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

          {incidencias.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Icon path={icons.mdiNoteAlertOutline} size={1.2} className="text-[#e8dfc8] dark:text-gray-700" />
              <p className="text-xs text-[#a89878] dark:text-gray-600">Sin incidencias aquí</p>
            </div>
          )}

          {/* Add Item Button - Only in first column */}
          {estado === "previous" && (
            <Button
              onClick={onAddIncidencia}
              variant="ghost"
              className="w-full justify-start text-[#a89878] dark:text-gray-400 hover:text-[#3d2f1f] dark:hover:text-white hover:bg-[#f0e6d0] dark:hover:bg-gray-800/50 border border-dashed border-[#e8dfc8] dark:border-gray-700 hover:border-[#a89878] dark:hover:border-gray-600 bg-transparent h-auto py-3"
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
              background: isDark
                ? 'linear-gradient(to top, rgb(10 15 30) 0%, rgb(10 15 30 / 0.95) 30%, rgb(10 15 30 / 0.7) 60%, transparent 100%)'
                : 'linear-gradient(to top, rgb(247 242 231) 0%, rgb(247 242 231 / 0.95) 30%, rgb(247 242 231 / 0.7) 60%, transparent 100%)',
            }}
          />
        )}

        {/* Scroll indicator */}
        {scrollState?.isScrollable && !scrollState?.isAtBottom && (
          <div className="absolute bottom-2 right-2 flex items-center justify-center w-6 h-6 bg-[#e8dfc8] dark:bg-gray-700/80 rounded-full pointer-events-none z-20">
            <div className="w-1 h-3 bg-[#a89878] dark:bg-gray-400 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
