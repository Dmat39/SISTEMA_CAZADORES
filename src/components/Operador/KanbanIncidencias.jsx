import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../UI/card";
import { Button } from "../UI/button";
import { Badge } from "../UI/badge";
import { cn } from "../../lib/utils";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import { toast } from "sonner";
import { updateIncidenceStatusApi } from "../../api/operador/incidenceApi";
import { CalendarDaysIcon, ClockIcon, DocumentTextIcon, CameraIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const KanbanIncidencias = ({ incidencias = [], onIncidenciaUpdate, onAddIncidencia }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [scrollStates, setScrollStates] = useState({});
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const scrollRefs = useRef({});

  // Configuración de estados del Kanban
  const estadosConfig = {
    previous: {
      titulo: "Previo",
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
      borderColor: "border-orange-400/20",
      description: "Este elemento no ha sido iniciado"
    },
    process: {
      titulo: "En Proceso",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/20",
      description: "Está listo para ser recogido"
    },
    completed: {
      titulo: "En Ejecución",
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      borderColor: "border-red-400/20",
      description: "Se está trabajando activamente en esto"
    },
    finished: {
      titulo: "Finalizado",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/20",
      description: "Este elemento está en revisión"
    }
  };

  // Mapear estado a texto y estilos para las badges
  const formatStatus = (status) => {
    const statusMap = {
      previous: { text: "previo", color: "bg-orange-600 hover:bg-orange-700" },
      process: { text: "proceso", color: "bg-blue-600 hover:bg-blue-700" },
      completed: { text: "ejecucion", color: "bg-red-600 hover:bg-red-700" },
      finished: { text: "finalizado", color: "bg-purple-600 hover:bg-purple-700" },
    };
    return statusMap[status] || { text: status, color: "bg-gray-600 hover:bg-gray-700" };
  };

  // Estado para controlar si se está arrastrando
  const [isDragging, setIsDragging] = useState(false);

  // Funciones para el drag and drop (mejoradas)
  const handleDragStart = (e, incidenciaId) => {
    console.log("Drag started for:", incidenciaId); // Debug
    setDraggedItem(incidenciaId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", incidenciaId);

    // Agregar clase visual al elemento arrastrado con opacidad más sutil
    e.target.style.opacity = "0.5";

    // Prevenir el click cuando se inicia el drag
    e.stopPropagation();
  };

  const handleDragEnd = (e) => {
    // Restaurar opacidad
    e.target.style.opacity = "1";
    setIsDragging(false);

    // Pequeño delay para evitar que se ejecute el click después del drag
    setTimeout(() => {
      setDraggedItem(null);
    }, 100);
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

    console.log("Drop event triggered for state:", nuevoEstado); // Debug
    console.log("Dragged item:", draggedItem); // Debug

    if (draggedItem && !isUpdating) {
      const incidencia = incidencias.find(inc => inc.id === draggedItem);
      console.log("Found incidencia:", incidencia); // Debug

      // Verificar si el estado es diferente
      if (incidencia && incidencia.status !== nuevoEstado) {
        try {
          setIsUpdating(true);
          console.log("Updating status from", incidencia.status, "to", nuevoEstado); // Debug

          // Actualizar el estado local inmediatamente para mejor UX
          if (onIncidenciaUpdate) {
            onIncidenciaUpdate(draggedItem, nuevoEstado);
          }

          // Llamar a la API para actualizar el estado
          await updateIncidenceStatusApi(draggedItem, nuevoEstado);

          toast.success(`Incidencia movida a ${estadosConfig[nuevoEstado]?.titulo}`);
        } catch (error) {
          console.error("Error al actualizar estado:", error);
          toast.error("Error al actualizar el estado de la incidencia");

          // Revertir el cambio local si falla la API
          if (onIncidenciaUpdate && incidencia) {
            onIncidenciaUpdate(draggedItem, incidencia.status);
          }
        } finally {
          setIsUpdating(false);
        }
      }

      // Limpiar el estado de drag
      setDraggedItem(null);
      setIsDragging(false);
    }
  };

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

  // Función para verificar si hay scroll disponible (optimizada)
  const checkScrollable = (estado) => {
    const scrollElement = scrollRefs.current[estado];
    if (scrollElement) {
      const isScrollable = scrollElement.scrollHeight > scrollElement.clientHeight;
      const isAtBottom = scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 10;

      setScrollStates(prev => {
        const currentState = prev[estado];
        // Solo actualizar si hay cambios para evitar re-renders innecesarios
        if (!currentState ||
          currentState.isScrollable !== isScrollable ||
          currentState.isAtBottom !== isAtBottom) {
          return {
            ...prev,
            [estado]: {
              isScrollable,
              isAtBottom,
              showFade: isScrollable && !isAtBottom
            }
          };
        }
        return prev;
      });
    }
  };

  // Manejar el evento de scroll con throttling
  const handleScroll = (estado) => {
    // Usar requestAnimationFrame para throttling
    requestAnimationFrame(() => {
      checkScrollable(estado);
    });
  };

  // Effect para verificar el scroll cuando cambian las incidencias (con delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      Object.keys(estadosConfig).forEach(estado => {
        checkScrollable(estado);
      });
    }, 200); // Delay para evitar interferir con drag and drop

    return () => clearTimeout(timeoutId);
  }, [incidencias]);

  // Navegar al detalle de incidencia (mejorado para evitar conflicto con drag)
  const handleCardClick = (e, id) => {
    // Solo navegar si no se está arrastrando
    if (!isDragging && !draggedItem) {
      localStorage.setItem("last_created_incidence_id", id);
      navigate("/dashboard/operador/incidencia/detalle");
    }
  };

  // Componente de Card personalizado para el Kanban
  const IncidenciaCard = ({ incidencia }) => {
    const {
      id,
      name,
      description,
      comunication,
      zone,
      date: dateString,
      records = [],
      status,
      crime,
    } = incidencia;

    const statusInfo = formatStatus(status);
    const date = dayjs(dateString);
    const isPM = date.hour() >= 12;

    // Manejar el mousedown para mejorar la respuesta del drag
    const handleMouseDown = (e) => {
      // Preparar para posible drag
      e.currentTarget.style.cursor = "grabbing";
    };

    const handleMouseUp = (e) => {
      // Restaurar cursor
      e.currentTarget.style.cursor = "grab";
    };

    return (
      <Card
        className="cursor-move hover:bg-gray-800/50 transition-all duration-200 border-gray-800 bg-gray-900/30 backdrop-blur-sm"
        style={{ cursor: "grab" }}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, id)}
        onDragEnd={handleDragEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={(e) => handleCardClick(e, id)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-white text-pretty leading-tight line-clamp-2">
                {name || "Sin título"}
              </h3>
              <Badge className={`${statusInfo.color} text-white text-xs shrink-0`}>
                {statusInfo.text}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-300 text-pretty line-clamp-3">
              {description || "Sin descripción"}
            </p>

            {/* Metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Icon path={icons.attach} size={0.5} />
                  <span>{comunication?.name || "Sin medio"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon path={icons.map} size={0.5} />
                  <span>{zone?.name || "Sin zona"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <CalendarDaysIcon className="h-3 w-3" />
                  <span>{date.format("DD/MM/YYYY")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>{date.format("hh:mm")} {isPM ? "p.m." : "a.m."}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Icon path={icons.mdiHandcuffs} size={0.5} />
                  <span>{crime?.name || "Sin crimen"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <DocumentTextIcon className="h-3 w-3" />
                  <span>{records.length} Registros</span>
                </div>
                <div className="flex items-center gap-1">
                  <CameraIcon className="h-3 w-3" />
                  <span>Con imágenes</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">Sistema de Control de Incidencias</h1>
          <p className="text-gray-400">Flujo de seguimiento para operadores</p>
        </div>
        <Button
          onClick={onAddIncidencia}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Icon path={icons.add} size={0.8} className="mr-2" />
          Agregar Incidencia
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(estadosConfig).map(([estado, config]) => {
          const stats = getColumnStats(estado);
          return (
            <div
              key={estado}
              className={cn(
                "flex flex-col transition-all duration-200",
                isDragging && "ring-2 ring-blue-500/30 rounded-lg"
              )}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDrop={(e) => handleDrop(e, estado)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", config.bgColor, config.borderColor, "border")} />
                  <span className="text-white font-medium text-sm">{config.titulo}</span>
                  <span className="text-gray-400 text-sm">{stats.count}</span>
                  <span className="text-gray-500 text-xs">Estimate: {stats.estimate}</span>
                </div>
                {/* <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                  <Icon path={icons.mdiFlag} size={0.6} />
                </Button> */}
              </div>

              {/* Column Description */}
              <p className="text-gray-400 text-xs mb-4 px-3">
                {config.description}
              </p>

              {/* Cards Container */}
              <div className="flex-1 relative">
                {/* Scrollable container with invisible scrollbar */}
                <div
                  ref={(el) => {
                    if (el) {
                      scrollRefs.current[estado] = el;
                      // Verificar scroll cuando se monta el elemento con más delay
                      setTimeout(() => checkScrollable(estado), 300);
                    }
                  }}
                  className="space-y-3 min-h-[500px] max-h-[calc(100vh-300px)] overflow-y-auto px-2 scrollbar-hide"
                  onScroll={() => handleScroll(estado)}
                  style={{
                    scrollbarWidth: 'none', /* Firefox */
                    msOverflowStyle: 'none', /* Internet Explorer 10+ */
                  }}
                >
                  {getIncidenciasPorEstado(estado).map((incidencia) => (
                    <IncidenciaCard key={incidencia.id} incidencia={incidencia} />
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

                {/* Fade effect at the bottom - Only show when there's scrollable content */}
                {scrollStates[estado]?.showFade && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to top, rgb(3 7 18) 0%, rgb(3 7 18 / 0.95) 30%, rgb(3 7 18 / 0.7) 60%, transparent 100%)'
                    }}
                  />
                )}

                {/* Scroll indicator - Small visual hint */}
                {scrollStates[estado]?.isScrollable && !scrollStates[estado]?.isAtBottom && (
                  <div className="absolute bottom-2 right-2 flex items-center justify-center w-6 h-6 bg-gray-700/80 rounded-full pointer-events-none z-20">
                    <div className="w-1 h-3 bg-gray-400 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-white">Actualizando estado...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanIncidencias;