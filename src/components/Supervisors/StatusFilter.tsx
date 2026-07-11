import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const StatusFilter = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const selectedStatus = searchParams.get('status') || '';

    const statusOptions = [
        { value: '', label: 'Todos los estados' },
        { value: 'process', label: 'En proceso' },
        { value: 'completed', label: 'Completado' }
    ];

    const handleStatusChange = (event) => {
        const newStatus = event.target.value;
        const searchParams = new URLSearchParams(location.search);

        if (newStatus) {
            searchParams.set('status', newStatus);
        } else {
            searchParams.delete('status');
        }

        // Reset a página 1 cuando cambia el filtro
        searchParams.set('page', '1');

        navigate({ search: searchParams.toString() });
    };

    return (
        <div className="w-full sm:w-auto sm:min-w-[160px]">
            <FormControl size="small" variant="outlined" fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    label="Estado"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            height: '40px',
                            fontSize: '0.875rem'
                        }
                    }}
                >
                    {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default StatusFilter;