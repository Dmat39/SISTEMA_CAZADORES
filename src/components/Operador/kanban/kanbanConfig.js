// Configuración centralizada del Kanban
export const KANBAN_STATES = {
  previous: {
    titulo: "Previo",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    description: "Este estado es de preincidencias"
  },
  process: {
    titulo: "En Proceso",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    description: "Está listo para aceptar registros"
  },
  completed: {
    titulo: "En Ejecución",
    color: "text-red-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-red-400/30",
    description: "Se está resolviendo la incidencia"
  },
  finished: {
    titulo: "Finalizado",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
    description: "Estado de incidencia concretado"
  }
};

export const STATUS_MAPPING = {
  previous: { text: "previo", color: "bg-orange-600 hover:bg-orange-700" },
  process: { text: "proceso", color: "bg-blue-600 hover:bg-blue-700" },
  completed: { text: "ejecucion", color: "bg-purple-600 hover:bg-purple-700" },
  finished: { text: "finalizado", color: "bg-green-600 hover:bg-green-700" },
};

export const formatStatus = (status) => {
  return STATUS_MAPPING[status] || { text: status, color: "bg-gray-600 hover:bg-gray-700" };
};