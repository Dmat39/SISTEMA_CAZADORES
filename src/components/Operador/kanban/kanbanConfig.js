// Configuración centralizada del Kanban
export const KANBAN_STATES = {
  previous: {
    titulo: "Previo",
    color: "text-violet-500 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-400/10",
    borderColor: "border-violet-200 dark:border-violet-400/30",
    solidColor: "bg-violet-500",
    accentColor: "bg-violet-500",
    badgeClass: "bg-gradient-to-r from-violet-500 to-violet-600 shadow-md shadow-violet-500/30",
    description: "Preincidencias, aún sin aceptar"
  },
  process: {
    titulo: "En Proceso",
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-400/10",
    borderColor: "border-blue-200 dark:border-blue-400/30",
    solidColor: "bg-blue-500",
    accentColor: "bg-blue-500",
    badgeClass: "bg-gradient-to-r from-blue-500 to-blue-600 shadow-md shadow-blue-500/30",
    description: "Lista para aceptar registros"
  },
  completed: {
    titulo: "Completado",
    color: "text-green-500 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-400/10",
    borderColor: "border-green-200 dark:border-green-400/30",
    solidColor: "bg-green-500",
    accentColor: "bg-green-500",
    badgeClass: "bg-gradient-to-r from-green-500 to-green-600 shadow-md shadow-green-500/30",
    description: "Incidencia resuelta"
  }
};

export const STATUS_MAPPING = {
  previous: { text: "previo", color: KANBAN_STATES.previous.badgeClass },
  process: { text: "proceso", color: KANBAN_STATES.process.badgeClass },
  completed: { text: "completado", color: KANBAN_STATES.completed.badgeClass },
};

export const formatStatus = (status) => {
  return STATUS_MAPPING[status] || { text: status, color: "bg-gray-600 hover:bg-gray-700" };
};

// Badge "suave": fondo tenue + texto de color, sin gradiente ni sombra (para tablas densas)
export const getSoftBadgeClass = (status) => {
  const config = KANBAN_STATES[status];
  if (!config) return "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400";
  return `${config.bgColor} ${config.color}`;
};

// Traducir mensajes de error de transición de estado al español (compartido por Kanban y Tabla)
const ERROR_TRANSLATIONS = {
  "Invalid transition: previous can only move to process":
    "Transición inválida: El estado 'Previo' solo puede cambiar a 'En Proceso'",
  "Invalid transition: process can only move to completed":
    "Transición inválida: El estado 'En Proceso' solo puede cambiar a 'Completado'",
  "Cannot change status to completed without assigning a code to the incident":
    "No se puede cambiar a 'Completado' sin asignar un código a la incidencia",
  "Cannot move backwards in the workflow":
    "No se puede retroceder en el flujo de trabajo",
  "Cannot skip states in the workflow":
    "No se puede saltar estados en el flujo de trabajo",
};

export const translateStatusError = (message) => {
  return ERROR_TRANSLATIONS[message] || message;
};
