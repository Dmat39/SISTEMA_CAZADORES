import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Autocomplete, TextField } from '@mui/material';
import { getAllHuntersApi } from '../../api/supervisor/HunterService';

const CazadorAssignmentForm = ({ onClose, onSubmit, cazadores, incidenceId }) => {
  const [form, setForm] = useState({ 
    userId: '',
    userType: 'hunter'
  });
  const [selectedCazador, setSelectedCazador] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [cazadoresList, setCazadoresList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar cazadores con parámetros de búsqueda
  const loadCazadores = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = {
        page: 0,
        ...(searchTerm && { search: searchTerm })
      };
      const response = await getAllHuntersApi(params);
      setCazadoresList(response.data.data || []);
    } catch (error) {
      console.error('Error cargando cazadores:', error);
      toast.error('Error al cargar cazadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCazadores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCazador || !incidenceId) {
        toast.error('Debes seleccionar un cazador');
        return;
    }
    onSubmit?.({ 
      userId: selectedCazador.id, // Cambiado de selectedCazador.user.id
      incidenceId,
      userType: form.userType 
    });
    setForm({ 
      userId: '',
      userType: 'hunter'
    });
    setSelectedCazador(null);
    setInputValue('');
  };

  const handleCancel = () => {
    setForm({ 
      userId: '',
      userType: 'hunter'
    });
    setSelectedCazador(null);
    setInputValue('');
    onClose();
  };

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-md font-semibold mb-4">Asignar nuevo cazador</h3>
      <form onSubmit={handleSubmit} >
        <div className="mb-4">
          <Autocomplete
            freeSolo
            options={cazadoresList}
            value={selectedCazador}
            inputValue={inputValue}
            loading={loading}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
              if (newInputValue === '') {
                setSelectedCazador(null);
                loadCazadores();
              } else {
                // Buscar cazadores cuando el usuario escribe
                loadCazadores(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setInputValue(newValue);
                setSelectedCazador(null);
              } else if (newValue) {
                const label = `${newValue.name} ${newValue.lastname}`;
                setInputValue(label);
                setSelectedCazador(newValue);
              } else {
                setInputValue('');
                setSelectedCazador(null);
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
                placeholder="Selecciona un cazador"
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

export default CazadorAssignmentForm; 