import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const DateFilter = () => {
    const [selectedDate, setSelectedDate] = useState('');
    
    const location = useLocation();
    const navigate = useNavigate();

    // Obtener la fecha seleccionada desde URL params
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const date = searchParams.get('date');
        setSelectedDate(date || '');
    }, [location.search]);

    // Manejar cambio en el input de fecha
    const handleDateChange = (event) => {
        const dateValue = event.target.value;
        const searchParams = new URLSearchParams(location.search);
        
        // Limpiar parámetro de fecha existente
        searchParams.delete('date');
        
        if (dateValue) {
            searchParams.set('date', dateValue);
        }
        
        // Reset a página 1 cuando cambia el filtro
        searchParams.set('page', '1');
        
        console.log('Nueva URL de filtro por fecha:', searchParams.toString()); // Para debuggear
        navigate({ search: searchParams.toString() });
    };

    // Limpiar filtro de fecha
    const clearDateFilter = () => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('date');
        searchParams.set('page', '1');
        navigate({ search: searchParams.toString() });
    };

    return (
        <div className="flex items-center gap-2">
            <TextField
                type="date"
                label="Filtrar por Fecha"
                size="small"
                variant="outlined"
                value={selectedDate}
                onChange={handleDateChange}
                sx={{ minWidth: 180, marginRight: 1 }}
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{
                    max: new Date().toISOString().split('T')[0], // No permitir fechas futuras
                }}
            />
            {selectedDate && (
                <button
                    onClick={clearDateFilter}
                    className="text-[#a89878] hover:text-[#7a6a52] text-sm px-2 py-1 rounded border border-[#e8dfc8] hover:bg-[#f7f0e0] transition-colors"
                    title="Limpiar filtro de fecha"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default DateFilter; 