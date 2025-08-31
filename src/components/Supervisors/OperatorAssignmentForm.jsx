import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Autocomplete, TextField } from '@mui/material';
import { getAllOperatorApi } from '../../api/supervisor/OperatorService';

const OperatorAssignmentForm = ({ onClose, onSubmit, operators, incidenceId }) => {
  const [form, setForm] = useState({ 
    userId: '', 
    userType: 'operator' 
  });

  const [selectedOperator, setSelectedOperator] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [operatorsList, setOperatorsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar operadores con parámetros de búsqueda
  const loadOperators = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = {
        page: 0,
        ...(searchTerm && { search: searchTerm })
      };
      const response = await getAllOperatorApi(params);
      setOperatorsList(response.data.data || []);
    } catch (error) {
      console.error('Error cargando operadores:', error);
      toast.error('Error al cargar operadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperators();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOperator || !incidenceId) {
        toast.error('Debes seleccionar un operador');
        return;
    }
    onSubmit?.({ 
      userId: selectedOperator.id, // Cambiado de selectedOperator.user.id
      incidenceId,
      userType: form.userType 
    });
    setForm({ 
      userId: '',
      userType:'operator' 
    });
    setSelectedOperator(null);
    setInputValue('');
  };

  const handleCancel = () => {
    setForm({ 
      userId: '',
      userType: 'operator' });
    setSelectedOperator(null);
    setInputValue('');
    onClose();
  };

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-md font-semibold mb-4">Asignar nuevo operador</h3>
      <form onSubmit={handleSubmit} >
        <div className="mb-4">
        <Autocomplete
            freeSolo
            options={operatorsList}
            value={selectedOperator}
            inputValue={inputValue}
            loading={loading}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
              if (newInputValue === '') {
                setSelectedOperator(null);
                loadOperators();
              } else {
                // Buscar operadores cuando el usuario escribe
                loadOperators(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setInputValue(newValue);
                setSelectedOperator(null);
              } else if (newValue) {
                const label = `${newValue.name} ${newValue.lastname}`;
                setInputValue(label);
                setSelectedOperator(newValue);
              } else {
                setInputValue('');
                setSelectedOperator(null);
              }
            }}
            getOptionLabel={(option) =>
              option?.name ? `${option.name} ${option.lastname}` : ''
            }
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            sx={{ width: '100%' }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="" 
                size="small"
                placeholder="Selecciona un operador"
              />
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-[#32A3B5] cursor-pointer transition-colors"
          >
            Asignar
          </button>
        </div>
      </form>
    </div>
  );
};

export default OperatorAssignmentForm;
