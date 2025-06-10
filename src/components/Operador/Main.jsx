import {PlusIcon, PlusCircleIcon} from "@heroicons/react/24/outline";

const Main = () => {

  return (
    <div className="sm:ml-64 sm:mr-4 pt-5 mt-20">
      <div className="bg-white p-6 w-full h-full">
        {/* Encabezado */}
        <div className="flex flex-row pb-5 items-center justify-between border-b-1 border-gray-200">
          <div className="block">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Incidencias</h1>
            <p className="text-gray-600">Gestiona y organiza todas tus incidencias</p>
          </div>
          {/* Botón Agregar Modal*/}
            <button data-modal-target="crud-modal" data-modal-toggle="crud-modal" className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out" type="button">
              <PlusIcon className="h-5 w-5" />
              Agregar Incidencia
            </button>
        </div>

       {/* Modal Contenido*/}
      <div id="crud-modal" tabindex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div className="relative p-4 w-full max-w-md max-h-full">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-sm">
                {/* Modal header  */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Nueva Incidencia
                    </h3>
                    <button type="button" className="text-white cursor-pointer rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center bg-gray-500 hover:bg-gray-700" data-modal-toggle="crud-modal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                {/* Modal body */}
                <form className="p-4 md:p-5">
                    <div className="grid gap-4 mb-4 grid-cols-2">
                        <div className="col-span-2">
                            <label for="name" className="block mb-2 text-sm font-medium text-gray-900">Título *</label>
                            <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5" placeholder="Ingresa el título de la incidencia" required="" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label for="name" className="block mb-2 text-sm font-medium text-gray-900">Fecha del Incidente *</label>
                            <input type="date" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5" placeholder="Perez Galvez" required="" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label for="time" class="block mb-2 text-sm font-medium text-gray-900">Hora del Incidente *</label>
                              <div class="relative">
                                <div class="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none cursor-pointer">
                                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <input type="time" id="time" class="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5" min="09:00" max="18:00" required />
                              </div>
                        </div>
                        <div className="col-span-2">
                            <label for="message" className="block mb-2 text-sm font-medium text-gray-900">Descripción</label>
                            <textarea id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500" placeholder="Descripción opcional..."></textarea>
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-end gap-3">
                      <button type="button" className="text-gray-900 cursor-pointer transition-all durantion-300 ease-in-out hover:text-white border border-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Cancelar
                      </button>
                      <button type="button" className="text-white cursor-pointer bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                          Crear Incidencia
                      </button>
                    </div>
                </form>
            </div>
        </div>
    </div> 

        {/* Lista de Incidencias o Estado Vacío */}
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto h-150">
          <div className="flex flex-col items-center justify-center">
              <PlusCircleIcon className="h-18 w-18 text-gray-300 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay incidencias</h3>
            <p className="text-gray-500 mb-6">Comienza creando tu primera incidencia para organizar tus registros</p>
            <button data-modal-target="crud-modal" data-modal-toggle="crud-modal" className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out" type="button">
              <PlusIcon className="h-5 w-5" />
              Crear primera Incidencia
            </button>
          </div>
        </div>
      

      </div>
    </div>
  );
};

export default Main;
