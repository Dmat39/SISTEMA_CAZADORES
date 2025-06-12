import OperatorForm from '../../components/Supervisors/OperatorForm';
import { useEffect, useState } from 'react';
import { createOperator } from '../../api/operator';
import { setToken } from '../../api/config';

const OperadoresPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const rootPersist = localStorage.getItem('persist:root');
    if (rootPersist) {
      try {
        const parsedRoot = JSON.parse(rootPersist);
        if (parsedRoot.auth) {
          const parsedAuth = JSON.parse(parsedRoot.auth);
          if (parsedAuth.token) {
            setToken(parsedAuth.token);
          }
        }
      } catch (error) {
        console.error("Error leyendo token de persist:root", error);
      }
    }
  }, []);

  const handleCreate = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await createOperator(formData);
      console.log('Datos enviados:', formData);
    } catch (error) {
      console.error('Error al crear operador:', error);
      setError(error.response?.data?.message || error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <OperatorForm className="bg-white p-6 w-full max-w-4xl mx-auto m-8"  onSubmit={handleCreate} loading={loading}/>
      {error && (
        <p className="text-red-500 text-sm text-center mt-4">
          {error}
        </p>
      )}
    </div>
  )
}

export default OperadoresPage