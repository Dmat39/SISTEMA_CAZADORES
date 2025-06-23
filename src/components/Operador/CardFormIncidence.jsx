import { CalendarDaysIcon, ClockIcon, DocumentTextIcon, CameraIcon } from "@heroicons/react/24/outline";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const CardForm = ({ incidencias = [] }) => {
  const navigate = useNavigate();

  // Mapear estado a texto y estilos
  const formatStatus = (status) => {
    const statusMap = {
      process: { text: "En Proceso", color: "bg-blue-100 text-blue-900" },
      completed: { text: "Completado", color: "bg-green-100 text-green-900" },
      finished: { text: "Finalizado", color: "bg-red-100 text-red-900" },
    };
    return statusMap[status] || { text: status, color: "bg-gray-100 text-gray-900" };
  };

  // Navegar al detalle de incidencia
  const handleCardClick = (id) => {
    localStorage.setItem("last_created_incidence_id", id);
    navigate("/dashboard/operador/incidencia/detalle");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 h-[65vh] overflow-y-auto">
      {incidencias.map((inc) => {
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
        } = inc;

        const statusInfo = formatStatus(status);
        const date = dayjs(dateString);
        const isPM = date.hour() >= 12;

        return (
          <div
            key={id}
            onClick={() => handleCardClick(id)}
            className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Título + Estado */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl line-clamp-2 text-gray-900 font-semibold w-72">{name}</h3>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>

            {/* Descripción */}
            <p className="text-gray-700 mb-3 line-clamp-3">{description || "Sin descripción"}</p>

            {/* Datos secundarios */}
            <div className="flex justify-between items-center gap-4 border-b border-gray-200 pb-3">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center space-x-1">
                  <Icon path={icons.attach} className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{comunication?.name || "Sin medio"}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon path={icons.map} className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{zone?.name || "Sin zona"}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon path={icons.mdiHandcuffs} className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{crime?.name || "Sin crimen"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center space-x-1">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{date.format("DD/MM/YYYY")}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {date.format("hh:mm")} {isPM ? "p.m." : "a.m."}
                  </span>
                </div>
              </div>
            </div>

            {/* Registros e Imágenes */}
            <div className="pt-3 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{records.length} Registros</span>
              </div>
              <div className="flex items-center space-x-1">
                <CameraIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Con imágenes</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardForm;
