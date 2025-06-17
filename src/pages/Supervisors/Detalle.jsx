import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIncidenceByIdApi } from "../../api/operador/incidenceApi";
import { updateIncidenceApi } from "../../api/supervisor/IncidenceApi"; // Asegúrate de importar esta función
import { createSubRegistroIncidenceApi } from "../../api/operador/registroIncidenceApi";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import dayjs from "dayjs";
import RegistrosList from "../../components/Supervisors/IncidenciaDetalles";
import CreateFormRegister from "../../components/Supervisors/CreateFormRegister";
import { toast } from 'sonner';

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const IncidenciaDetalles = () => {
  const [incidencia, setIncidencia] = useState(null);
  const [showRegistroForm, setShowRegistroForm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();

 
  const statusOptions = [
    { value: 'process', label: 'En Proceso', color: 'bg-blue-100 text-blue-900' },
    { value: 'completed', label: 'Completado', color: 'bg-green-100 text-green-900' },
    { value: 'finished', label: 'Finalizado', color: 'bg-red-100 text-red-900' }
  ];


  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-900';
  };

  // Función para obtener el label en español según el estado
  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  const fetchIncidencia = async () => {
    const id = localStorage.getItem("last_created_incidence_id");
    if (!id) {
      toast.error("No se encontró el ID de la incidencia");
      return;
    }
    try {
      const response = await getIncidenceByIdApi(id);
      setIncidencia(response.data);
    } catch (error) {
      console.error("Error al obtener detalle de incidencia:", error);
      toast.error("Error al cargar los detalles de la incidencia");
    }
  };

  // Función para actualizar el estado de la incidencia
  const handleStatusChange = async (newStatus) => {
    if (!incidencia?.id || updatingStatus) return;
    
    setUpdatingStatus(true);
    try {
      const payload = { status: newStatus };
      await updateIncidenceApi(incidencia.id, payload);
      
      // Actualizar el estado local
      setIncidencia(prev => ({ ...prev, status: newStatus }));
      
      const statusLabel = getStatusLabel(newStatus);
      toast.success(`Estado actualizado a "${statusLabel}" exitosamente`, {
        position: 'top-right',
      });
      
      console.log("Estado actualizado exitosamente a:", newStatus);
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      toast.error("Error al actualizar el estado de la incidencia", {
        position: 'top-right',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    fetchIncidencia();
  }, []);

  if (!incidencia) {
    return <p className="p-4 text-gray-500">Cargando detalle de incidencia...</p>;
  }

  const formattedDate = dayjs(incidencia.date).format("YYYY-MM-DD");
  const formattedTime = dayjs(incidencia.date).format("HH:mm");
  const createdAt = dayjs(incidencia.createdAt).format("D [de] MMMM [de] YYYY");

  const handleRegistroSubmit = async (formData) => {
    try {
      if (!(formData instanceof FormData)) {
        console.error("Error: Se esperaba FormData pero se recibió:", typeof formData);
        toast.error("Error en el formato de los datos del registro");
        return;
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const response = await createSubRegistroIncidenceApi(formData);
      console.log("Registro creado exitosamente:", response);
      
      toast.success("Registro agregado exitosamente", {
        position: 'top-right',
      });
      
      setShowRegistroForm(false);
      await fetchIncidencia(); 
    } catch (err) {
      console.error("Error al guardar el registro:", err);
      toast.error("Error al guardar el registro", {
        position: 'top-right',
      });
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col border-b border-gray-200 pb-4 mb-6">
            <div className="mt-2 mb-3">
              {/* Volver */}
              <button
                onClick={() => navigate("/dashboard/supervisors/incidencia")}
                className="flex items-center text-sm text-gray-600 cursor-pointer">
                <Icon className="text-gray-800" path={icons.arrowLeft} size={0.8} />
                <span className="ml-1 text-black font-medium">Volver</span>
              </button>
            </div>
          <div className="flex flex-row items-start justify-between gap-8">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-4 flex items-center">
                {incidencia.name}
                
                {/* Selector de estado */}
                <div className="ml-4 relative">
                  <select
                    value={incidencia.status || 'process'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className={`${getStatusColor(incidencia.status)} text-sm px-3 py-1 rounded-full font-medium border-0 cursor-pointer appearance-none pr-8 ${updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  {/* Icono de dropdown personalizado */}
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    <Icon 
                      path={updatingStatus ? icons.loading : icons.chevronDown} 
                      size={0.6}
                      className={updatingStatus ? 'animate-spin' : ''}
                    />
                  </div>
                </div>
              </h1>
              <div className="flex items-center text-gray-600 gap-6 text-sm">
                <span className="flex items-center gap-1">
                  <Icon path={icons.calendar} size={0.75} /> Fecha: {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Icon path={icons.clock} size={0.75} /> Hora: {formattedTime}
                </span>
              </div>
              <div className="flex items-center text-gray-600 gap-6 text-sm mt-3">
                <span className="flex items-center gap-1">
                  <Icon path={icons.information} size={0.75} /> Creado el {createdAt}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt- md:mt-0">
              <button
                className="flex items-center gap-2 text-white bg-gray-900 hover:bg-[#32A3B5] transition px-4.5 py-2.5 rounded-lg text-sm cursor-pointer"
                onClick={() => setShowRegistroForm(true)}
              >
                <Icon path={icons.plus} size={0.8} /> Agregar Registro
              </button>
          </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 h-36">
          <h3 className="text-base font-normal text-gray-900 mb-2">Descripción</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {incidencia.description || "Sin descripción disponible."}
          </p>
        </div>

        {/* Registros */}
        <RegistrosList records={incidencia.records || []} />
      </div>

      {/* Formulario de Registro */}
      {showRegistroForm && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CreateFormRegister
            incidenceId={incidencia.id}
            onClose={() => setShowRegistroForm(false)}
            onSubmit={handleRegistroSubmit}
          />
        </LocalizationProvider>
      )}
    </div>
  );
};

export default IncidenciaDetalles;