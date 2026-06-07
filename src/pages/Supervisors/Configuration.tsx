import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import FormProfile from "../../components/Supervisors/FormProfile";
import { getOperatorProfileApi } from "../../api/supervisor/ProfileApi";
import { toast } from 'sonner';
import { useSetPageTitle } from '../../contexts/PageTitleContext';

const ConfigurationProfile = () => {
  useSetPageTitle('Mi Perfil', 'Configuración de cuenta');
  const [operatorData, setOperatorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Obtén el ID directamente de Redux
  const operatorId = useSelector((state) => state.auth.id);

  const fetchOperatorProfile = async () => {
    if (!operatorId) {
      toast.error('No se encontró ID de operador');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getOperatorProfileApi(operatorId);
      
      // Acceder correctamente a los datos según tu estructura de respuesta
      if (response.status && response.data) {
        setOperatorData(response.data);
      } else {
        toast.error('No se pudieron cargar los datos del operador');
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error(`Error al obtener datos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperatorProfile();
  }, [operatorId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Cargando perfil...</div>
      </div>
    );
  }

  if (!operatorData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error al cargar datos del perfil</div>
      </div>
    );
  }

  return (
    <div>
      <FormProfile operatorData={operatorData} />
    </div>
  );
};

export default ConfigurationProfile;