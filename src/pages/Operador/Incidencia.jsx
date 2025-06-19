import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import { useEffect, useRef, useState } from "react";
import CreateFormIncidence from "../../components/Operador/CreateFormIncidence";
import CardFormIncidence from "../../components/Operador/CardFormIncidence";
import { useNavigate } from "react-router-dom";
import { getAllIncidencesApi, createIncidenceApi } from "../../api/operador/incidenceApi";
import CreateFirstEntity from "../../components/CreateFirstEntity";
import Loading from "../../components/Loading";

const IncidenciaOperador = () => {
  const [showForm, setShowForm] = useState(false);
  const [incidencias, setIncidencias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetched = useRef(false);
  const navigate = useNavigate(); 

  const fetchIncidencias = async () => {
    try {
      setIsLoading(true);
      const response = await getAllIncidencesApi();
      setIncidencias(response.data || []); 
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
      console.error("Error al crear incidencia:", err);
    }
  };

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchIncidencias();
  }, []);

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        {isLoading ? (
          <Loading message="Cargando incidencias..." />
        ) : (
          <>
            {incidencias.length > 0 ? (
              <>
              <div className="flex items-center justify-between mb-6">
                    <div className="block">
                        <h2 className="text-2xl font-bold">Incidencias</h2>
                        <p className="text-gray-600">Gestiona y organiza todas tus incidencias</p>
                    </div>
                    {incidencias.length > 0 ?(
                        <button
                            onClick={() => setShowForm(true)}
                            className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                            type="button"
                        >
                            <Icon path={icons.add} size={1} />
                            Agregar Incidencias
                        </button>                        
                    ) : null}
                </div>
              <CardFormIncidence incidencias={incidencias} />
              </>
            ) : (
              <CreateFirstEntity 
                title="No hay incidencias registradas" 
                body="Comienza creando tu primera incidencia para organizar tus registros" 
                button="Crear primera incidencia" 
                onCreate={() => setShowForm(true)}
              />
            )}
          </>
        )}
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