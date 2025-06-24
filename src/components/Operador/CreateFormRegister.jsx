import { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  Box,
  TextField,
  TextareaAutosize,
  Autocomplete,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { allCameraApi } from "../../api/operador/CameraApi";
import { toast } from "sonner";

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
    if (!canAddImages(selectedFiles.length)) return;
    updateFormField("files", [...form.files, ...selectedFiles]);
  };

  const handleCameraChange = (event, newValue) => {
    updateFormField("cameraId", newValue?.id || "");
    updateFormField("cameraName", newValue?.name || "");
  };

  const handleEmit = () => {
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
    form.files.forEach((file) => formData.append("images", file));

    onSubmit?.(formData);
    handleCloseModal();
  };

  return (
    <Modal
      open={openModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          width: "100%",
          maxWidth: 800,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-300">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">
              Nuevo Registro
            </h3>
            <span className="text-gray-600 font-normal text-sm">
              Agrega un nuevo registro a esta incidencia
            </span>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-white bg-gray-500 flex flex-row items-center justify-center hover:bg-gray-700 rounded-lg w-8 h-8 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form className="p-4 space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
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
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-gray-600">
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
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Fecha del Incidente *
              </label>
              <DatePicker
                value={form.date}
                onChange={(value) => updateFormField("date", value)}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </div>
            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Hora del Incidente *
              </label>
              <TimePicker
                value={form.time}
                onChange={(value) => updateFormField("time", value)}
                format="HH:mm"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Descripción del Incidente
            </label>
            <TextareaAutosize
              minRows={4}
              className="w-full p-2 border border-gray-300 rounded-md text-md hover:border-gray-800"
              placeholder="Describe los detalles del incidente, lo que observaste, acciones tomadas..."
              value={form.description}
              onChange={(e) => updateFormField("description", e.target.value)}
            />
          </div>

          <div
            ref={pasteZoneRef}
            tabIndex={0}
            className="border-2 border-dashed p-6 rounded-lg border-gray-400 hover:border-gray-800 relative"
          >
            <input
              type="file"
              multiple
              accept="image/png, image/jpg, image/jpeg"
              className="absolute w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center space-y-2">
              <div className="bg-gray-200 rounded-full p-2">
                <CloudArrowUpIcon className="w-10 h-10 text-gray-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Haz clic para subir imágenes o pega con <kbd>Ctrl</kbd> + <kbd>V</kbd>
                </p>
                <span className="text-xs text-gray-500">
                  PNG, JPG, JPEG hasta 10MB cada una
                </span>
              </div>
              {form.files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">
                    {form.files.length} archivo(s) seleccionado(s)
                  </p>
                  <ul className="text-xs text-gray-600 mt-1">
                    {form.files.map((file, index) => (
                      <li key={index}>• {file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCloseModal}
              className="text-gray-900 cursor-pointer border border-gray-800 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Cancelar
            </button>
            <button
              onClick={handleEmit}
              type="button"
              disabled={!form.cameraId || !form.date || !form.time}
              className="text-white cursor-pointer bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Crear Registro
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default CreateFormRegister;