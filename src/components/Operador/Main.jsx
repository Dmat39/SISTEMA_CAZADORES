import { useState, useEffect } from "react";
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
import { getAllIncidencesApi, incidenceApi } from "../../api/operador/incidenceApi";
import { useSelector } from "react-redux";
import { setToken } from "../../api/config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// Extend Day.js with UTC plugin
dayjs.extend(utc);

// Función para generar dynamic code URL
const generateIncidenceCode = () => {
  const year = dayjs().year().toString().slice(0);
  const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
  return `C${year}${randomDigits}`;
};

const Main = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [incidences, setIncidences] = useState([]);
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);
  useEffect(() => {
    if (token) {
      setToken(token); // Update the global token in config.jsx
    }
    // Fetch incidencias al montar el component
    const fetchIncidences = async () => {
      try {
        const response = await getAllIncidencesApi();
        setIncidences(response.data || []);
      } catch (error) {
        console.error("Error fetching incidences:", error);
      }
    };
    fetchIncidences();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !date || !time) {
      setError("Por favor, completa todos los campos obligatorios (*)");
      return;
    }

    // Combinar dia y fecha en cadena ISO 8601
    const combinedDateTime = dayjs
      .utc()
      .set("year", date.year())
      .set("month", date.month())
      .set("date", date.date())
      .set("hour", time.hour())
      .set("minute", time.minute())
      .set("second", time.second())
      .format("YYYY-MM-DDTHH:mm:ss[Z]");

    const incidenceData = {
      name,
      description: description || "",
      date: combinedDateTime,
    };

    try {
      const response = await incidenceApi(incidenceData);
      console.log("Incidence created:", response);
      // Generar codigo o URL dinamico
      const incidenceCode = generateIncidenceCode();

      // Navegar a la otra pantalla generada por el codigo
      navigate(`/dashboard/operador/incidencia/${incidenceCode}`, {
        state: {
          name,
          date: combinedDateTime,
          description: description || "",
          createdAt: response.data.createdAt || dayjs().utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
        },
      });
      // Reset form and close modal
      setName("");
      setDescription("");
      setDate(null);
      setTime(null);
      setError(null);
      setOpenModal(false); // Cierra el modal después de crear
    } catch (error) {
      setError(error.message || "Error al crear la incidencia.");
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setError(null);
    setOpenModal(false);
  };

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
          <Box className="bg-white p-6 w-full max-w-full max-h-fit mx-7 my-5">
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
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
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
                        Título *
                      </label>
                      <input
                        type="text"
                        name="titulo"
                        id="titulo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        value={date}
                        onChange={(newData) => setDate(newData)}
                        format="DD/MM/YYYY"
                        class="focus:ring-gray-600 focus:border-gray-600 w-full readOnly"
                        
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="time" class="block mb-2 text-sm font-medium text-gray-900">
                        Hora del Incidente *
                      </label>
                      <TimePicker
                        value={time}
                        onChange={(newTime) => setTime(newTime)}
                        class="rounded-lg bg-gray-50 border border-gray-300 text-sm w-full readOnly"
                      />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="message" class="block mb-2 text-sm font-medium text-gray-900">
                        Descripción
                      </label>
                      <textarea
                        id="message"
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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
                    >
                      Crear Incidencia
                    </Button>
                  </div>
                </form>
              </Box>
            </Modal>

            <div className="flex flex-col justify-start max-w-full h-150 px-4 mt-10">
              <div className="mb-8">
                <h2 className="text-2xl text-gray-900 font-semibold mb-1">Todas las incidencias</h2>
                <span className="text-gray-600">3 incidencias registradas</span>
              </div>

              <div className="flex flex-row items-center justify-between">
                {/* items incidencia 1 */}
                <div className="border-1 border-gray-300 rounded-lg px-7 py-6 w-md">
                  <div className="flex flex-row items-start justify-between mb-3">
                    <h3 className="text-[21px] line-clamp-2 text-gray-900 font-semibold w-58">
                      Cámara desactivada en entrada principal
                    </h3>
                    <div className="flex flex-row items-center gap-1">
                      <span className="rounded-full border-1 px-2.5 bg-gray-100 border-gray-300 text-[14px] font-medium">
                        2
                      </span>
                      <span className="text-[14px] ml-2 text-blue-900 font-medium bg-blue-100 px-3.5 py-1 rounded-full">
                        En Proceso
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[15px] text-gray-700 mb-3 line-clamp-3">
                      Se detectó que la cámara ubicada en la entrada principal,
                      dejó de transmitir video desde las 04:15 am. Se presume
                      posible corte de energía dadawdajdpoawdjopawjdawodawdjowdo
                    </p>
                    <div className="flex flex-row items-center gap-4 border-b-1 border-b-gray-200 pb-2">
                      <div className="flex flex-row items-center space-x-1">
                        <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] text-gray-600">
                          2025-06-10
                        </span>
                      </div>
                      <div className="flex flex-row items-center justify-center space-x-1">
                        <ClockIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] pb-0.5 text-gray-600">
                          15:15 p.m
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 flex flex-row items-center justify-between">
                      <div className="flex flex-row items-center space-x-1 space-y-1">
                        <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] text-gray-600">
                          2 registros
                        </span>
                      </div>
                      <div className="flex flex-row items-center space-x-1">
                        <CameraIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] text-gray-600">
                          con imágenes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* items incidencia 2 */}
                <div className="border-1 border-gray-300 rounded-lg px-7 py-6 w-md">
                  <div className="flex flex-row items-start justify-between mb-3">
                    <h3 className="text-[21px] line-clamp-2 text-gray-900 font-semibold w-58">
                      Movimiento sospechoso en área de central
                    </h3>
                    <div className="flex flex-row items-center gap-1">
                      <span className="rounded-full border-1 px-2.5 bg-gray-100 border-gray-300 text-[14px] font-medium">
                        1
                      </span>
                      <span className="text-[14px] ml-2 text-red-900 font-medium bg-red-100 px-3.5 py-1 rounded-full">
                        Rechazado
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[15px] text-gray-700 mb-3 line-clamp-3">
                      Se detectó actividad inusual en el área de estacionamiento para,
                      dejó de transmitir video desde las 04:15 am. Se presume
                      posible corte de energía dadawdajdpoawdjopawjdawodawdjowdo
                    </p>
                    <div className="flex flex-row items-center gap-4 border-b-1 border-b-gray-200 pb-2">
                      <div className="flex flex-row items-center space-x-1">
                        <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] text-gray-600">
                          2025-06-09
                        </span>
                      </div>
                      <div className="flex flex-row items-center justify-center space-x-1">
                        <ClockIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] pb-0.5 text-gray-600">
                          10:45 p.m
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 flex flex-row items-center justify-between">
                      <div className="flex flex-row items-center space-x-1 space-y-1">
                        <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] text-gray-600">
                          1 registros
                        </span>
                      </div>
                      <div className="flex flex-row items-center space-x-1">
                        <CameraIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] text-gray-600">
                          con imágenes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* items incidencia 3 */}
                <div className="border-1 border-gray-300 rounded-lg px-7 py-6 w-md">
                  <div className="flex flex-row items-start justify-between mb-3">
                    <h3 className="text-[21px] line-clamp-2 text-gray-900 font-semibold w-58">
                      Cámara desactivada en entrada principal
                    </h3>
                    <div className="flex flex-row items-center gap-1">
                      <span className="rounded-full border-1 px-2.5 bg-gray-100 border-gray-300 text-[14px] font-medium">
                        2
                      </span>
                      <span className="text-[14px] ml-2 text-green-900 font-medium bg-green-100 px-3.5 py-1 rounded-full">
                        Completado
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[15px] text-gray-700 mb-3 line-clamp-3">
                      Se detectó que la cámara ubicada en la entrada principal,
                      dejó de transmitir video desde las 04:15 am. Se presume
                      posible corte de energía dadawdajdpoawdjopawjdawodawdjowdo
                    </p>
                    <div className="flex flex-row items-center gap-4 border-b-1 border-b-gray-200 pb-2">
                      <div className="flex flex-row items-center space-x-1">
                        <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] text-gray-600">
                          2025-06-10
                        </span>
                      </div>
                      <div className="flex flex-row items-center justify-center space-x-1">
                        <ClockIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] pb-0.5 text-gray-600">
                          15:15 p.m
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 flex flex-row items-center justify-between">
                      <div className="flex flex-row items-center space-x-1 space-y-1">
                        <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] text-gray-600">
                          2 registros
                        </span>
                      </div>
                      <div className="flex flex-row items-center space-x-1">
                        <CameraIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] text-gray-600">
                          con imágenes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Box>
        </Box>
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default Main;