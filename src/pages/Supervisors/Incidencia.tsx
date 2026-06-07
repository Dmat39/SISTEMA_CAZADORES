import { useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import CreateFormIncidence from "../../components/Supervisors/CreateFormIncidence";
import CardFormIncidence from "../../components/Supervisors/CardFormIncidence";
import { useNavigate } from "react-router-dom"; 

import { getAllIncidencesApi, createIncidenceApi } from "../../api/operador/incidenceApi";

const IncidenciaOperador = () => {
  const [showForm, setShowForm] = useState(false);
  const [incidencias, setIncidencias] = useState([]);
  const fetched = useRef(false);
   const navigate = useNavigate(); 
  const fetchIncidencias = async () => {
    try {
      const response = await getAllIncidencesApi();
      setIncidencias(response.data || []); 
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
    }
  };



const handleCreateIncidencia = async (payload) => {
  try {
    const response = await createIncidenceApi(payload);
    const newId = response?.data?.id;
    
    if (newId) {
      localStorage.setItem("last_created_incidence_id", newId);
      navigate("/dashboard/supervisors/incidencia/detalle");
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
        {/* Título y botón */}
        <div className="flex flex-row pb-5 items-center justify-between border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Incidencias</h1>
            <p className="text-gray-600">Gestiona y organiza todas tus incidencias</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="cursor-pointer flex flex-row items-center justify-center gap-2 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-300"
          >
            <Icon path={icons.plus} size={0.8} />
            Agregar Incidencia
          </button>
        </div>

        <CardFormIncidence incidencias={incidencias} />
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
