import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import { useEffect, useRef, useState } from "react";
import CreateFormIncidence from "../../components/Operador/CreateFormIncidence";
import CardFormIncidence from "../../components/Operador/CardFormIncidence";
import KanbanIncidencias from "../../components/Operador/KanbanIncidencias";
import { useNavigate } from "react-router-dom";
import { getAllIncidencesApi, createIncidenceApi } from "../../api/operador/incidenceApi";
import CreateFirstEntity from "../../components/CreateFirstEntity";
import Loading from "../../components/Loading";
import { toast } from "sonner";
import { Autocomplete, TextField } from "@mui/material";

const IncidenciaOperador = () => {
  const [showForm, setShowForm] = useState(false);
  const [incidencias, setIncidencias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetched = useRef(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedIncidencia, setSelectedIncidencia] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" o "cards"
  const navigate = useNavigate(); 

  const fetchIncidencias = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: 0,
        limit: 50 // Aumentamos el límite para mostrar más incidencias en el Kanban
      };
      const response = await getAllIncidencesApi(params);
      setIncidencias(response.data?.data || response.data || []); 
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIncidencia = async (payload) => {
    try {
      const response = await createIncidenceApi(payload);
      const newId = response?.data?.id;
      
      if (newId) {
        localStorage.setItem("last_created_incidence_id", newId);
        navigate("/dashboard/operador/incidencia/detalle");
      }

      await fetchIncidencias(); 
      setShowForm(false);
    } catch (err) {
      toast.error("Error al crear incidencia: " + err.message);
      console.error("Error al crear incidencia:", err);
    }
  };

  // Función para actualizar el estado de una incidencia en el estado local
  const handleIncidenciaUpdate = (incidenciaId, nuevoEstado) => {
    setIncidencias(prev => 
      prev.map(inc => 
        inc.id === incidenciaId ? { ...inc, status: nuevoEstado } : inc
      )
    );
  };

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchIncidencias();
  }, []);

  const incidenciasFiltradas = selectedIncidencia
  ? [selectedIncidencia]
  : inputValue.trim()
    ? incidencias.filter((inc) =>
        inc.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
        inc.code?.toLowerCase().includes(inputValue.toLowerCase())
      )
    : incidencias;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Cargando incidencias..." />
      </div>
    );
  }

  if (incidencias.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <CreateFirstEntity 
            title="No hay incidencias registradas" 
            body="Comienza creando tu primera incidencia para organizar tus registros" 
            button="Crear primera incidencia" 
            onCreate={() => setShowForm(true)}
          />
        </div>
        <CreateFormIncidence
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateIncidencia}
        />
      </div>
    );
  }

  // Vista Kanban por defecto
  if (viewMode === "kanban") {
    return (
      <>
        <KanbanIncidencias 
          incidencias={incidencias}
          onIncidenciaUpdate={handleIncidenciaUpdate}
          onAddIncidencia={() => setShowForm(true)}
        />
        <CreateFormIncidence
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateIncidencia}
        />
      </>
    );
  }

  // Vista de cards tradicional
  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Incidencias</h2>
            <p className="text-gray-600">Gestiona y organiza todas tus incidencias</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:max-w-[30rem]">
            {/* Toggle de vista */}
            <div className="flex bg-gray-100 rounded-lg p-1 mr-4">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "kanban" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "cards" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Cards
              </button>
            </div>

            <Autocomplete
              freeSolo
              options={incidencias}
              value={null}
              inputValue={inputValue}
              onInputChange={(newInputValue) => {
                setInputValue(newInputValue);
                if (newInputValue === '') {
                  setSelectedIncidencia(null);
                }
              }}
              onChange={(newValue) => {
                if (typeof newValue === 'string') {
                  setInputValue(newValue);
                  setSelectedIncidencia(null);
                } else if (newValue) {
                  const label = newValue.code ? `${newValue.code} - ${newValue.name}` : newValue.name;
                  setInputValue(label);
                  setSelectedIncidencia(newValue);
                } else {
                  setInputValue('');
                  setSelectedIncidencia(null);
                }
              }}
              getOptionLabel={(option) =>
                option?.code ? `${option.code} - ${option.name}` : option?.name || ''
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              sx={{ width: '100%' }}
              renderInput={(params) => (
                <TextField {...params} label="Buscar incidencia" size="small" />
              )}
            />

            <button
              onClick={() => setShowForm(true)}
              className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out mt-2 sm:mt-0 sm:ml-2"
              type="button"
            >
              <Icon path={icons.add} size={1} />
              Agregar Incidencias
            </button>
          </div>
        </div>

        <CardFormIncidence incidencias={incidenciasFiltradas} />
      </div>

      {/* Modal de creación */}
      <CreateFormIncidence
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateIncidencia}
      />
    </div>
  );
};

export default IncidenciaOperador;