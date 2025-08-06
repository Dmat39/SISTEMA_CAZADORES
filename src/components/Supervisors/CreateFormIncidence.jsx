
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

// Extiende dayjs
dayjs.extend(utc);

const CreateForm = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    date: null,
    time: null,
  });

  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [openAutocomplete, setOpenAutocomplete] = useState(false);
  const [error, setError] = useState(null);

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
      code,
      name,
      description,
      date: combinedDateTime,
    };

    onSubmit(payload);
    setFormData({ code: "", name: "", description: "", date: null, time: null });
    onClose();
    setLoading(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
            <h3 className="text-2xl font-semibold text-gray-900">Nueva Incidencia</h3>
            <Button onClick={onClose} className="text-white bg-gray-500 flex flex-row items-center justify-center hover:bg-gray-700 rounded-md w-8 h-8 cursor-pointer">
              <span className="sr-only">Cerrar</span>X
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 md:p-5">
            <div className="grid gap-4 mb-4 grid-cols-2">
              {/* Código */}
              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-900">Código</label>
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

              {/* Fecha */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block mb-2 text-sm font-medium text-gray-900">Fecha del Incidente *</label>
                <DatePicker
                  value={formData.date}
                  onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </div>

              {/* Hora */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block mb-2 text-sm font-medium text-gray-900">Hora del Incidente *</label>
                <TimePicker
                  value={formData.time}
                  onChange={(time) => setFormData((prev) => ({ ...prev, time }))}
                  className="w-full"
                />
              </div>

              {/* Descripción */}
              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-900">Descripción</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="block p-2.5 w-full text-[16px] text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-900"
                  placeholder="Descripción opcional..."
                ></textarea>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex flex-row items-center justify-end gap-3">
              <Button onClick={onClose} variant="outlined" className="text-gray-900 cursor-pointer border border-gray-800 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Cancelar</Button>
              <Button type="submit" variant="contained" className="text-white cursor-pointer bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" disabled={loading}>
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
