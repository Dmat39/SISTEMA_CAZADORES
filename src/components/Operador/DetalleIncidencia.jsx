import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  InformationCircleIcon,
  CameraIcon,
  PlusIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline";

const DetalleIncidencia = () => {
  return (
    <div className="sm:ml-64 sm:mr-4 pt-5 mt-20">
      <div className="bg-white p-6 w-full h-full">
        <div className="flex flex-row items-start justify-baseline gap-8 border-b-1 border-gray-300 px-4 py-3 mb-8">
          <div>
            <Link
              to="/dashboard/operador/incidencias"
              className="flex flex-row items-center justify-center gap-2.5 mt-2.5"
            >
              <ArrowLeftIcon className="h-4 w-4 text-gray-900" />
              <span className="text-gray-900 text-sm">Volver</span>
            </Link>
          </div>
          <div className="block mr-10">
            <h1 className="mb-3 text-[26px] flex flex-row items-center text-gray-900 font-semibold">
              Cámara desactivada en entrada principal{" "}
              <span className="text-sm ml-2 text-blue-900 font-medium bg-blue-100 px-2.5 py-1 rounded-full">
                En Proceso
              </span>
            </h1>
            <div className="flex flex-row items-center space-x-3.5 mb-3">
              <div className="flex flex-row items-center space-x-1">
                <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                <span className="text-base text-gray-600">
                  Fecha: 2025-06-10
                </span>
              </div>
              <div className="flex flex-row items-center space-x-1">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <span className="text-base text-gray-600">Hora: 15:15 p.m</span>
              </div>
            </div>
            <div className="flex flex-row items-center space-x-1">
              <InformationCircleIcon className="h-5 w-5 text-gray-500" />
              <span className="text-base text-gray-600">
                Creado el 10 de junio de 2025
              </span>
            </div>
          </div>
          <button
            data-modal-target="crud-modal"
            data-modal-toggle="crud-modal"
            className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
            type="button"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar Registro
          </button>
        </div>

        {/* Modal Contenido*/}
        <div
          id="crud-modal"
          tabindex="-1"
          aria-hidden="true"
          className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div className="relative p-4 w-full max-w-3xl max-h-full mt-20">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-sm">
              {/* Modal header  */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
                <div className="block">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nuevo Registro
                  </h3>
                  <span className="text-gray-600 font-normal text-sm">
                    Agrega un nuevo registro a esta incidencia
                  </span>
                </div>
                <button
                  type="button"
                  className="text-white cursor-pointer rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center bg-gray-500 hover:bg-gray-700"
                  data-modal-toggle="crud-modal"
                >
                  <svg
                    className="w-3 h-3"
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
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* Modal body */}
              <form className="p-4 md:p-5">
                <div className="grid gap-4 mb-4 grid-cols-2">
                  <div className="col-span-2">
                    <label
                      for="name"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Nombre de la Cámara *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5"
                      placeholder="Ej: Entrada Principal, Estacionamiento Norte..."
                      required=""
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label
                      for="name"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Fecha del Incidente *
                    </label>
                    <input
                      type="date"
                      name="name"
                      id="name"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5"
                      placeholder="Perez Galvez"
                      required=""
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label
                      for="time"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Hora del Incidente *
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none cursor-pointer">
                        <svg
                          class="w-4 h-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        type="time"
                        id="time"
                        class="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                        min="09:00"
                        max="18:00"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label
                      for="message"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Descripción del Incidente
                    </label>
                    <textarea
                      id="message"
                      rows="4"
                      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="Describe los detalles del incidente, lo que observaste, acciones tomadas..."
                    ></textarea>
                    <p className="text-gray-600 text-sm mt-2">
                      Proporciona todos los detalles relevantes del incidente
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-1 border-dashed p-6 border-gray-400 w-full rounded-lg h-50 flex items-center justify-center mb-5 cursor-pointer">
                  <input accept="image/jpg, image/png, image/jpeg" multiple type="file" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={(e) => console.log(e.target.files)} />
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-gray-200 rounded-full p-2">
                        <CloudArrowUpIcon className="w-10 h-10 text-gray-600" />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <p>Haz clic para subir imágenes</p>
                        <span>PNG, JPG, JPEG hasta 10MB cada una</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    className="text-gray-900 cursor-pointer transition-all durantion-300 ease-in-out hover:text-white border border-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="text-white cursor-pointer bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Crear Incidencia
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 px-4 py-6 rounded-lg">
          <h2 className="text-black text-lg font-semibold mb-3">Descripción</h2>
          <p className="font-normal">
            Se detectó que la cámara ubicada en la entrada principal dejó de
            transmitir video desde las 15:15 pm. Se presume posible corte de
            energía o desconexión del equipo.
          </p>
        </div>
        <div className="mt-7">
          <h2 className="text-black text-lg font-semibold mb-3">
            Registros (1)
          </h2>
          <div className="border-1 border-gray-300 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-7">
              <div className="flex flex-row space-x-3">
                <div className="rounded-full border-1 border-gray-300 px-2.5 items-center justify-center w-10">
                  <span className="text-[14px] font-medium">#1</span>
                </div>
                <h3 className="text-[18px] font-normal font-sans">
                  Entrada Principal
                </h3>
              </div>
              <div className="flex flex-row items-center gap-3">
                <div className="flex flex-row items-center space-x-1">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-base text-gray-600">2025-06-10</span>
                </div>
                <div className="flex flex-row items-center space-x-1">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-base text-gray-600">15:15 p.m</span>
                </div>
                <div className="flex flex-row items-center space-x-1">
                  <CameraIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-base text-gray-600">2 imágenes</span>
                </div>
              </div>
            </div>
            <p>
              La cámara dejó de trasmitir de forma repentina. Última imagen
              recibida muestra a un individuo cerca del equipo.
            </p>
            <div className="mt-5">
              <h4 className="font-medium text-gray-900">Imágenes adjuntas:</h4>
              <div className="mt-3 flex flex-row items-center gap-5">
                <div className="flex flex-col items-center bg-gray-200 px-9 py-5 w-fit rounded-lg">
                  <CameraIcon className="h-8 w-8 text-gray-600 mb-1" />
                  <span className="text-sm text-gray-700">
                    foto-subida-1.jpg
                  </span>
                </div>
                <div className="flex flex-col items-center bg-gray-200 px-9 py-5 w-fit rounded-lg">
                  <CameraIcon className="h-8 w-8 text-gray-600 mb-1" />
                  <span className="text-sm text-gray-700">
                    foto-subida-2.jpg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleIncidencia;
