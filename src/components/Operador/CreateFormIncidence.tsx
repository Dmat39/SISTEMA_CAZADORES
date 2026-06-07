import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Modal,
  Box,
  Button,
  TextField,
  CircularProgress,
  Autocomplete,
  MenuItem,
  Select,
} from "@mui/material";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import CloseIcon from "@mui/icons-material/Close";

import {
  getIncidenceCodesApi,
  getAllIncidenceComunicationApi,
  getAllIncidenceZonesApi,
} from "../../api/operador/incidenceApi";
import { getAllCrimesApi } from "../../api/crime/CrimeApi";
import { useTheme } from "../../contexts/ThemeContext";
import MapSelector from "../MapSelector";

// Extender dayjs con soporte UTC
dayjs.extend(utc);

const CreateForm = ({ open, onClose, onSubmit }) => {
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

  // Estado principal del formulario
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    plate: "",
    communicationId: "",
    zoneId: "",
    date: null,
    time: null,
    description: "",
    latitud: "",
    longitud: "",
    crimeId: "",
    homeLatitude: null,
    homeLongitude: null,
  });

  // Estados auxiliares
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [zonaOptions, setZonaOptions] = useState([]);
  const [medioOptions, setMedioOptions] = useState([]);
  const [crimeOptions, setCrimeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [openAutocomplete, setOpenAutocomplete] = useState(false);
  const [error, setError] = useState(null);

  // Estados de carga por recurso
  const [loadingZonas, setLoadingZonas] = useState(false);
  const [loadingMedios, setLoadingMedios] = useState(false);
  const [loadingCrimes, setLoadingCrimes] = useState(false);

  // Handler para inputs normales
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler para selección en autocomplete
  const handleCodeSelection = (event, selectedOption) => {
    if (selectedOption && typeof selectedOption === "object") {
      setFormData((prev) => ({
        ...prev,
        code: selectedOption.codigo_incidencia,
        latitude: selectedOption.latitud,
        longitude: selectedOption.longitud,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        code: selectedOption || "",
        latitude: "",
        longitude: "",
      }));
    }
  };

  // Handler para selección de ubicación en el mapa
  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      homeLatitude: lat,
      homeLongitude: lng,
    }));
  };

  // Handler para envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { code, name, date, time, description, communicationId, zoneId, latitude, longitude, crimeId,plate } = formData;

    if (!name || !date || !time || !communicationId || !zoneId || !crimeId) {
      setError("Por favor, completa todos los campos obligatorios (*)");
      setLoading(false);
      return;
    }

    const combinedDateTime = dayjs(date)
      .set("hour", time.hour())
      .set("minute", time.minute())
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss[Z]");

    const payload = {
      name,
      plate,
      description,
      communicationId,
      zoneId,
      date: combinedDateTime,
      latitude,
      longitude,
      crimeId,
      homeLatitude: formData.homeLatitude && !isNaN(formData.homeLatitude) ? Number(formData.homeLatitude) : null,
      homeLongitude: formData.homeLongitude && !isNaN(formData.homeLongitude) ? Number(formData.homeLongitude) : null,
    };

    // Solo incluir el código si tiene valor
    if (code && code.trim()) {
      payload.code = code.trim();
    }

    onSubmit(payload);
    resetForm();
  };

  // Reiniciar el formulario tras envío
  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      plate,
      communicationId: "",
      zoneId: "",
      date: null,
      time: null,
      description: "",
      latitude: "",
      longitude: "",
      crimeId: "",
      homeLatitude: null,
      homeLongitude: null,
    });
    setLoading(false);
    onClose();
  };

  // Cargar datos de zonas, medios y crímenes
  const fetchSelectOptions = useCallback(async () => {
    setLoadingZonas(true);
    setLoadingMedios(true);
    setLoadingCrimes(true);

    try {
      const [zonas, medios, crimes] = await Promise.all([
        getAllIncidenceZonesApi(),
        getAllIncidenceComunicationApi(),
        getAllCrimesApi()
      ]);

      setZonaOptions(zonas.data || []);
      setMedioOptions(medios.data || []);
      setCrimeOptions(crimes.data || []);

    } catch (error) {
      console.error("Error cargando opciones:", error);
    } finally {
      setLoadingZonas(false);
      setLoadingMedios(false);
      setLoadingCrimes(false);
    }
  }, []);

  // Cargar opciones al abrir modal
  useEffect(() => {
    if (open) fetchSelectOptions();
  }, [open, fetchSelectOptions]);

  // Cargar códigos de incidencia con debounce
  useEffect(() => {
    if (!openAutocomplete) return;
    setLoadingOptions(true);

    const fetchOptions = async () => {
      try {
        const response = await getIncidenceCodesApi(inputValue);
        setOptions(response.success && Array.isArray(response.data) ? response.data : []);
      } catch {
        setOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    const timeout = setTimeout(fetchOptions, 300);
    return () => clearTimeout(timeout);
  }, [inputValue, openAutocomplete]);
  return (
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Modal open={open} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box
            sx={{
              bgcolor: isDark ? "#1a1a1a" : "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className={`flex items-center justify-between py-5 border-b rounded-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              <h3 className={`text-2xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Nueva Incidencia</h3>
              <Button onClick={onClose} className={`text-white flex flex-row items-center justify-center rounded-md w-8 h-8 cursor-pointer ${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-700'}`}>
                <CloseIcon fontSize="small" />
              </Button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 mb-4 grid-cols-2">
                {/* Código */}
                <div className="col-span-2 mt-5">
                  <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Código</label>
                  <Autocomplete
                    id="code-autocomplete"
                    open={openAutocomplete}
                    onOpen={() => {
                      setOpenAutocomplete(true);
                    }}
                    onClose={() => setOpenAutocomplete(false)}
                    options={options}
                    loading={loadingOptions}
                    value={formData.code}
                    onChange={handleCodeSelection}
                    inputValue={inputValue}
                    onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
                    getOptionLabel={(option) => {
                      // Si es un objeto, mostrar el código
                      if (typeof option === 'object' && option.codigo_incidencia) {
                        return option.codigo_incidencia;
                      }
                      // Si es string, mostrarlo tal como está
                      return option;
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <div>
                          <div className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{option.codigo_incidencia}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Lat: {option.latitud}, Lng: {option.longitud}
                          </div>
                        </div>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Buscar o ingresar código"
                        variant="outlined"
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
                            backgroundColor: '#374151',
                          },
                          '& .MuiSvgIcon-root': {
                            color: '#d1d5db',
                          }
                        } : {}}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingOptions && <CircularProgress color="inherit" size={20} />}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                  {/* Mostrar coordenadas si están disponibles */}
                  {formData.latitude && formData.longitude && (
                    <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      📍 Coordenadas: {formData.latitude}, {formData.longitude}
                    </div>
                  )}
                </div>

                {/* Título */}
                <div className="col-span-2">
                  <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Título *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`border text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 hover:border-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 hover:border-gray-900'}`}
                    placeholder="Ingresa el título de la incidencia"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Placa</label>
                  <input
                    type="text"
                    name="plate"
                    value={formData.plate}
                    onChange={handleChange}
                    className={`border text-[16px] rounded-lg block w-full px-2.5 py-4 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    placeholder="Ejemplo: ABC123"
                  />
                </div>

                {/* Crimen */}
                <div className="col-span-2">
                  <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Crimen *</label>
                  <Select
                    labelId="demo-simple-zona"
                    id="demo-simple-zona"
                    value={formData.crimeId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, crimeId: e.target.value }))}
                    className="w-full custom-placeholder"
                    disabled={loadingCrimes}
                    displayEmpty
                    required
                    sx={isDark ? {
                      '& .MuiSelect-select': {
                        color: '#ffffff',
                        backgroundColor: '#374151',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#525252',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6b7280',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#d1d5db',
                      }
                    } : {}}
                  >
                    <MenuItem value="" disabled>
                      {loadingCrimes ? "Cargando..." : "Selecciona un crimen"}
                    </MenuItem>
                    {crimeOptions.map((crimeId) => (
                      <MenuItem key={crimeId.id} value={crimeId.id}>
                        {crimeId.name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                {/* Medio */}
                <div className="col-span-2 sm:col-span-1">
                  <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Medio *</label>
                  <Select
                    labelId="demo-simple-medio"
                    id="demo-simple-medio"
                    value={formData.communicationId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, communicationId: e.target.value }))}
                    className="w-full custom-placeholder"
                    disabled={loadingMedios}
                    displayEmpty
                    required
                    sx={isDark ? {
                      '& .MuiSelect-select': {
                        color: '#ffffff',
                        backgroundColor: '#374151',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#525252',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6b7280',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#d1d5db',
                      }
                    } : {}}
                  >
                    <MenuItem value="" disabled>
                      {loadingMedios ? "Cargando..." : "Selecciona un medio"}
                    </MenuItem>
                    {medioOptions.map((communicationId) => (
                      <MenuItem key={communicationId.id} value={communicationId.id}>
                        {communicationId.name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                {/* Zona */}
                <div className="col-span-2 sm:col-span-1">
                  <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Zona *</label>
                  <Select
                    labelId="demo-simple-zona"
                    id="demo-simple-zona"
                    value={formData.zoneId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, zoneId: e.target.value }))}
                    className="w-full custom-placeholder"
                    disabled={loadingZonas}
                    displayEmpty
                    required
                    sx={isDark ? {
                      '& .MuiSelect-select': {
                        color: '#ffffff',
                        backgroundColor: '#374151',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#525252',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6b7280',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#d1d5db',
                      }
                    } : {}}
                  >
                    <MenuItem value="" disabled>
                      {loadingZonas ? "Cargando..." : "Selecciona una zona"}
                    </MenuItem>
                    {zonaOptions.map((zoneId) => (
                      <MenuItem key={zoneId.id} value={zoneId.id}>
                        {zoneId.name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                {/* Fecha */}
                <div className="col-span-2 sm:col-span-1">
                  <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Fecha del Incidente *</label>
                  <DatePicker
                    value={formData.date}
                    onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
                    format="DD/MM/YYYY"
                    className="w-full"
                    required
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
                </div>

                {/* Hora */}
                <div className="col-span-2 sm:col-span-1">
                  <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Hora del Incidente *</label>
                  <TimePicker
                    ampm={false}
                    value={formData.time}
                    onChange={(time) => setFormData((prev) => ({ ...prev, time }))}
                    className="w-full"
                    required
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
                </div>

                {/* Descripción */}
                <div className="col-span-2">
                  <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Descripción *</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className={`block p-2.5 w-full text-[16px] rounded-lg focus:ring-gray-500 focus:border-gray-500 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 hover:border-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 hover:border-gray-900'}`}
                    placeholder="Descripción opcional..."
                    required
                  ></textarea>
                </div>

                {/* Ubicación en el mapa */}
                <div className="col-span-2">
                  <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    Ubicación del Infractor
                  </label>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Haz clic en el mapa para seleccionar la ubicación del infractor
                  </p>
                  <MapSelector
                    latitude={formData.homeLatitude}
                    longitude={formData.homeLongitude}
                    onLocationSelect={handleLocationSelect}
                    height="250px"
                    isDark={isDark}
                  />
                </div>
              </div>

              {error && <p className={`text-sm mb-3 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{error}</p>}

              <div className="flex flex-row items-center justify-end gap-3">
                <Button onClick={onClose} variant="outlined" className={`cursor-pointer border font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none ${isDark ? 'text-gray-200 border-gray-600 hover:bg-gray-700 hover:text-white focus:ring-gray-600' : 'text-gray-900 border-gray-800 hover:bg-gray-700 hover:text-white focus:ring-gray-300'}`}>Cancelar</Button>
                <Button type="submit" variant="contained" disableRipple className={`text-white cursor-pointer font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none disabled:opacity-50 ${isDark ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-600' : 'bg-gray-500 hover:bg-gray-800 focus:ring-gray-300'}`} disabled={loading}>
                  {loading ? "Creando..." : "Crear Incidencia"}
                </Button>
              </div>
            </form>
          </Box>
        </Modal>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default CreateForm;