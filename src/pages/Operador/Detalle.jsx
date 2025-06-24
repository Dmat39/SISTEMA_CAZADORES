import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getIncidenceByIdApi, updateIncidenceApi } from "../../api/operador/incidenceApi";
import { createSubRegistroIncidenceApi } from "../../api/operador/registroIncidenceApi";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import dayjs from "dayjs";
import RegistrosList from "../../components/Operador/IncidenciaDetalles";
import CreateFormRegister from "../../components/Operador/CreateFormRegister";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import UpdateCodeModal from "../../components/Operador/UpdateCodeModal";
import { toast } from "sonner";

const IncidenciaDetalles = () => {
  const [incidencia, setIncidencia] = useState(null);
  const [showRegistroForm, setShowRegistroForm] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const navigate = useNavigate();

  // Mapeo de estado a estilos y texto
  const formatStatus = (status) => {
    const statusMap = {
      process: { text: "En Proceso", color: "bg-blue-100 text-blue-900" },
      completed: { text: "Completado", color: "bg-green-100 text-green-900" },
      cancelled: { text: "Rechazado", color: "bg-red-100 text-red-900" },
    };
    return statusMap[status] || { text: status, color: "bg-gray-100 text-gray-900" };
  };

  // Obtener incidencia desde API
  const fetchIncidencia = useCallback(async () => {
    const id = localStorage.getItem("last_created_incidence_id");
    if (!id) return;

    try {
      const response = await getIncidenceByIdApi(id);
      setIncidencia(response.data);
    } catch (error) {
      console.error("Error al obtener detalle de incidencia:", error);
    }
  }, []);

  useEffect(() => {
    fetchIncidencia();
  }, [fetchIncidencia]);

  // Crear registro desde formulario
  const handleRegistroSubmit = async (formData) => {
    try {
      if (!(formData instanceof FormData)) {
        console.error("Error: Se esperaba FormData pero se recibió:", typeof formData);
        return;
      }

      const response = await createSubRegistroIncidenceApi(formData);
      toast.success("Registro creado exitosamente:");

      setShowRegistroForm(false);
      await fetchIncidencia();
    } catch (err) {
      toast.error("Error al guardar el registro:", err.message);
    }
  };

  if (!incidencia) {
    return <p className="p-4 text-gray-500">Cargando detalle de incidencia...</p>;
  }

  // Formateo de datos de la incidencia
  const {
    id,
    name,
    status,
    code,
    comunication,
    zone,
    crime,
    description,
    date: dateString,
    createdAt: createdAtString,
    records = [],
  } = incidencia;

  const statusInfo = formatStatus(status);
  const formattedDate = dayjs(dateString).format("YYYY-MM-DD");
  const formattedTime = dayjs(dateString).format("HH:mm");
  const createdDate = dayjs(createdAtString).format("D [de] MMMM [de] YYYY");

  return (
    <div className="px-4 py-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Header */}
        <div className="flex flex-col border-b border-gray-200 pb-4 mb-6">
          <div className="mt-2 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-sm text-gray-600 cursor-pointer"
            >
              <Icon className="text-gray-800" path={icons.arrowLeft} size={0.8} />
              <span className="ml-1 text-black font-medium">Volver</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {name}
                </h1>

                <div className="flex flex-wrap gap-2 sm:flex-row">
                  <span className={`text-sm px-3 py-1 rounded-full font-medium whitespace-nowrap w-auto ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                  <span 
                    onClick={() => setShowCodeModal(true)}
                    className="text-sm px-4 py-1 rounded-full bg-gray-100 text-gray-900 font-medium cursor-pointer whitespace-nowrap w-auto"
                  >
                    {code || "Sin Código"}
                  </span>
                  {code && (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`http://192.168.13.80:81/incidencias/codigo-incidencia/${code}`}
                      className="text-sm px-4 py-1 rounded-full bg-emerald-50 text-emerald-800 font-medium whitespace-nowrap w-auto"
                    >
                      Ver Detalle
                    </a>
                  )}
                </div>
              </div>


              
              <div className="flex flex-wrap items-center text-gray-600 gap-6 text-sm">
                <span className="flex items-center gap-1">
                  <Icon path={icons.attach} size={0.75} /> Medio: {comunication?.name || "Sin medio"}
                </span>
                <span className="flex items-center gap-1">
                  <Icon path={icons.map} size={0.75} /> Zona: {zone?.name || "Sin zona"}
                </span>
                <span className="flex items-center gap-1">
                  <Icon path={icons.mdiHandcuffs} size={0.75} /> Crimen: {crime?.name || "Sin crimen"}
                </span>
                <span className="flex items-center gap-1">
                  <Icon path={icons.calendar} size={0.75} /> Fecha: {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Icon path={icons.clock} size={0.75} /> Hora: {formattedTime}
                </span>
              </div>


              <div className="flex flex-wrap items-center text-gray-600 gap-6 text-sm mt-3">
                <span className="flex items-center gap-1">
                  <Icon path={icons.information} size={0.75} /> Creado el {createdDate}
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

        <div >
          {/* Descripción */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
            <h3 className="text-base font-normal text-gray-900 mb-2">Descripción</h3>
            <div className="max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed">
                {description || "Sin descripción disponible."}
              </p>
            </div>
          </div>

          {/* Listado de Registros */}
          <RegistrosList records={records} fetchRecords={fetchIncidencia} />
        </div>
      </div>

      {/* Modal de Formulario */}
      {showRegistroForm && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CreateFormRegister
            incidenceId={id}
            onClose={() => setShowRegistroForm(false)}
            onSubmit={handleRegistroSubmit}
          />
        </LocalizationProvider>
      )}

      <UpdateCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        data={incidencia}
        onSubmit={async (payload) => {
          try {
            await updateIncidenceApi(payload, payload.id);
            fetchIncidencia();
          } catch (err) {
            console.error("Error actualizando código:", err);
          }
        }}
      />
    </div>
  );
};

export default IncidenciaDetalles;
