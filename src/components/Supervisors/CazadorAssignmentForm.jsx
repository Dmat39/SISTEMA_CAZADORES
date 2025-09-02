import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Autocomplete, TextField } from '@mui/material';
import { getAllHuntersApi } from '../../api/supervisor/HunterService';
import { useTheme } from '../../contexts/ThemeContext';

const CazadorAssignmentForm = ({ onClose, onSubmit, cazadores, incidenceId }) => {
  const [form, setForm] = useState({
    userId: '',
    userType: 'hunter'
  });
  const [selectedCazador, setSelectedCazador] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [cazadoresList, setCazadoresList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

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
    <div className={`mt-6 p-4 border rounded-lg transition-colors duration-300 ${isDark ? 'border-[#404040] bg-[#2a2a2a]' : 'border-gray-200 bg-gray-50'}`} style={isDark ? { backgroundColor: '#2a2a2a', borderColor: '#404040' } : {}}>
      <h3 className={`text-md font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Asignar nuevo cazador</h3>
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
                sx={isDark ? {
                  '& .MuiInputBase-input': {
                    color: '#ffffff',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#525252',
                    },
                    '&:hover fieldset': {
                      borderColor: '#6b7280',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                    backgroundColor: '#374151',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#d1d5db',
                  }
                } : {}}
              />
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className={`px-4 py-2 border rounded-lg cursor-pointer transition-colors ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-lg hover:bg-[#32A3B5] cursor-pointer transition-colors ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}
          >
            Asignar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CazadorAssignmentForm; 