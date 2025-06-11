import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import {PlusIcon, PlusCircleIcon} from "@heroicons/react/24/outline";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';


const Main = () => {
  const navigate = useNavigate();
  const [incidencia, setIncidencia] = useState({
    titulo: "",
    fecha: "",
    hora: "",
    descripcion: "",
  });

  const handleChange = (e) => {
    const {name, value } = e.target;
    setIncidencia(prev => ({...prev, [name]: value})); 
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos obligatorios
    if(!incidencia.titulo || !incidencia.fecha || !incidencia.hora) {
      alert("Por favor complete los campos obligatorios (*)");
      return;
    }
    
    // Crear objeto con fecha de registro
    const nuevaIncidencia = {
      ...incidencia,
      id: Date.now(),
      fechaRegistro: new Date().toISOString()
    };

    // Guardar en LocalStorage
    const incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
    localStorage.setItem('incidencias', JSON.stringify([...incidencias, nuevaIncidencia]));

    // Redirigir a la pagina de detalle
    navigate(`/incidencias/${nuevaIncidencia.id}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['TimePicker', 'DatePicker']}>
        {/* Centrado Principal */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", width: "100%"}}>
          <Box className="bg-white p-6 w-full max-w-full m-8">
            {/* Encabezado */}
            <div className="flex flex-row pb-5 items-center justify-between border-b-1 border-gray-200">
              <div className="block">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Incidencias</h1>
                <p className="text-gray-600">Gestiona y organiza todas tus incidencias</p>
              </div>
              {/* Botón Agregar Modal*/}
                <button data-modal-target="crud-modal-incidencias" data-modal-toggle="crud-modal-incidencias" className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out" type="button">
                  <PlusIcon className="h-5 w-5" />
                  Agregar Incidencia
                </button>
            </div>

          {/* Modal Contenido*/}
          <div id="crud-modal-incidencias" tabindex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-lg max-h-full">
                {/* Modal content */}
                <div className="relative bg-white rounded-lg shadow-sm">
                    {/* Modal header  */}
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Nueva Incidencia
                        </h3>
                        <button type="button" className="text-white cursor-pointer rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center bg-gray-500 hover:bg-gray-700" data-modal-toggle="crud-modal-incidencias">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    {/* Modal body */}
                    <form onSubmit={handleSubmit} className="p-4 md:p-5">
                        <div className="grid gap-4 mb-4 grid-cols-2">
                            <div className="col-span-2">
                                <label for="name" className="block mb-2 text-sm font-medium text-gray-900">Título *</label>
                                <input type="text" name="titulo" id="titulo" value={incidencia.titulo} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4" placeholder="Ingresa el título de la incidencia" required="" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label for="name" className="block mb-2 text-sm font-medium text-gray-900">Fecha del Incidente *</label>
                                <DatePicker name="fecha" value={incidencia.fecha} onChange={handleChange} className="focus:ring-gray-600 focus:border-gray-600" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label for="time" class="block mb-2 text-sm font-medium text-gray-900">Hora del Incidente *</label>
                                  <TimePicker name="hora" value={incidencia.hora} onChange={handleChange} className="rounded-lg bg-gray-50 border border-gray-300 text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label for="message" className="block mb-2 text-sm font-medium text-gray-900">Descripción</label>
                                <textarea id="message" name="descripcion" value={incidencia.descripcion} onChange={handleChange} rows="4" class="block p-2.5 w-full text-[16px] text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500" placeholder="Descripción opcional..."></textarea>
                            </div>
                        </div>
                        <div className="flex flex-row items-center justify-end gap-3">
                          <button type="button" data-modal-hide="crud-modal-incidencias" className="text-gray-900 cursor-pointer transition-all durantion-300 ease-in-out hover:text-white border border-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Cancelar
                          </button>
                          <button type="submit" className="text-white cursor-pointer bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
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
                <button data-modal-target="crud-modal-incidencias" data-modal-toggle="crud-modal-incidencias" className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out" type="button">
                  <PlusIcon className="h-5 w-5" />
                  Crear primera Incidencia
                </button>
              </div>
            </div>
          </Box>
        </Box>
        
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default Main;
