import { Dialog } from '@headlessui/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Autocomplete, TextField, TextareaAutosize } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import ImageDelete from '../Operador/ImageDelete';

const UpdateFormRecord = ({ isOpen, onClose, data, cameras, onSubmit }) => {
    const pasteZoneRef = useRef(null);
    const [form, setForm] = useState({
        cameraId: '',
        cameraName: '',
        description: '',
        date: dayjs(),
        time: dayjs(),
        files: [],
        imagesToDelete: [], 
    });

    useEffect(() => {
        if (data) {
        setForm({
            cameraId: data.camera?.id || '',
            cameraName: data.camera?.name || '',
            description: data.description || '',
            date: dayjs(data.date),
            time: dayjs(data.time),
            files: [],
            imagesToDelete: [],
        });
        }
    }, [data]);

    const handleCameraChange = (event, newValue) => {
        setForm({
        ...form,
        cameraId: newValue?.id || '',
        cameraName: newValue?.name || '',
        });
    };

    const handleDescriptionChange = (e) => {
        setForm({ ...form, description: e.target.value });
    };

    const handleDateChange = (newDate) => {
        setForm({ ...form, date: newDate });
    };

    const handleTimeChange = (newTime) => {
        setForm({ ...form, time: newTime });
    };

    const handleFileChange = (e) => {
        setForm({ ...form, files: Array.from(e.target.files) });
    };

    const handleEmit = () => {
        const combinedDateTime = form.date
        .hour(form.time.hour())
        .minute(form.time.minute())
        .second(0)
        .millisecond(0)
        .toISOString();

        const formData = new FormData();
        formData.append('cameraId', form.cameraId);
        formData.append('description', form.description);
        formData.append('date', combinedDateTime);

        form.files.forEach((file) => {
        formData.append('images', file);
        });

        form.imagesToDelete.forEach((imagePath) => {
        formData.append('imagesToDelete', imagePath);
        });

        onSubmit(formData);
        onClose();
    };

    const handleImageDelete = (imagePath) => {
        setForm((prevForm) => ({
            ...prevForm,
            imagesToDelete: [...prevForm.imagesToDelete, imagePath],
        }));
    };

  if (!isOpen) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50 ">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>
        <div className="fixed inset-0 flex items-center justify-center p-4 ">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 ">
            <div className="mb-2 flex">
              <Dialog.Title className="text-lg font-bold">Editar Registro</Dialog.Title>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Cerrar modal</span>
              </button>
            </div>
            <hr className="border-gray-200 mb-4" />
            <form className="space-y-4">
              {/* Selección de cámara */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Seleccionar Cámara</label>
                <Autocomplete
                    value={Array.isArray(cameras) ? cameras.find(camera => camera.id === form.cameraId) : null}
                    options={Array.isArray(cameras) ? cameras : []}
                    getOptionLabel={(option) => option.name || ''}
                    onChange={handleCameraChange}
                    renderInput={(params) => (
                        <TextField {...params} fullWidth variant="outlined" placeholder="Buscar cámara..." required />
                    )}
                />

              </div>

              {/* Fecha y hora */}
              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">Fecha del Incidente</label>
                  <DatePicker
                    value={form.date}
                    onChange={handleDateChange}
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </div>
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">Hora del Incidente</label>
                  <TimePicker
                    value={form.time}
                    onChange={handleTimeChange}
                    format="HH:mm"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Descripción del Incidente</label>
                <TextareaAutosize
                  minRows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Describe los detalles del incidente..."
                  value={form.description}
                  onChange={handleDescriptionChange}
                />
              </div>

              {/* PHOTOS */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">imagenes</label>
                <ImageDelete/>
              </div>

              {/* Carga de archivos */}
              <div
                ref={pasteZoneRef}
                tabIndex={0}
                className="border-2 border-dashed p-6 rounded-lg border-gray-400 hover:border-gray-800 relative"
              >
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpg, image/jpeg"
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-gray-200 rounded-full p-2">
                    <CloudArrowUpIcon className="w-10 h-10 text-gray-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Haz clic para subir imágenes o pega con <kbd>Ctrl</kbd> + <kbd>V</kbd>
                    </p>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, JPEG hasta 10MB cada una
                    </span>
                  </div>
                  {form.files.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">{form.files.length} archivo(s) seleccionado(s)</p>
                      <ul className="text-xs text-gray-600 mt-1">
                        {form.files.map((file, index) => (
                          <li key={index}>• {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-900 cursor-pointer border border-gray-800 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEmit}
                  disabled={!form.cameraId || !form.date || !form.time}
                  className="text-white cursor-pointer bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </LocalizationProvider>
  );
};

export default UpdateFormRecord;
