import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, Chip, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllCrimesApi } from '../../api/crime/CrimeApi';
import { toast } from 'sonner';

const FilterCrimer = () => {
    const [crimes, setCrimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCrimes, setSelectedCrimes] = useState([]); // Cambiar a array
    
    const location = useLocation();
    const navigate = useNavigate();

    // Obtener los crímenes seleccionados desde URL params
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const crimeIds = searchParams.getAll('crimeIds'); // Obtener todos los valores de crimeIds
        setSelectedCrimes(crimeIds || []);
    }, [location.search]);

    // Cargar lista de crímenes
    useEffect(() => {
        const fetchCrimes = async () => {
            try {
                setLoading(true);
                const response = await getAllCrimesApi();
                setCrimes(response.data || []);
            } catch (error) {
                console.error('Error fetching crimes:', error);
                toast.error(`Error al cargar los tipos de crimen: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchCrimes();
    }, []);

    // Manejar cambio en el select múltiple
    const handleCrimeChange = (event) => {
        const selectedValues = event.target.value;
        const searchParams = new URLSearchParams(location.search);
        
        // Limpiar todos los parámetros de crimen existentes
        searchParams.delete('crimeIds');
        
        // Agregar cada crimen seleccionado como parámetro separado
        selectedValues.forEach(crimeId => {
            searchParams.append('crimeIds', crimeId);
        });
        
        // Reset a página 1 cuando cambia el filtro
        searchParams.set('page', '1');
        
        console.log('Nueva URL de filtro:', searchParams.toString()); // Para debuggear
        navigate({ search: searchParams.toString() });
    };

    // Renderizar los valores seleccionados como chips
    const renderValue = (selected) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => {
                const crime = crimes.find(c => c.id === value);
                return (
                    <Chip 
                        key={value} 
                        label={crime ? crime.name : value} 
                        size="small"
                        sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                );
            })}
        </Box>
    );

    return (
        <FormControl size="small" variant="outlined" sx={{ minWidth: 220, marginRight: 2 }}>
            <InputLabel>Filtrar por Crimen</InputLabel>
            <Select
                multiple
                value={selectedCrimes}
                onChange={handleCrimeChange}
                label="Filtrar por Crimen"
                disabled={loading}
                renderValue={renderValue}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 224,
                            width: 200,
                        },
                    },
                }}
            >
                {loading ? (
                    <MenuItem disabled>
                        <CircularProgress size={16} sx={{ marginRight: 1 }} />
                        Cargando...
                    </MenuItem>
                ) : (
                    crimes.map((crime) => (
                        <MenuItem key={crime.id} value={crime.id}>
                            {crime.name}
                        </MenuItem>
                    ))
                )}
            </Select>
        </FormControl>
    );
};

export default FilterCrimer;
