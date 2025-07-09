import React from 'react';
import { Pagination, FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';

const CustomTablePagination = ({ count, page, limit, handlePageLimitChange }) => {
    const totalPages = Math.ceil(count / limit) || 1;

    const handlePageChange = (event, value) => {
        handlePageLimitChange(value, limit);
    };

    const handleLimitChange = (event) => {
        const newLimit = event.target.value;
        handlePageLimitChange(1, newLimit); // Reset a página 1 cuando cambia el límite
    };

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} sx={{ minWidth: 300, width: '100%',marginY: 1 }}>
            {/* Lado izquierdo: Información de resultados + selector de filas */}
            <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                    Mostrando {Math.min((page - 1) * limit + 1, count)} - {Math.min(page * limit, count)} de {count} resultados
                </Typography>
                
                <FormControl size="small" variant="outlined">
                    <InputLabel>Filas</InputLabel>
                    <Select
                        value={limit}
                        onChange={handleLimitChange}
                        label="Filas"
                        sx={{ minWidth: 80 }}
                    >
                        <MenuItem value={5} disabled={count <= 5}>5</MenuItem>
                        <MenuItem value={10} disabled={count <= 10}>10</MenuItem>
                        <MenuItem value={20} disabled={count <= 20}>20</MenuItem>
                        <MenuItem value={50} disabled={count <= 50}>50</MenuItem>
                        <MenuItem value={100} disabled={count <= 100}>100</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Lado derecho: Paginación */}
            <Box>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                    size="small"
                    showFirstButton
                    showLastButton
                />
            </Box>
        </Box>
    );
};

export default CustomTablePagination; 