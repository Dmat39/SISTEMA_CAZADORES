import { useState, useEffect } from "react";
import { Modal, Box, TextField, CircularProgress, Button, Autocomplete } from "@mui/material";
import { getIncidenceCodesApi } from "../../api/operador/incidenceApi";
import { toast } from "sonner";

const UpdateCodeModal = ({ isOpen, onClose, data, onSubmit }) => {
  const [inputValue, setInputValue] = useState(data.code || "");
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

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

    if (!selectedOption) {
        toast.error("Por favor selecciona un código de la lista.");
        return;
    }

    const payload = {
        id: data.id,
        code: selectedOption.codigo_incidencia,
        latitud: selectedOption.latitud,
        longitud: selectedOption.longitud,
    };

    onSubmit(payload);
    onClose();
    };


  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, p: 4, width: 400, mx: "auto", mt: "15vh" }}>
        <h2 className="text-lg font-semibold mb-4">Actualizar Código de Incidencia</h2>
        <form onSubmit={handleSubmit}>
          <Autocomplete
            freeSolo
            options={options}
            loading={loadingOptions}
            value={selectedOption || inputValue}
            onChange={(e, value) => setSelectedOption(value)}
            inputValue={inputValue}
            onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
            getOptionLabel={(option) =>
              typeof option === "object" && option.codigo_incidencia ? option.codigo_incidencia : option
            }
            renderOption={(props, option) => (
              <li {...props}>
                <div>
                  <div className="font-medium">{option.codigo_incidencia}</div>
                  <div className="text-sm text-gray-500">Lat: {option.latitud}, Lng: {option.longitud}</div>
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
