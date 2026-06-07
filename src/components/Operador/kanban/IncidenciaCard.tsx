import { Card, CardContent } from "../../UI/card";
import Icon from "@mdi/react";
import { icons } from "../../../plugins/IconLibrary";
import { CalendarDaysIcon, ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { formatStatus } from './kanbanConfig';

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
      className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/30 backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02] select-none"
      style={{ cursor: "grab" }}
      draggable={true}
      onDragStart={(e) => onDragStart(e, id)}
      onDragEnd={onDragEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={(e) => onClick(e, id)}
    >
      <CardContent className="px-4 py-2">
        <div className="space-y-3">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white text-pretty leading-tight line-clamp-2">
              {name || "Sin título"}
            </h3>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shrink-0 ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 dark:text-gray-300 text-pretty line-clamp-3">
            {description || "Sin descripción"}
          </p>

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Icon path={icons.attach} size={0.5} />
                <span>{comunication?.name || "Sin medio"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon path={icons.map} size={0.5} />
                <span>{zone?.name || "Sin zona"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon path={icons.mdiHandcuffs} size={0.5} />
                <span>{crime?.name || "Sin crimen"}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <CalendarDaysIcon className="h-3 w-3" />
                <span>{date.format("DD/MM/YYYY")}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                <span>{date.format("hh:mm")} {isPM ? "p.m." : "a.m."}</span>
              </div>
              <div className="flex items-center gap-1">
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
