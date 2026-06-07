import { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  Box,
  TextField,
  TextareaAutosize,
  Autocomplete,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { allCameraApi } from "../../api/operador/CameraApi";
import { toast } from "sonner";
import { useTheme } from "../../contexts/ThemeContext";

const MAX_IMAGES = 5;

const CreateFormRegister = ({ incidenceId, onClose, onSubmit }) => {
  const pasteZoneRef = useRef(null);
  const [openModal, setOpenModal] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [form, setForm] = useState({
    cameraId: "",
    cameraName: "",
    description: "",
    date: dayjs(),
    time: dayjs(),
    files: [],
  });
  const { isDark } = useTheme();

  // Tema personalizado para Material-UI
  const muiTheme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      ...(isDark && {
        background: {
          paper: '#111827',
          default: '#111827',
        },
        text: {
          primary: '#f9fafb',
          secondary: '#d1d5db',
        },
        primary: {
          main: '#f97316',
        },
      }),
    },
  });

  const updateFormField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canAddImages = (newCount) => {
    const currentTotal = form.files.length + newCount;
    if (currentTotal > MAX_IMAGES) {
      toast.error(`Máximo ${MAX_IMAGES} imágenes por registro.`);
      return false;
    }
    return true;
  };

  useEffect(() => {
    const loadCameras = async () => {
      try {
        const response = await allCameraApi();
        setCameras(response.data || []);
      } catch (error) {
        console.error("Error loading cameras:", error);
      }
    };
    loadCameras();
  }, []);

  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageItems = Array.from(items)
        .filter((item) => item.type.startsWith("image"))
        .map((item) => item.getAsFile())
        .filter(Boolean);

      if (!canAddImages(imageItems.length)) return;

      updateFormField("files", [...form.files, ...imageItems]);
      event.preventDefault();
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [form.files]);

  const handleCloseModal = () => {
    setOpenModal(false);
    onClose?.();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = [...form.files];

    let imageCount = newFiles.filter(f => f.type.startsWith("image/")).length;
    let videoExists = newFiles.some(f => f.type.startsWith("video/"));

    selectedFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        if (imageCount >= 5) return;
        imageCount++;
        newFiles.push(file);
      } else if (file.type.startsWith("video/")) {
        if (videoExists) return;

        // Validar duración del video
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration <= 60) {
            newFiles.push(file);
            updateFormField("files", newFiles);
          } else {
            toast.error("El video no debe durar más de 1 minuto.");
          }
        };
        video.src = URL.createObjectURL(file);
      }
    });

    // Si no hay video, se actualiza directamente
    if (!selectedFiles.some(f => f.type.startsWith("video/"))) {
      updateFormField("files", newFiles);
    }
  };



  const handleCameraChange = (event, newValue) => {
    updateFormField("cameraId", newValue?.id || "");
    updateFormField("cameraName", newValue?.name || "");
  };

  const handleRemoveFile = (indexToRemove) => {
    const newFiles = form.files.filter((_, index) => index !== indexToRemove);
    setForm({ ...form, files: newFiles });
  };

  const handleEmit = () => {
    if (form.files.length <= 0) {
      toast.error("Debes subir al menos una imagen para continuar.");
      return
    }
    const combinedDateTime = form.date
      .hour(form.time.hour())
      .minute(form.time.minute())
      .second(0)
      .millisecond(0)
      .toISOString();

    const formData = new FormData();
    formData.append("cameraId", form.cameraId);
    formData.append("description", form.description);
    formData.append("date", combinedDateTime);
    formData.append("incidenceId", incidenceId);
    form.files.forEach((file) => formData.append("files", file));

    onSubmit?.(formData);
    handleCloseModal();
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Modal
        open={openModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
      <Box
        sx={{
          bgcolor: isDark ? "#111827" : "background.paper",
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          width: "100%",
          maxWidth: 800,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className={`flex items-center justify-between p-4 border-b rounded-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
          <div>
            <h3 className={`text-2xl font-semibold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Nuevo Registro
            </h3>
            <span className={`font-normal text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Agrega un nuevo registro a esta incidencia
            </span>
          </div>
          <button
            onClick={handleCloseModal}
            className={`text-white flex flex-row items-center justify-center rounded-lg w-8 h-8 cursor-pointer ${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-700'}`}
          >
            ✕
          </button>
        </div>

        <form className="p-4 space-y-5">
          <div>
            <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Seleccionar Cámara *
            </label>
            <Autocomplete
              id="codigoCamara"
              options={cameras}
              getOptionLabel={(option) => option.name || ""}
              value={cameras.find((camera) => camera.id === form.cameraId) || null}
              onChange={handleCameraChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  variant="outlined"
                  placeholder="Buscar cámara por nombre..."
                  required
                  sx={isDark ? {
                    '& .MuiInputBase-input': {
                      color: '#ffffff',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#525252',
                      },
                      '&:hover fieldset': {
                        borderColor: '#6b7280',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                      backgroundColor: '#1e293b',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#d1d5db',
                    }
                  } : {}}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <div>
                    <div className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{option.name}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {option.address} - {option.cameraType}
                    </div>
                  </div>
                </Box>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterOptions={(options, { inputValue }) =>
                options.filter((option) =>
                  option.name.toLowerCase().includes(inputValue.toLowerCase())
                )
              }
            />
          </div>

          <div className="flex gap-4">
            <div className="w-full">
              <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                Fecha del Incidente *
              </label>
              <DatePicker
                value={form.date}
                onChange={(value) => updateFormField("date", value)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: isDark ? {
                      '& .MuiInputBase-input': {
                        color: '#f9fafb',
                      },
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#1e293b',
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
              <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                Hora del Incidente *
              </label>
              <TimePicker
                value={form.time}
                onChange={(value) => updateFormField("time", value)}
                format="HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: isDark ? {
                      '& .MuiInputBase-input': {
                        color: '#f9fafb',
                      },
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#1e293b',
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
            <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Descripción del Incidente
            </label>
            <TextareaAutosize
              minRows={4}
              className={`w-full p-2 border rounded-md text-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 hover:border-gray-500' : 'bg-white border-gray-300 text-gray-900 hover:border-gray-800'}`}
              placeholder="Describe los detalles del incidente, lo que observaste, acciones tomadas..."
              value={form.description}
              onChange={(e) => updateFormField("description", e.target.value)}
            />
          </div>

          <div
            ref={pasteZoneRef}
            tabIndex={0}
            className={`border-2 border-dashed p-6 rounded-lg relative ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-400 hover:border-gray-800'}`}
          >
            <input
              type="file"
              multiple
              accept="image/png, image/jpg, image/jpeg, video/mp4"
              className="absolute w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />


            <div className="flex flex-col items-center space-y-2">
              <div className={`rounded-full p-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <CloudArrowUpIcon className={`w-10 h-10 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  Haz clic para subir imágenes (máx. 5) o un video (máx. 1 min), o pega con <kbd>Ctrl</kbd> + <kbd>V</kbd>
                </p>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Formatos permitidos: PNG, JPG, JPEG y MP4
                </span>
              </div>

            </div>
          </div>

          {/* Miniaturas debajo de todo */}
          {form.files.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {form.files.map((file, index) => (
                  <div
                    key={index}
                    className="relative group w-24 h-24 rounded overflow-hidden border border-gray-300"
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-0 left-0 w-full h-full bg-red-600/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xl font-bold transition-opacity duration-200"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCloseModal}
              className={`cursor-pointer border font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none ${isDark ? 'text-gray-200 border-gray-600 hover:bg-gray-700 hover:text-white focus:ring-gray-600' : 'text-gray-900 border-gray-800 hover:bg-gray-700 hover:text-white focus:ring-gray-300'}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleEmit}
              type="button"
              disabled={!form.cameraId || !form.date || !form.time}
              className="text-white cursor-pointer font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none disabled:opacity-50 bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/40"
            >
              Crear Registro
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  </ThemeProvider>
  );
};

export default CreateFormRegister;