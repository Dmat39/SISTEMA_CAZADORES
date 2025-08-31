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
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: { md: 'space-between' },
                alignItems: { xs: 'stretch', md: 'center' },
                gap: { xs: 2, md: 2 },
                width: '100%',
                marginY: 1
            }}
        >
            {/* Lado izquierdo: Información de resultados + selector de filas */}
            <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                gap={{ xs: 1, sm: 2 }}
                sx={{ flex: { md: 1 } }}
            >
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        textAlign: { xs: 'center', sm: 'left' },
                        whiteSpace: { xs: 'normal', sm: 'nowrap' }
                    }}
                >
                    <Box component="span" sx={{ display: { xs: 'block', sm: 'inline' } }}>
                        Mostrando {Math.min((page - 1) * limit + 1, count)} - {Math.min(page * limit, count)}
                    </Box>
                    <Box component="span" sx={{ display: { xs: 'block', sm: 'inline' } }}>
                        {' '}de {count} resultados
                    </Box>
                </Typography>

                <FormControl size="small" variant="outlined" sx={{ minWidth: { xs: '100%', sm: 80 } }}>
                    <InputLabel>Filas</InputLabel>
                    <Select
                        value={limit}
                        onChange={handleLimitChange}
                        label="Filas"
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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-end' },
                    mt: { xs: 1, md: 0 }
                }}
            >
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                    size="small"
                    showFirstButton={totalPages > 3}
                    showLastButton={totalPages > 3}
                    siblingCount={0}
                    boundaryCount={1}
                    sx={{
                        '& .MuiPagination-ul': {
                            flexWrap: 'nowrap'
                        },
                        '& .MuiPaginationItem-root': {
                            border: '1px solid',
                            borderColor: 'divider'
                        }
                    }}
                />
            </Box>
        </Box>
    );
};

export default CustomTablePagination; 