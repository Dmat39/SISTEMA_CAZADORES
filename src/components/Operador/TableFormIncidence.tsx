import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { ChevronDown, Check } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { cn } from "../../lib/utils";
import { updateIncidenceStatusApi } from "../../api/operador/incidenceApi";
import { KANBAN_STATES, translateStatusError, getSoftBadgeClass } from "./kanban/kanbanConfig";
import { validateStatusTransition } from "./kanban/statusValidation";
import CustomTablePagination from "../Pagination/TablePagination";

const TableFormIncidence = ({ incidencias = [], onIncidenciaUpdate }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Vuelve a la página 1 cuando cambia la búsqueda/filtro (la lista entrante cambia de tamaño)
  useEffect(() => {
    setPage(1);
  }, [incidencias.length]);

  const handlePageLimitChange = (newPage, newLimit) => {
    setPage(newPage);
    setLimit(newLimit);
  };

  const paginated = incidencias.slice((page - 1) * limit, page * limit);

  const handleRowClick = (id) => {
    localStorage.setItem("last_created_incidence_id", id);
    navigate("/dashboard/cazador/incidencia/detalle");
  };

  const handleStatusChange = async (nuevoEstado, incidencia) => {
    if (nuevoEstado === incidencia.status) return;

    const validation = validateStatusTransition(incidencia.status, nuevoEstado, incidencia);
    if (!validation.isValid) {
      toast.error(translateStatusError(validation.errorMessage));
      return;
    }

    onIncidenciaUpdate?.(incidencia.id, nuevoEstado);
    try {
      await updateIncidenceStatusApi(incidencia.id, nuevoEstado);
      toast.success(`Incidencia movida a ${KANBAN_STATES[nuevoEstado]?.titulo}`);
    } catch (error) {
      onIncidenciaUpdate?.(incidencia.id, incidencia.status);
      toast.error("Error al actualizar el estado de la incidencia");
    }
  };

  if (incidencias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <DocumentTextIcon className="h-10 w-10 text-[#a89878] dark:text-gray-600" />
        <p className="text-sm font-medium text-[#a89878] dark:text-gray-400">No se encontraron incidencias</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-[#e8dfc8] dark:border-white/10 overflow-hidden">
      <table className="min-w-full divide-y divide-[#e8dfc8] dark:divide-white/8">
        <thead className="bg-[#f0e6d0] dark:bg-[#1e293b]">
          <tr>
            {['Incidencia', 'Estado', 'Medio', 'Zona', 'Crimen', 'Fecha', 'Registros'].map((h) => (
              <th key={h} className={`px-4 py-3 text-xs font-semibold text-[#a89878] dark:text-gray-400 uppercase tracking-wider ${h === 'Estado' ? 'text-center' : 'text-left'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[#fdfbf5] dark:bg-[#111827] divide-y divide-[#e8dfc8] dark:divide-white/5">
          {paginated.map((inc) => {
            const {
              id,
              name,
              comunication,
              zone,
              date: dateString,
              records = [],
              status,
              crime,
              code,
            } = inc;
            const date = dayjs(dateString);

            return (
              <tr
                key={id}
                onClick={() => handleRowClick(id)}
                className="hover:bg-[#f7f0e0] dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 max-w-[240px]">
                  <p className="text-sm font-medium text-[#3d2f1f] dark:text-white truncate">{name || "Sin título"}</p>
                  <p className="text-xs text-[#a89878] dark:text-gray-400">{code || "Sin código"}</p>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center">
                    <Listbox value={status} onChange={(value) => handleStatusChange(value, inc)}>
                      <div className="relative">
                        <Listbox.Button className={cn("flex items-center justify-center gap-1 w-28 pl-2.5 pr-1.5 py-1 rounded-full transition-colors outline-none", getSoftBadgeClass(status))}>
                          <span className="text-xs font-semibold truncate">
                            {KANBAN_STATES[status]?.titulo || status}
                          </span>
                          <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                        </Listbox.Button>
                        <Listbox.Options className="absolute z-20 mt-1 min-w-[9rem] rounded-lg bg-[#fdfbf5] dark:bg-[#1e293b] border border-[#e8dfc8] dark:border-white/10 shadow-lg py-1 focus:outline-none">
                          {Object.entries(KANBAN_STATES).map(([value, config]) => (
                            <Listbox.Option
                              key={value}
                              value={value}
                              className={({ active }) => cn(
                                "flex items-center gap-2 px-3 py-2 text-xs cursor-pointer",
                                active ? "bg-[#f0e6d0] dark:bg-white/10" : "",
                              )}
                            >
                              {({ selected }) => (
                                <>
                                  <span className={cn("flex-1 font-medium", config.color)}>{config.titulo}</span>
                                  {selected && <Check className="h-3.5 w-3.5 text-[#a89878]" />}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </Listbox>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[#7a6a52] dark:text-gray-300 max-w-[120px] truncate">{comunication?.name || "Sin medio"}</td>
                <td className="px-4 py-3 text-sm text-[#7a6a52] dark:text-gray-300 max-w-[120px] truncate">{zone?.name || "Sin zona"}</td>
                <td className="px-4 py-3 text-sm text-[#7a6a52] dark:text-gray-300 max-w-[140px] truncate">{crime?.name || "Sin crimen"}</td>
                <td className="px-4 py-3 text-sm text-[#7a6a52] dark:text-gray-300 whitespace-nowrap">{date.format("DD/MM/YYYY HH:mm")}</td>
                <td className="px-4 py-3 text-sm text-[#7a6a52] dark:text-gray-300 whitespace-nowrap">{records.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      <CustomTablePagination
        count={incidencias.length}
        page={page}
        limit={limit}
        handlePageLimitChange={handlePageLimitChange}
      />
    </div>
  );
};

export default TableFormIncidence;
