import { Card, CardContent } from "../../UI/card";
import { cn } from "../../../lib/utils";
import Icon from "@mdi/react";
import { icons } from "../../../plugins/IconLibrary";
import { CalendarDaysIcon, ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { formatStatus, KANBAN_STATES } from './kanbanConfig';

const IncidenciaCard = ({
  incidencia,
  onDragStart,
  onDragEnd,
  onClick
}) => {
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
  const accentColor = KANBAN_STATES[status]?.solidColor || "bg-gray-400";
  const date = dayjs(dateString);
  const isPM = date.hour() >= 12;

  const handleMouseDown = (e) => {
    e.currentTarget.style.cursor = "grabbing";
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.cursor = "grab";
  };

  return (
    <Card
      className="relative overflow-hidden border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-sm hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/40 transition-all duration-200 hover:-translate-y-0.5 select-none"
      style={{ cursor: "grab" }}
      draggable={true}
      onDragStart={(e) => onDragStart(e, id)}
      onDragEnd={onDragEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={(e) => onClick(e, id)}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", accentColor)} />
      <CardContent className="pl-5 pr-4 py-3 flex flex-col h-full">
        <div className="flex flex-col gap-3 flex-1">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2 min-h-[2.5rem]">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white text-pretty leading-tight line-clamp-2">
              {name || "Sin título"}
            </h3>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shrink-0 ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 dark:text-gray-300 text-pretty line-clamp-3 min-h-[3rem]">
            {description || "Sin descripción"}
          </p>

          {/* Metadata */}
          <div className="space-y-2 mt-auto pt-1">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <Icon path={icons.attach} size={0.5} className="shrink-0" />
                <span className="truncate">{comunication?.name || "Sin medio"}</span>
              </div>
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <Icon path={icons.map} size={0.5} className="shrink-0" />
                <span className="truncate">{zone?.name || "Sin zona"}</span>
              </div>
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <Icon path={icons.mdiHandcuffs} size={0.5} className="shrink-0" />
                <span className="truncate">{crime?.name || "Sin crimen"}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1 shrink-0">
                <CalendarDaysIcon className="h-3 w-3" />
                <span>{date.format("DD/MM/YYYY")}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <ClockIcon className="h-3 w-3" />
                <span>{date.format("hh:mm")} {isPM ? "p.m." : "a.m."}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <DocumentTextIcon className="h-3 w-3" />
                <span>{records.length} Registros</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidenciaCard;
