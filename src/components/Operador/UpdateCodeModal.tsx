import { useState, useEffect } from "react";
import { TextField, CircularProgress, Autocomplete } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { getIncidenceCodesApi } from "../../api/operador/incidenceApi";
import { toast } from "sonner";
import { useTheme } from "../../contexts/ThemeContext";
import { X } from "lucide-react";

const UpdateCodeModal = ({ isOpen, onClose, data, onSubmit }) => {
  const { isDark } = useTheme();
  const [inputValue, setInputValue] = useState(data.code || "");
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [openAutocomplete, setOpenAutocomplete] = useState(false);

  const muiTheme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      ...(isDark && {
        background: { paper: '#1e293b', default: '#111827' },
        text: { primary: '#f9fafb', secondary: '#d1d5db' },
        primary: { main: '#f97316' },
      }),
      ...(!isDark && {
        primary: { main: '#f97316' },
      }),
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    const fetchOptions = async () => {
      setLoadingOptions(true);
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
  }, [inputValue, isOpen]);

  useEffect(() => {
    if (!isOpen || !data?.code) return;
    setSelectedOption({ codigo_incidencia: data.code, latitud: data.latitude, longitud: data.longitude });
    setInputValue(data.code);
  }, [isOpen, data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOption || typeof selectedOption !== 'object') {
      toast.error("Por favor selecciona un código de la lista.");
      return;
    }
    onSubmit({ id: data.id, code: selectedOption.codigo_incidencia, latitude: selectedOption.latitud, longitude: selectedOption.longitud });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-slate-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Actualizar Código de Incidencia
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Código
            </label>
            <ThemeProvider theme={muiTheme}>
              <Autocomplete
                id="code-autocomplete"
                open={openAutocomplete}
                onOpen={() => setOpenAutocomplete(true)}
                onClose={() => setOpenAutocomplete(false)}
                options={options}
                loading={loadingOptions}
                value={selectedOption}
                onChange={(_, newValue) => setSelectedOption(newValue)}
                inputValue={inputValue}
                onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                getOptionLabel={(option) => typeof option === 'object' ? option.codigo_incidencia : option}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <div className="font-medium">{option.codigo_incidencia}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Lat: {option.latitud}, Lng: {option.longitud}
                      </div>
                    </div>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    size="small"
                    placeholder="Buscar o ingresar código"
                    variant="outlined"
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingOptions && <CircularProgress color="inherit" size={16} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </ThemeProvider>

            {selectedOption?.latitud && selectedOption?.longitud && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                📍 Coordenadas: {selectedOption.latitud}, {selectedOption.longitud}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCodeModal;
