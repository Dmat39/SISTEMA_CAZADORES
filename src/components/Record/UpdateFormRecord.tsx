import { Dialog } from '@headlessui/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Autocomplete, TextField, TextareaAutosize } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { allCameraApi } from '../../api/operador/CameraApi';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation';
import { deletePhotoApi } from '../../api/photo/photoApi';
import { useConfirmDiscard } from '../../hooks/commons/useConfirmDiscard';
import ImageViewer from '../Operador/ImageViewer';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDark } = useTheme();

  // Tema personalizado para Material-UI
  const muiTheme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      ...(isDark && {
        background: {
          paper: '#1f2937',
          default: '#111827',
        },
        text: {
          primary: '#f9fafb',
          secondary: '#d1d5db',
        },
        primary: {
          main: '#3b82f6',
        },
      }),
    },
  });

  const updateFormField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const getCurrentImageCount = () => {
    return images.length + form.files.length;
  };

  const handleDeleteImage = (img) => {
    const totalImages = images.length + form.files.length;

    if (totalImages <= 1) {
      toast.error("Debe haber al menos una imagen en el registro.");
      return;
    }

    updateFormField('imagesToDelete', [...form.imagesToDelete, img.path]);
    setImages(prev => prev.filter(i => i.id !== img.id));
  };

  const confirmDelete = useDeleteConfirmation({
    fetchData: () => { },
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
      setImages(data.evidences || []);
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
    const selectedFiles = Array.from(e.target.files);
    const currentFiles = [...form.files];

    let imageCount = currentFiles.filter(f => f.type.startsWith("image/")).length;
    const videoExists = currentFiles.some(f => f.type.startsWith("video/"));

    selectedFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        if (imageCount >= MAX_IMAGES) {
          toast.error(`Máximo ${MAX_IMAGES} imágenes por registro.`);
          return;
        }
        imageCount++;
        currentFiles.push(file);
      } else if (file.type.startsWith("video/")) {
        if (videoExists) {
          toast.error("Solo se permite un video por registro.");
          return;
        }

        // Validar duración del video
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration <= 60) {
            updateFormField("files", [...form.files, file]);
          } else {
            toast.error("El video no debe durar más de 1 minuto.");
          }
        };
        video.src = URL.createObjectURL(file);
      }
    });

    // Si no hay video, se actualiza directamente
    if (!selectedFiles.some(f => f.type.startsWith("video/"))) {
      updateFormField("files", currentFiles);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    const newFiles = form.files.filter((_, index) => index !== indexToRemove);
    setForm({ ...form, files: newFiles });
  };

  const handleEmit = async () => {
    try {
      for (const path of form.imagesToDelete) {
        const image = data.evidences.find(img => img.path === path);
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
      form.files.forEach(file => formData.append('files', file));

      await onSubmit(formData);
      onClose();
    } catch (error) {
      toast.error(`Error actualizando registro: ${error.message}`);
    }
  };

  if (!isOpen || cameras.length === 0) return null;

  const selectedCamera = cameras.find(cam => cam.id === form.cameraId) || null;

  return (
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog open={isOpen} onClose={() => { }} className="relative z-50">
          <div className="fixed inset-0 bg-black/70" aria-hidden="true"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className={`${isDark ? 'bg-gray-800' : 'bg-[#fdfbf5]'} rounded-lg shadow-lg max-w-xl w-full p-6`}>
              <div className="mb-2 flex">
                <h3 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-[#3d2f1f]'}`}>Editar Registro</h3>
                <button
                  onClick={handleClose}
                  className={`ml-auto ${isDark ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-700' : 'text-[#a89878] hover:text-[#3d2f1f] hover:bg-[#f0e6d0]'} rounded-lg p-1`}
                >
                  <span className="sr-only">Cerrar modal</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <hr className={`${isDark ? 'border-gray-600' : 'border-[#e8dfc8]'} mb-4`} />
              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <form className="space-y-4">
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Seleccionar Cámara</label>
                    <Autocomplete
                      value={selectedCamera}
                      options={cameras}
                      getOptionLabel={(opt) => opt.name || ''}
                      onChange={(_, newVal) => {
                        updateFormField('cameraId', newVal?.id || '');
                        updateFormField('cameraName', newVal?.name || '');
                      }}
                      isOptionEqualToValue={(opt, val) => opt.id === val.id}
                      renderInput={(params) =>
                        <TextField
                          {...params}
                          placeholder="Buscar cámara..."
                          required
                          fullWidth
                          sx={isDark ? {
                            '& .MuiInputBase-input': {
                              color: '#f9fafb',
                            },
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#374151',
                              '& fieldset': {
                                borderColor: '#6b7280',
                              },
                              '&:hover fieldset': {
                                borderColor: '#9ca3af',
                              },
                            },
                            '& .MuiSvgIcon-root': {
                              color: '#d1d5db',
                            }
                          } : {}}
                        />
                      }
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div>
                            <div className="font-medium">{option.name}</div>
                            <div className="text-sm text-[#7a6a52]">{option.address} - {option.cameraType}</div>
                          </div>
                        </li>
                      )}
                    />
                  </div>
                  <div className="flex gap-4 flex-col sm:flex-row">
                    <div className="w-full">
                      <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Fecha</label>
                      <DatePicker
                        value={form.date}
                        onChange={val => updateFormField('date', val)}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: isDark ? {
                              '& .MuiInputBase-input': {
                                color: '#f9fafb',
                              },
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#374151',
                                '& fieldset': {
                                  borderColor: '#6b7280',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#9ca3af',
                                },
                              },
                              '& .MuiSvgIcon-root': {
                                color: '#d1d5db',
                              }
                            } : {}
                          }
                        }}
                      />
                    </div>
                    <div className="w-full">
                      <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Hora</label>
                      <TimePicker
                        value={form.time}
                        onChange={val => updateFormField('time', val)}
                        format="HH:mm"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: isDark ? {
                              '& .MuiInputBase-input': {
                                color: '#f9fafb',
                              },
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#374151',
                                '& fieldset': {
                                  borderColor: '#6b7280',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#9ca3af',
                                },
                              },
                              '& .MuiSvgIcon-root': {
                                color: '#d1d5db',
                              }
                            } : {}
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Descripción</label>
                    <TextareaAutosize
                      minRows={4}
                      className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-[#fdfbf5] border-[#e8dfc8] text-[#3d2f1f]'}`}
                      placeholder="Describe los detalles..."
                      value={form.description}
                      onChange={e => updateFormField('description', e.target.value)}
                    />
                  </div>
                  {images.length > 0 && (
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Imágenes adjuntas</label>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {images.map((img) => (
                          <div
                            key={img.id}
                            className={`relative w-32 h-32 border rounded-md p-2 flex flex-col items-center justify-center ${isDark ? 'border-gray-600 bg-gray-700' : 'border-[#e8dfc8] bg-[#f0e6d0]'}`}
                          >
                            <ImageViewer
                              Path={img.path}
                              originalName={img.originalName}
                              onDelete={() => confirmDelete(img, () => img.originalName, () => handleDeleteImage(img))}
                            />
                            <span className={`text-xs text-center mt-1 line-clamp-1 w-full ${isDark ? 'text-gray-300' : 'text-[#7a6a52]'}`}>{img.originalName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div
                    ref={pasteZoneRef}
                    tabIndex={0}
                    className={`border-2 border-dashed p-6 rounded-lg relative focus:outline-none focus:ring-2 focus:ring-blue-500 z-10 ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-[#e8dfc8] hover:border-[#a89878]'}`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/jpg, image/jpeg, video/mp4"
                      className="absolute w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`${isDark ? 'bg-gray-600' : 'bg-[#f0e6d0]'} rounded-full p-2`}>
                        <CloudArrowUpIcon className={`w-10 h-10 ${isDark ? 'text-gray-300' : 'text-[#7a6a52]'}`} />
                      </div>
                      <p className={`text-sm text-center font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>
                        Haz clic para subir imágenes (máx. 5) o un video (máx. 1 min), o pega con <kbd>Ctrl</kbd> + <kbd>V</kbd>
                      </p>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-[#a89878]'}`}>
                        Formatos permitidos: PNG, JPG, JPEG y MP4
                      </span>
                      {form.files.length > 0 && (
                        <div className="mt-2">
                          <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{form.files.length} archivo(s) seleccionado(s)</p>
                          <ul className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-[#7a6a52]'}`}>
                            {form.files.map((file, index) => <li key={index}>• {file.name}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6 mb-3">
                    <button type="button" onClick={handleClose} className={`border text-sm px-5 py-2.5 rounded-lg ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white' : 'border-[#e8dfc8] text-[#3d2f1f] hover:bg-gray-700 hover:text-white'}`}>
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleEmit}
                      disabled={!form.cameraId || !form.date || !form.time}
                      className={`text-white text-sm px-5 py-2.5 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-800'} disabled:opacity-50`}
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
    </ThemeProvider>
  );
};

export default UpdateFormRecord;