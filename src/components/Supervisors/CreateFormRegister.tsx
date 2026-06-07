import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  TextareaAutosize,
  Autocomplete,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { allCameraApi } from "../../api/operador/CameraApi"; // Ajusta la ruta según tu estructura
import { useTheme } from "../../contexts/ThemeContext";

const CreateFormRegister = ({ incidenceId, onClose, onSubmit }) => {
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

  // Cargar cámaras al montar el componente
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

  const handleCloseModal = () => {
    setOpenModal(false);
    onClose?.();
  };

  const handleFileChange = (e) => {
    setForm({ ...form, files: Array.from(e.target.files) });
  };

  const handleCameraChange = (_, newValue) => {
    setForm({
      ...form,
      cameraId: newValue ? newValue.id : "",
      cameraName: newValue ? newValue.name : "",
    });
  };

  const handleEmit = () => {
    // Combinar fecha y hora en formato ISO
    const combinedDateTime = form.date
      .hour(form.time.hour())
      .minute(form.time.minute())
      .second(0)
      .millisecond(0)
      .toISOString();

    // Crear FormData para envío
    const formData = new FormData();
    formData.append("cameraId", form.cameraId);
    formData.append("description", form.description);
    formData.append("date", combinedDateTime);
    formData.append("incidenceId", incidenceId);

    // Agregar archivos al FormData
    form.files.forEach((file) => {
      formData.append(`files`, file);
    });

    onSubmit?.(formData);
    handleCloseModal();
  };

  return (
    <ThemeProvider theme={muiTheme}>
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
              <h3 className={`text-2xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
                Nuevo Registro
              </h3>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} font-normal text-sm`}>
                Agrega un nuevo registro a esta incidencia
              </span>
            </div>
            <Button
              onClick={handleCloseModal}
              className={`text-white ${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-700'} flex flex-row items-center justify-center rounded-lg w-8 h-8 cursor-pointer`}
            >
              ✕
            </Button>
          </div>

          <form className="p-4 space-y-5">
            <div>
              <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                Seleccionar Cámara *
              </label>
              <Autocomplete
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
                  <Box component="li" {...props}>
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
                  onChange={(value) => setForm({ ...form, date: value })}
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
                  onChange={(value) => setForm({ ...form, time: value })}
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
                className={`w-full p-2 border rounded-md text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Describe los detalles del incidente, lo que observaste, acciones tomadas..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className={`border-2 border-dashed p-6 rounded-lg relative ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-400 hover:border-gray-800'}`}>
              <input
                type="file"
                multiple
                accept="image/png, image/jpg, image/jpeg"
                className="absolute w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center space-y-2">
                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full p-2`}>
                  <CloudArrowUpIcon className={`w-10 h-10 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    Haz clic para subir imágenes
                  </p>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    PNG, JPG, JPEG hasta 10MB cada una
                  </span>
                </div>
                {form.files.length > 0 && (
                  <div className="mt-2">
                    <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {form.files.length} archivo(s) seleccionado(s)
                    </p>
                    <ul className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {form.files.map((file, index) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={handleCloseModal}
                className={`cursor-pointer border font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none ${isDark ? 'text-gray-200 border-gray-600 hover:bg-gray-700 hover:text-white focus:ring-gray-600' : 'text-gray-900 border-gray-800 hover:bg-gray-700 hover:text-white focus:ring-gray-300'}`}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEmit}
                variant="contained"
                disabled={!form.cameraId || !form.date || !form.time}
                className="text-white cursor-pointer font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none disabled:opacity-50 bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/40"
              >
                Crear Registro
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};

export default CreateFormRegister;