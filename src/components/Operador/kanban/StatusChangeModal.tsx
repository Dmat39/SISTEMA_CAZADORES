import { useState } from "react";
import { Button } from "../../UI/button";
import { Badge } from "../../UI/badge";
import Icon from "@mdi/react";
import { icons } from "../../../plugins/IconLibrary";
import { KANBAN_STATES } from "./kanbanConfig";

const StatusChangeModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  incidencia, 
  fromStatus, 
  toStatus, 
  errorMessage = null,
  isLoading = false 
}) => {
  if (!isOpen) return null;

  // Mapeo de estados para mostrar en español
  const getStatusDisplayName = (status) => {
    return KANBAN_STATES[status]?.titulo || status;
  };

  // Mapeo de colores para los badges
  const getStatusColor = (status) => {
    const colorMap = {
      previous: "bg-orange-600",
      process: "bg-blue-600", 
      completed: "bg-purple-600",
      finished: "bg-green-600"
    };
    return colorMap[status] || "bg-gray-600";
  };

  // Traducir mensajes de error al español
  const translateErrorMessage = (message) => {
    const translations = {
      "Invalid transition: previous can only move to process": 
        "Transición inválida: El estado 'Previo' solo puede cambiar a 'En Proceso'",
      "Invalid transition: process can only move to completed": 
        "Transición inválida: El estado 'En Proceso' solo puede cambiar a 'En Ejecución'",
      "Invalid transition: completed can only move to finished": 
        "Transición inválida: El estado 'En Ejecución' solo puede cambiar a 'Finalizado'",
      "Cannot change status to completed without assigning a code to the incident": 
        "No se puede cambiar a 'En Ejecución' sin asignar un código a la incidencia",
      "Cannot move backwards in the workflow": 
        "No se puede retroceder en el flujo de trabajo",
      "Cannot skip states in the workflow": 
        "No se puede saltar estados en el flujo de trabajo"
    };
    
    return translations[message] || message;
  };

  const isError = !!errorMessage;
  const translatedError = errorMessage ? translateErrorMessage(errorMessage) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#111827] rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isError ? 'bg-red-600' : 'bg-green-600'
            }`}>
              <Icon 
                path={isError ? icons.close : icons.mdiCheckBold} 
                size={0.8} 
                className="text-white" 
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isError ? 'Cambio de Estado No Permitido' : 'Confirmar Cambio de Estado'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1"
          >
            <Icon path={icons.close} size={0.8} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Incidencia Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Incidencia:</h4>
            <p className="text-gray-900 dark:text-white font-medium text-sm line-clamp-2">
              {incidencia?.name || "Sin título"}
            </p>
            {incidencia?.code && (
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                Código: {incidencia.code}
              </p>
            )}
          </div>

          {/* Status Change Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
              {isError ? 'Cambio Solicitado:' : 'Cambio de Estado:'}
            </h4>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(fromStatus)} text-white text-xs mb-1`}>
                  {getStatusDisplayName(fromStatus)}
                </Badge>
                <p className="text-xs text-gray-500 dark:text-gray-500">Estado Actual</p>
              </div>
              
              <Icon 
                path={icons.arrowLeft} 
                size={1} 
                className={`text-gray-400 rotate-180 ${isError ? 'text-red-400' : ''}`} 
              />
              
              <div className="text-center">
                <Badge className={`${getStatusColor(toStatus)} text-white text-xs mb-1`}>
                  {getStatusDisplayName(toStatus)}
                </Badge>
                <p className="text-xs text-gray-500 dark:text-gray-500">Estado Destino</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {isError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon path={icons.information} size={0.8} className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-red-600 dark:text-red-400 font-medium text-sm mb-1">Error de Validación</h5>
                  <p className="text-red-600 dark:text-red-300 text-sm">{translatedError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {!isError && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon path={icons.information} size={0.8} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    ¿Estás seguro de que deseas cambiar el estado de esta incidencia?
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-white/10">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {isError ? 'Entendido' : 'Cancelar'}
          </Button>
          
          {!isError && (
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cambiando...</span>
                </div>
              ) : (
                'Confirmar Cambio'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;