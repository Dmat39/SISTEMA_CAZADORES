import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIncidenceByIdApi } from "../../api/operador/incidenceApi";
import { createSubRegistroIncidenceApi } from "../../api/operador/registroIncidenceApi";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import dayjs from "dayjs";
import RegistrosList from "../../components/Operador/IncidenciaDetalles";
import CreateFormRegister from "../../components/Operador/CreateFormRegister";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const IncidenciaDetalles = () => {
  const [incidencia, setIncidencia] = useState(null);
  const [showRegistroForm, setShowRegistroForm] = useState(false);
  const navigate = useNavigate();

  const fetchIncidencia = async () => {
    const id = localStorage.getItem("last_created_incidence_id");
    if (!id) return;
    try {
      const response = await getIncidenceByIdApi(id);
      setIncidencia(response.data);
    } catch (error) {
      console.error("Error al obtener detalle de incidencia:", error);
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

  // Emisión desde el modal -> consumir API
  const handleRegistroSubmit = async (formData) => {
    try {
      console.log("FormData recibido del hijo:");
      
      // Verificar que es FormData
      if (!(formData instanceof FormData)) {
        console.error("Error: Se esperaba FormData pero se recibió:", typeof formData);
        return;
      }

      // Debug: Mostrar contenido del FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      // Enviar directamente el FormData al API
      const response = await createSubRegistroIncidenceApi(formData);
      console.log("Registro creado exitosamente:", response);
      
      setShowRegistroForm(false);
      await fetchIncidencia(); // recargar para ver nuevo registro
    } catch (err) {
      console.error("Error al guardar el registro:", err);
      // Opcional: mostrar notificación de error al usuario
    }
  };

  return (
    <div className="p-6">
      {/* Volver */}
      <button
        onClick={() => navigate("/dashboard/operador/incidencia")}
        className="flex items-center text-sm text-gray-600 hover:underline mb-4"
      >
        <Icon path={icons.arrowLeft} size={0.8} />
        <span className="ml-1">Volver</span>
      </button>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4 mb-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {incidencia.name}
            </h1>
            <div className="flex items-center text-gray-600 gap-6 text-sm">
              <span className="flex items-center gap-1">
                <Icon path={icons.calendar} size={0.75} /> Fecha: {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Icon path={icons.clock} size={0.75} /> Hora: {formattedTime}
              </span>
              <span className="flex items-center gap-1">
                <Icon path={icons.information} size={0.75} /> Creado el {createdAt}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <span className="bg-blue-100 text-blue-900 text-sm px-3 py-1 rounded-full font-medium self-center">
              En Proceso
            </span>
            <button
              className="flex items-center gap-2 text-white bg-gray-900 hover:bg-[#32A3B5] transition px-4 py-2 rounded-lg text-sm"
              onClick={() => setShowRegistroForm(true)}
            >
              <Icon path={icons.plus} size={0.8} /> Agregar Registro
            </button>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Descripción</h3>
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