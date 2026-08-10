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
    <div className="mt-6 p-4 border rounded-lg bg-[#fdfbf5] dark:bg-white/5 border-[#e8dfc8] dark:border-white/10">
      <h3 className="text-md font-semibold mb-4 text-[#3d2f1f] dark:text-white">Asignar nuevo cazador</h3>
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
                    backgroundColor: '#1e293b',
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
            className="px-4 py-2 border rounded-lg cursor-pointer transition-colors border-[#e8dfc8] dark:border-white/10 text-[#7a6a52] dark:text-gray-300 hover:bg-[#f0e6d0] dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white rounded-lg cursor-pointer transition-colors bg-orange-500 hover:bg-orange-600"
          >
            Asignar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CazadorAssignmentForm; 