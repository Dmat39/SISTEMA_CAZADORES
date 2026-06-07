// Validaciones para transiciones de estado del Kanban

// Flujo válido de estados (puede avanzar o retroceder, excepto desde finished)
const VALID_TRANSITIONS = {
    previous: ['process'],
    process: ['completed', 'previous'],
    completed: ['finished', 'process', 'previous'],
    finished: [] // Estado final, no puede cambiar
};

// Orden de los estados para detectar retrocesos
const STATE_ORDER = {
    previous: 0,
    process: 1,
    completed: 2,
    finished: 3
};

/**
 * Valida si una transición de estado es permitida
 * @param {string} fromStatus - Estado actual
 * @param {string} toStatus - Estado destino
 * @param {object} incidencia - Objeto de la incidencia
 * @returns {object} - { isValid: boolean, errorMessage: string }
 */
export const validateStatusTransition = (fromStatus, toStatus, incidencia = {}) => {
    // Si es el mismo estado, no hacer nada
    if (fromStatus === toStatus) {
        return { isValid: false, errorMessage: "No se puede cambiar al mismo estado" };
    }

    // Verificar si se está saltando estados hacia adelante (no se puede saltar más de 1)
    if (STATE_ORDER[toStatus] > STATE_ORDER[fromStatus] + 1) {
        return {
            isValid: false,
            errorMessage: "Cannot skip states in the workflow"
        };
    }

    // Verificar transiciones válidas específicas
    const validNextStates = VALID_TRANSITIONS[fromStatus] || [];
    if (!validNextStates.includes(toStatus)) {
        const errorMessages = {
            previous: "Invalid transition: previous can only move to process",
            process: "Invalid transition: process can only move to completed",
            completed: "Invalid transition: completed can only move to finished"
        };

        return {
            isValid: false,
            errorMessage: errorMessages[fromStatus] || "Invalid transition"
        };
    }

    // Validaciones específicas por estado destino
    if (toStatus === 'completed') {
        // Para cambiar a "En Ejecución" se necesita un código asignado
        if (!incidencia.code) {
            return {
                isValid: false,
                errorMessage: "Cannot change status to completed without assigning a code to the incident"
            };
        }
    }

    // Si llegamos aquí, la transición es válida
    return { isValid: true, errorMessage: null };
};

/**
 * Obtiene los estados válidos siguientes para un estado dado
 * @param {string} currentStatus - Estado actual
 * @returns {array} - Array de estados válidos siguientes
 */
export const getValidNextStates = (currentStatus) => {
    return VALID_TRANSITIONS[currentStatus] || [];
};

/**
 * Verifica si un estado es final (no puede cambiar)
 * @param {string} status - Estado a verificar
 * @returns {boolean} - True si es estado final
 */
export const isFinalState = (status) => {
    return status === 'finished';
};