import { Dialog } from '@headlessui/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Autocomplete, TextField, TextareaAutosize } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { allCameraApi } from '../../api/operador/CameraApi';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation';
import { deletePhotoApi } from '../../api/photo/photoApi';
import { useConfirmDiscard } from '../../hooks/commons/useConfirmDiscard';
import ImageViewer from '../Operador/ImageViewer';
import { toast } from 'sonner';

const MAX_IMAGES = 5;

const UpdateFormRecord = ({ isOpen, onClose, data, onSubmit }) => {
  const pasteZoneRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    cameraId: '',
    cameraName: '',
    description: '',
    date: null,
    time: null,
    files: [],
    imagesToDelete: []
  });

  const originalData = useRef(null);

  const updateFormField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const getCurrentImageCount = () => {
    return images.length + form.files.length;
  };

  const handleDeleteImage = (img) => {
    updateFormField('imagesToDelete', [...form.imagesToDelete, img.imagePath]);
    setImages(prev => prev.filter(i => i.id !== img.id));
  };

  const confirmDelete = useDeleteConfirmation({
    fetchData: () => {},
    deleteApiFn: deletePhotoApi,
    entityName: 'la imagen'
  });

  useEffect(() => {
    if (data) {
      const parsedDate = dayjs(data.date);
      const initialForm = {
        cameraId: data.camera?.id || '',
        cameraName: data.camera?.name || '',
        description: data.description || '',
        date: parsedDate,
        time: parsedDate,
        files: [],
        imagesToDelete: []
      };
      setForm(initialForm);
      setImages(data.images || []);
      originalData.current = initialForm;
    }
  }, [data]);

  useEffect(() => {
    const loadCameras = async () => {
      try {
        const response = await allCameraApi();
        setCameras(response.data || []);
      } catch (error) {
        console.error('Error al cargar las cámaras:', error);
      }
    };
    loadCameras();
  }, []);

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles = Array.from(items)
        .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
        .map(item => item.getAsFile())
        .filter(Boolean);

      const currentTotal = getCurrentImageCount() + imageFiles.length;
      if (currentTotal > MAX_IMAGES) {
        toast.error(`Máximo ${MAX_IMAGES} imágenes por registro.`);
        return;
      }

      if (imageFiles.length > 0) {
        setForm(prev => ({ ...prev, files: [...prev.files, ...imageFiles] }));
      }
    };

  if (isOpen) document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isOpen, images.length, form.files.length, form.imagesToDelete.length]);

  const hasChanges = useMemo(() => {
    if (!originalData.current) return false;
    return (
      form.cameraId !== originalData.current.cameraId ||
      form.description !== originalData.current.description ||
      !form.date?.isSame(originalData.current.date) ||
      !form.time?.isSame(originalData.current.time) ||
      form.files.length > 0 ||
      form.imagesToDelete.length > 0
    );
  }, [form]);

  const confirmDiscard = useConfirmDiscard({
    onConfirm: onClose,
    message: 'Tienes cambios sin guardar. ¿Estás seguro de que deseas descartarlos?'
  });

  const handleClose = () => {
    if (hasChanges) {
      confirmDiscard();
    } else {
      onClose();
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const currentTotal = getCurrentImageCount() + newFiles.length;
    if (currentTotal > MAX_IMAGES) {
      toast.error(`Máximo ${MAX_IMAGES} imágenes por registro.`);
      return;
    }
    updateFormField('files', [...form.files, ...newFiles]);
  };

  const handleEmit = async () => {
    try {
      for (const path of form.imagesToDelete) {
        const image = data.images.find(img => img.imagePath === path);
        if (image) await deletePhotoApi(image.id);
      }
    } catch (error) {
      toast.error(`Error eliminando imágenes: ${error.message}`);
      return;
    }

    try {
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
      form.files.forEach(file => formData.append('images', file));

      await onSubmit(formData);
      onClose();
    } catch (error) {
      toast.error(`Error actualizando registro: ${error.message}`);
    }
  };

  if (!isOpen || cameras.length === 0) return null;

  const selectedCamera = cameras.find(cam => cam.id === form.cameraId) || null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
            <div className="mb-2 flex">
              <Dialog.Title className="text-lg font-bold">Editar Registro</Dialog.Title>
              <button
                onClick={handleClose}
                className="ml-auto text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg p-1"
              >
                <span className="sr-only">Cerrar modal</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <hr className="border-gray-200 mb-4" />
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <form className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Seleccionar Cámara</label>
                  <Autocomplete
                    value={selectedCamera}
                    options={cameras}
                    getOptionLabel={(opt) => opt.name || ''}
                    onChange={(_, newVal) => {
                      updateFormField('cameraId', newVal?.id || '');
                      updateFormField('cameraName', newVal?.name || '');
                    }}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    renderInput={(params) => <TextField {...params} placeholder="Buscar cámara..." required fullWidth />}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <div>
                          <div className="font-medium">{option.name}</div>
                          <div className="text-sm text-gray-600">{option.address} - {option.cameraType}</div>
                        </div>
                      </li>
                    )}
                  />
                </div>
                <div className="flex gap-4 flex-col sm:flex-row">
                  <div className="w-full">
                    <label className="block mb-2 text-sm font-medium">Fecha</label>
                    <DatePicker value={form.date} onChange={val => updateFormField('date', val)} format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true } }} />
                  </div>
                  <div className="w-full">
                    <label className="block mb-2 text-sm font-medium">Hora</label>
                    <TimePicker value={form.time} onChange={val => updateFormField('time', val)} format="HH:mm" slotProps={{ textField: { fullWidth: true } }} />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Descripción</label>
                  <TextareaAutosize
                    minRows={4}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe los detalles..."
                    value={form.description}
                    onChange={e => updateFormField('description', e.target.value)}
                  />
                </div>
                {images.length > 0 && (
                  <div>
                    <label className="block mb-2 text-sm font-medium">Imágenes adjuntas</label>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {images.map((img) => (
                        <div
                          key={img.id}
                          className="relative w-32 h-32 border border-gray-300 rounded-md p-2 flex flex-col items-center justify-center bg-gray-50"
                        >
                          <ImageViewer
                            Path={img.imagePath}
                            originalName={img.originalName}
                            onDelete={() => confirmDelete(img, () => img.originalName, () => handleDeleteImage(img))}
                          />
                          <span className="text-xs text-center mt-1 line-clamp-1 w-full">{img.originalName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div
                  ref={pasteZoneRef}
                  tabIndex={0}
                  className="border-2 border-dashed p-6 rounded-lg border-gray-400 hover:border-gray-800 relative focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpg, image/jpeg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center space-y-2">
                    <div className="bg-gray-200 rounded-full p-2">
                      <CloudArrowUpIcon className="w-10 h-10 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-center">
                      Haz clic o pega una imagen con <kbd>Ctrl</kbd> + <kbd>V</kbd>
                    </p>
                    <span className="text-xs text-gray-500">PNG, JPG, JPEG hasta 10MB cada una</span>
                    {form.files.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">{form.files.length} archivo(s) seleccionado(s)</p>
                        <ul className="text-xs text-gray-600 mt-1">
                          {form.files.map((file, index) => <li key={index}>• {file.name}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={handleClose} className="border border-gray-800 text-sm px-5 py-2.5 rounded-lg hover:bg-gray-700 hover:text-white">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleEmit}
                    disabled={!form.cameraId || !form.date || !form.time}
                    className="bg-gray-500 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-gray-800"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </LocalizationProvider>
  );
};

export default UpdateFormRecord;