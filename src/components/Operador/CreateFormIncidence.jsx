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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {
  getIncidenceCodesApi,
  getAllIncidenceComunicationApi,
  getAllIncidenceZonesApi,
} from "../../api/operador/incidenceApi";
import { getAllCrimesApi } from "../../api/crime/CrimeApi";

// Extender dayjs con soporte UTC
dayjs.extend(utc);

const CreateForm = ({ open, onClose, onSubmit }) => {
  // Estado principal del formulario
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    communicationId: "",
    zoneId: "",
    date: null,
    time: null,
    description: "",
    latitud: "",
    longitud: "",
    crimeId: "",
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

  // Handler para envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { code, name, date, time, description, communicationId, zoneId, latitude, longitude, crimeId } = formData;

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
      code: code?.trim() || null,
      name,
      description,
      communicationId,
      zoneId,
      date: combinedDateTime,
      latitude,
      longitude,
      crimeId,
    };

    onSubmit(payload);
    resetForm();
  };

  // Reiniciar el formulario tras envío
  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      communicationId: "",
      zoneId: "",
      date: null,
      time: null,
      description: "",
      latitude: "",
      longitude: "",
      crimeId: "",
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Modal open={open}  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            width: "100%",
            maxWidth: 500,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="flex items-center justify-between py-5 border-b rounded-t border-gray-300">
            <h3 className="text-2xl font-semibold text-gray-900">Nueva Incidencia</h3>
            <Button onClick={onClose} class="text-white bg-gray-500 flex flex-row items-center justify-center hover:bg-gray-700 rounded-md w-8 h-8 cursor-pointer">
              <span className="sr-only">Cerrar</span>X
            </Button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 mb-4 grid-cols-2">
              {/* Código */}
              <div className="col-span-2 mt-5">
                <label className="block mb-2 text-sm font-medium text-gray-900">Código</label>
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
                        <div className="font-medium">{option.codigo_incidencia}</div>
                        <div className="text-sm text-gray-500">
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
                  <div className="mt-2 text-sm text-gray-600">
                    📍 Coordenadas: {formData.latitude}, {formData.longitude}
                  </div>
                )}
              </div>

              {/* Título */}
              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-900">Título *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 hover:border-gray-900"
                  placeholder="Ingresa el título de la incidencia"
                  required
                />
              </div>

              {/* Crimen */}
              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-900">Crimen *</label>
                <Select
                  labelId="demo-simple-zona"
                  id="demo-simple-zona"
                  value={formData.crimeId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, crimeId: e.target.value }))}
                  className="w-full custom-placeholder"
                  disabled={loadingCrimes}
                  displayEmpty
                  required
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
                <label className="block mb-2 text-sm font-medium text-gray-900">Medio *</label>
                <Select
                  labelId="demo-simple-medio"
                  id="demo-simple-medio"
                  value={formData.communicationId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, communicationId: e.target.value }))}
                  className="w-full custom-placeholder"
                  disabled={loadingMedios}
                  displayEmpty
                  required
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
                <label className="block mb-2 text-sm font-medium text-gray-900">Zona *</label>
                <Select
                  labelId="demo-simple-zona"
                  id="demo-simple-zona"
                  value={formData.zoneId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zoneId: e.target.value }))}
                  className="w-full custom-placeholder"
                  disabled={loadingZonas}
                  displayEmpty
                  required
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
                <label className="block mb-2 text-sm font-medium text-gray-900">Fecha del Incidente *</label>
                <DatePicker
                  value={formData.date}
                  onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
                  format="DD/MM/YYYY"
                  className="w-full"
                  required
                />
              </div>

              {/* Hora */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block mb-2 text-sm font-medium text-gray-900">Hora del Incidente *</label>
                <TimePicker
                  ampm={false} 
                  value={formData.time}
                  onChange={(time) => setFormData((prev) => ({ ...prev, time }))}
                  className="w-full"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-900">Descripción *</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="block p-2.5 w-full text-[16px] text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-900"
                  placeholder="Descripción opcional..."
                  required
                ></textarea>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex flex-row items-center justify-end gap-3">
              <Button onClick={onClose} variant="outlined" class="text-gray-900 cursor-pointer border border-gray-800 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Cancelar</Button>
              <Button type="submit" variant="contained" disableRipple class="text-white cursor-pointer bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" disabled={loading}>
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