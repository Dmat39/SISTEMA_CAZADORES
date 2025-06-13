import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Modal, Button } from "@mui/material";
import {
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { getAllIncidencesApi, createIncidenceApi } from "../../api/operador/incidenceApi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// Extend Day.js with UTC plugin
dayjs.extend(utc);

const Main = () => {
  const [formData, setFormData] = useState({
    code : "",
    name : "",
    description: "",
    date: null,
    time: null,
  });
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [incidences, setIncidences] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetched = useRef(false);
  
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchIncidences = async () => {
      try {
        const response = await getAllIncidencesApi();
        setIncidences(response.data || []);
      } catch (error) {
        console.error("Error al obtener los incidentes:", error);
      }
    };

    fetchIncidences();
  }, []);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { code, name, description, date, time} = formData;

    if (!code || !name || !date || !time) {
      setError("Por favor, completa todos los campos obligatorios (*)");
      setLoading(false);
      return;
    }

    try {
      // Combinar dia y fecha en cadena ISO 8601
      const combinedDateTime = dayjs(date)
        .set("hour", time.hour())
        .set("minute", time.minute())
        .set("second", time.second())
        .format("YYYY-MM-DDTHH:mm:ss[Z]");
      
        const incidenceData = {
          code,
          name,
          description: description || "",
          date: combinedDateTime,
        };

        const response = await createIncidenceApi(incidenceData);
        console.log("Incidence created:", response);
        // Generar codigo o URL dinamico

        // Navegar a la otra pantalla generada por el codigo
        navigate(`/dashboard/operador/incidencia/${code}`, {
          state: {
            ...response.data,
            date: combinedDateTime,
            createdAt: response.data.createdAt || dayjs().utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
          },
        });

        // Reset form and update list
        setFormData({
          code: "",
          name: "",
          description: "",
          date: null,
          time: null
        });

        setOpenModal(false);
    } catch (error) {
      setError(error.message || "Error al crear la incidencia.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    //Generar codigo al abrir el modal
    const year = dayjs().year().toString().slice(-2);
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const newCode = `INC${year}${randomDigits}`;
    

    setFormData(prev => ({
      ...prev,
      code: newCode
    }));
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setError(null);
    setOpenModal(false);
  };

  const formatStatus = (status) => {
    const statusMap = {
      process: { text: "En Proceso", color: "bg-blue-100 text-blue-900"},
      resolved: { text: "Completado", color: "bg-green-100 text-green-900"},
      cancelled: { text: "Rechazado", color: "bg-red-100 text-red-900"},
    };
    return statusMap[status] || { text: status, color: "bg-gray-100 text-gray-900"}
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["TimePicker", "DatePicker"]}>
        {/* Centrado Principal */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
            width: "100%",
          }}
        >
          <Box className="bg-white p-6 w-full max-w-full max-h-fit mx-7 my-5 rounded-lg">
            {/* Encabezado */}
            <div className="flex flex-row pb-5 items-center justify-between border-b-1 border-gray-200">
              <div className="block">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Incidencias</h1>
                <p className="text-gray-600">Gestiona y organiza todas tus incidencias</p>
              </div>
              {/* Botón Agregar Modal */}
              <button
                onClick={handleOpenModal} // Abre el modal
                className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                type="button"
              >
                <PlusIcon className="h-5 w-5" />
                Agregar Incidencia
              </button>
            </div>

            {/* Modal con Material-UI */}
            <Modal
              open={openModal}
              onClose={handleCloseModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              sx={{ display: "flex", alignItems: "center", justifyContent: "center",}}
            >
              <Box
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: 24,
                  p: 4,
                  width: "100%",
                  maxWidth: 500,
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
                  <h3 id="modal-modal-title" class="text-2xl font-semibold text-gray-900">
                    Nueva Incidencia
                  </h3>
                  <Button onClick={handleCloseModal} class="text-white bg-gray-500 flex flex-row items-center justify-center hover:bg-gray-700 rounded-md w-8 h-8 cursor-pointer">
                    <svg
                      class="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span class="sr-only">Close modal</span>
                  </Button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 md:p-5">
                  <div class="grid gap-4 mb-4 grid-cols-2">
                    <div class="col-span-2">
                      <label htmlFor="name" class="block mb-2 text-sm font-medium text-gray-900">
                        Código *
                      </label>
                      <input
                        type="text"
                        name="code"
                        id="code"
                        value={formData.code}
                        onChange={handleChange}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 hover:border-gray-900"
                        placeholder="Ingresa el código de incidencia"
                        required
                        readOnly
                      />
                    </div>
                    <div class="col-span-2">
                      <label htmlFor="name" class="block mb-2 text-sm font-medium text-gray-900">
                        Título *
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="titulo"
                        value={formData.name}
                        onChange={handleChange}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 hover:border-gray-900"
                        placeholder="Ingresa el título de la incidencia"
                        required
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="name" class="block mb-2 text-sm font-medium text-gray-900">
                        Fecha del Incidente *
                      </label>
                      <DatePicker
                        value={formData.date}
                        onChange={(newDate) => setFormData(prev => ({ ...prev, date: newDate}))}
                        format="DD/MM/YYYY"
                        class="focus:ring-gray-600 focus:border-gray-600 w-full readOnly"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="time" class="block mb-2 text-sm font-medium text-gray-900">
                        Hora del Incidente *
                      </label>
                      <TimePicker
                        value={formData.time}
                        onChange={(newTime) => setFormData(prev => ({ ...prev, time: newTime}))}
                        class="rounded-lg bg-gray-50 border border-gray-300 text-sm w-full readOnly"
                      />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="message" class="block mb-2 text-sm font-medium text-gray-900">
                        Descripción
                      </label>
                      <textarea
                        id="message"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        class="block p-2.5 w-full text-[16px] text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-900"
                        placeholder="Descripción opcional..."
                      ></textarea>
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex flex-row items-center justify-end gap-3">
                    <Button
                      type="button"
                      onClick={handleCloseModal}
                      class="text-gray-900 cursor-pointer border border-gray-800 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      class="text-white cursor-pointer bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                      disabled={loading}
                    >
                      {loading ? "Creando..." : "Crear Incidencia"}
                    </Button>
                  </div>
                </form>
              </Box>
            </Modal>

            <div className="flex flex-col justify-start max-w-full px-4 mt-10">
              <div className="mb-8">
                <h2 className="text-2xl text-gray-900 font-semibold mb-1">Todas las incidencias</h2>
                <span className="text-gray-600">{incidences.length} incidencias registradas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incidences.map((incidence) => {
                  const statusInfo = formatStatus(incidence.status);
                  const incidentDate = dayjs(incidence.date);
                  const isPM = incidentDate.hour() >= 12;
                  
                  return (
                    <div key={incidence.id} className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-row items-start justify-between mb-3">
                        <h3 className="text-xl line-clamp-2 text-gray-900 font-semibold w-72">
                          {incidence.name}
                        </h3>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-700 mb-3 line-clamp-3">
                          {incidence.description || "No hay descripción"}
                        </p>
                        <div className="flex flex-row items-center gap-4 border-b border-gray-200 pb-3">
                          <div className="flex items-center space-x-1">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {incidentDate.format("DD/MM/YYYY")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {incidentDate.format("hh:mm")} {isPM ? "p.m." : "a.m."}
                            </span>
                          </div>
                        </div>
                        <div className="pt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              2 Registros
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CameraIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              2 Registros
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Box>
        </Box>
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default Main;