
import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { getIncidenceCodesApi } from "../../api/operador/incidenceApi";
import { useTheme } from "../../contexts/ThemeContext";
import MapSelector from "../MapSelector";

// Extiende dayjs
dayjs.extend(utc);

const CreateForm = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    date: null,
    time: null,
    homeLatitude: null,
    homeLongitude: null,
  });

  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [openAutocomplete, setOpenAutocomplete] = useState(false);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!openAutocomplete) return;
    setLoadingOptions(true);
    const fetchOptions = async () => {
      try {
        const response = await getIncidenceCodesApi(inputValue);
        if (response.success && Array.isArray(response.data)) {
          setOptions(response.data.map((i) => i.codigo_incidencia));
        } else {
          setOptions([]);
        }
      } catch (err) {
        setOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };
    const timeout = setTimeout(fetchOptions, 300);
    return () => clearTimeout(timeout);
  }, [inputValue, openAutocomplete]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      homeLatitude: lat,
      homeLongitude: lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { code, name, date, time, description } = formData;
    if (!code || !name || !date || !time) {
      setError("Por favor, completa todos los campos obligatorios (*)");
      setLoading(false);
      return;
    }

    const combinedDateTime = dayjs(date)
      .set("hour", time.hour())
      .set("minute", time.minute())
      .format("YYYY-MM-DDTHH:mm:ss[Z]");

    const payload = {
      name,
      description,
      date: combinedDateTime,
      homeLatitude: formData.homeLatitude && !isNaN(formData.homeLatitude) ? Number(formData.homeLatitude) : null,
      homeLongitude: formData.homeLongitude && !isNaN(formData.homeLongitude) ? Number(formData.homeLongitude) : null,
    };

    // Solo incluir el código si tiene valor
    if (code && code.trim()) {
      payload.code = code.trim();
    }

    onSubmit(payload);
    setFormData({
      code: "",
      name: "",
      description: "",
      date: null,
      time: null,
      homeLatitude: null,
      homeLongitude: null,
    });
    onClose();
    setLoading(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box
          sx={{
            bgcolor: isDark ? "#111827" : "#fdfbf5",
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e8dfc8',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            width: "100%",
            maxWidth: 600,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className={`flex items-center justify-between p-4 md:p-5 border-b rounded-t ${isDark ? 'border-gray-600' : 'border-[#e8dfc8]'}`}>
            <h3 className={`text-2xl font-semibold ${isDark ? 'text-gray-100' : 'text-[#3d2f1f]'}`}>Nueva Incidencia</h3>
            <Button onClick={onClose} className={`text-white flex flex-row items-center justify-center rounded-md w-8 h-8 cursor-pointer ${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-[#a89878] hover:bg-[#7a6a52]'}`}>
              <span className="sr-only">Cerrar</span>X
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 md:p-5">
            <div className="grid gap-4 mb-4 grid-cols-2">
              {/* Código */}
              <div className="col-span-2">
                <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Código</label>
                <Autocomplete
                  freeSolo
                  id="code-autocomplete"
                  open={openAutocomplete}
                  onOpen={() => {
                    setOpenAutocomplete(true);
                    setInputValue("");
                  }}
                  onClose={() => setOpenAutocomplete(false)}
                  options={options}
                  loading={loadingOptions}
                  value={formData.code}
                  onChange={(e, newValue) => setFormData((prev) => ({ ...prev, code: newValue || "" }))}
                  inputValue={inputValue}
                  onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
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
                          backgroundColor: '#1e293b',
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
              </div>

              {/* Título */}
              <div className="col-span-2">
                <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Título *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`border text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 hover:border-gray-500' : 'bg-[#fdfbf5] border-[#e8dfc8] text-[#3d2f1f] hover:border-[#a89878]'}`}
                  placeholder="Ingresa el título de la incidencia"
                  required
                />
              </div>

              {/* Fecha */}
              <div className="col-span-2 sm:col-span-1">
                <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Fecha del Incidente *</label>
                <DatePicker
                  value={formData.date}
                  onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
                  format="DD/MM/YYYY"
                  className="w-full"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: isDark ? {
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
                      } : {}
                    }
                  }}
                />
              </div>

              {/* Hora */}
              <div className="col-span-2 sm:col-span-1">
                <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Hora del Incidente *</label>
                <TimePicker
                  value={formData.time}
                  onChange={(time) => setFormData((prev) => ({ ...prev, time }))}
                  className="w-full"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: isDark ? {
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
                      } : {}
                    }
                  }}
                />
              </div>

              {/* Descripción */}
              <div className="col-span-2">
                <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Descripción</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className={`block p-2.5 w-full text-[16px] rounded-lg focus:ring-gray-500 focus:border-gray-500 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 hover:border-gray-500' : 'bg-[#fdfbf5] border-[#e8dfc8] text-[#3d2f1f] hover:border-[#a89878]'}`}
                  placeholder="Descripción opcional..."
                ></textarea>
              </div>

              {/* Ubicación en el mapa */}
              <div className="col-span-2">
                <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>
                  Ubicación del infractor
                </label>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-[#7a6a52]'}`}>
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
              <Button onClick={onClose} variant="outlined" className={`cursor-pointer border font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none ${isDark ? 'text-gray-200 border-gray-600 hover:bg-gray-700 hover:text-white focus:ring-gray-600' : 'text-[#3d2f1f] border-[#a89878] hover:bg-[#7a6a52] hover:text-white focus:ring-[#e8dfc8]'}`}>Cancelar</Button>
              <Button type="submit" variant="contained" className="text-white cursor-pointer font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none disabled:opacity-50 bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/40" disabled={loading}>
                {loading ? "Creando..." : "Crear Incidencia"}
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default CreateForm;
