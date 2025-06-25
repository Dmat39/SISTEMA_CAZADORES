import { useState, useEffect } from "react";
import { Modal, Box, TextField, CircularProgress, Button, Autocomplete } from "@mui/material";
import { getIncidenceCodesApi } from "../../api/operador/incidenceApi";
import { toast } from "sonner";

const UpdateCodeModal = ({ isOpen, onClose, data, onSubmit }) => {
  const [inputValue, setInputValue] = useState(data.code || "");
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [openAutocomplete, setOpenAutocomplete] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedOption || typeof selectedOption !== 'object') {
      toast.error("Por favor selecciona un código de la lista.");
      return;
    }

    const payload = {
      id: data.id,
      code: selectedOption.codigo_incidencia,
      latitude: selectedOption.latitud,
      longitude: selectedOption.longitud,
    };

    onSubmit(payload);
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !data?.code) return;

    setSelectedOption({
      codigo_incidencia: data.code,
      latitud: data.latitude,
      longitud: data.longitude,
    });

    setInputValue(data.code);
  }, [isOpen, data]);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, p: 4, width: 400, mx: "auto", mt: "15vh" }}>
        <h2 className="text-lg font-semibold mb-4">Actualizar Código de Incidencia</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900">Código</label>
            <Autocomplete
              id="code-autocomplete"
              open={openAutocomplete}
              onOpen={() => setOpenAutocomplete(true)}
              onClose={() => setOpenAutocomplete(false)}
              options={options}
              loading={loadingOptions}
              value={selectedOption}
              onChange={(e, newValue) => setSelectedOption(newValue)}
              inputValue={inputValue}
              onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
              getOptionLabel={(option) => typeof option === 'object' ? option.codigo_incidencia : option}
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
                  required
                  placeholder="Buscar o ingresar código"
                  variant="outlined"
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
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
            {selectedOption?.latitud && selectedOption?.longitud && (
              <div className="mt-2 text-sm text-gray-600">
                📍 Coordenadas: {selectedOption.latitud}, {selectedOption.longitud}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 border rounded cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 cursor-pointer"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default UpdateCodeModal;
