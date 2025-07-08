import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, TableSortLabel, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import CustomTablePagination from './Pagination/TablePagination';

// Helper function to get value by ID from lookup objects
const getValueById = (id, lookupArray) => {
    if (!id || !Array.isArray(lookupArray)) return id;
    const found = lookupArray.find(item => item.id === id);
    return found ? found.name || found.label || found.value : id;
};

// Simple sort function to replace missing helper
const SortData = (data, orderBy, orderDirection) => {
    if (!orderBy) return data;
    
    return [...data].sort((a, b) => {
        let aVal = orderBy.split('.').reduce((acc, key) => acc?.[key], a);
        let bVal = orderBy.split('.').reduce((acc, key) => acc?.[key], b);
        
        // Handle null/undefined values
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
        
        // Convert to string for comparison
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (orderDirection === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
};

const CustomTable = ({
    data = [],
    loading = false,
    legend,
    columns = [], // Array de columnas como en TableForm: [{ label: 'Nombre', key: 'name', render: (value) => ... }]
    defaultHeaders = [],
    ArrLookup = [],
    noDataText = 'No hay datos disponibles',
    rowOnClick = () => { },
    count = 0,
    page = 1,
    limit = 20,
    handlePageLimitChange, // Esta función maneja tanto cambio de página como de límite
    onEdit = null,
    onDelete = null,
    actions = [], // Array de acciones como en TableForm
    pagination = null, // Objeto de paginación
}) => {
    // Usar columnas personalizadas si están definidas, sino usar headers automáticos
    const headers = columns.length > 0 
        ? columns 
        : (data.length > 0
            ? Object.keys(data[0]).filter((key) => key !== 'id' && key !== 'notShow').map(key => ({ label: key, key }))
            : defaultHeaders.map(header => ({ label: header, key: header }))
        );

    const [orderBy, setOrderBy] = useState('');
    const [orderDirection, setOrderDirection] = useState('asc');
    const [sortedData, setSortedData] = useState([]);

    // Obtener datos de paginación desde props o calcular
    const actualData = Array.isArray(data?.data) ? data.data : data;
    const actualPagination = data?.pagination || pagination;
    const currentPage = actualPagination?.page || page;

    const handleSortRequest = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    useEffect(() => {
        const dataWithIndex = actualData.map((item, index) => ({
            ...item,
            index: ((currentPage - 1) * limit) + index + 1, // Índice correcto considerando la página actual
        }));
        
        // Solo aplicar ordenamiento si hay una columna seleccionada para ordenar
        if (orderBy) {
            setSortedData(SortData(dataWithIndex, orderBy, orderDirection));
        } else {
            // Si no hay ordenamiento activo, mantener el orden original
            setSortedData(dataWithIndex);
        }
    }, [actualData, orderBy, orderDirection, currentPage, limit]);

    // Función para obtener el valor renderizado de una celda
    const getCellValue = (item, column) => {
        if (typeof column.render === 'function') {
            return column.render(item);
        }
        
        const value = column.key.split('.').reduce((acc, key) => acc?.[key], item);
        const lookup = ArrLookup.find(lookupItem => lookupItem.key === column.key);
        
        return lookup ? getValueById(value, lookup.obj) : (value ?? '—');
    };

    return (
        <div className='w-full relative'>
            <div className={`flex justify-center items-center bg-white/80 z-20 h-full w-full py-3 absolute
                transition-opacity duration-300 ease-in-out ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <CircularProgress size={30} thickness={5} className='!text-[#4052af]' />
            </div>

            <div className='w-full py-3 overflow-auto'>
                <div className='flex justify-center items-center mb-1'>
                    <CustomTablePagination 
                        count={count} 
                        page={currentPage} 
                        limit={limit} 
                        handlePageLimitChange={handlePageLimitChange}
                    />
                </div>
                <Table size='small' className='text-nowrap'>
                    <TableHead className='sticky top-0 z-10 bg-neutral-200'>
                        <TableRow>
                            <TableCell
                                sx={{ fontWeight: 600 }}
                                align={'left'}
                            >
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: 'rgba(0, 0, 0, 0.87)'
                                    }}
                                >
                                    #
                                </span>
                            </TableCell>
                            {headers.map((column) => (
                                <TableCell
                                    key={column.key}
                                    sx={{ fontWeight: 600 }}
                                    align={'left'}
                                >
                                    <TableSortLabel
                                        active={orderBy === column.key}
                                        direction={orderBy === column.key ? orderDirection : 'asc'}
                                        onClick={() => handleSortRequest(column.key)}
                                        sx={{
                                            fontSize: '0.75rem',
                                            '& .MuiTableSortLabel-icon': {
                                                fontSize: '0.9rem',
                                            },
                                        }}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            {(actions.length > 0 || typeof onEdit === 'function' || typeof onDelete === 'function') && (
                                <TableCell sx={{ fontWeight: 600 }} align={'center'}>Acciones</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    {sortedData.length !== 0 && (
                        <TableBody>
                            {sortedData.map((row) => (
                                <TableRow
                                    onClick={() => typeof rowOnClick === 'function' && rowOnClick(row)}
                                    className={`${typeof rowOnClick === 'function' ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                    key={row.id || row.dni || row.codigo}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell>{row.index}</TableCell>
                                    {headers.map((column) => {
                                        const cellValue = getCellValue(row, column);
                                        
                                        return (
                                            <TableCell
                                                key={column.key}
                                                align={'left'}
                                                className='!text-xs text-wrap'
                                            >
                                                {/* Verificar si el valor es un arreglo */}
                                                {Array.isArray(cellValue) ? (
                                                    cellValue.map((item, index) => (
                                                        <Tooltip
                                                            title={item.label}
                                                            key={index}
                                                            arrow
                                                            placement='top'
                                                            onClick={item.action}
                                                            className='cursor-pointer text-gray-500'
                                                        >
                                                            {item.icon}
                                                        </Tooltip>
                                                    ))
                                                ) : (
                                                    // Truncar texto largo
                                                    typeof cellValue === 'string' && cellValue.length > 50 && column.label.toLowerCase() !== 'acciones'
                                                        ? cellValue.slice(0, 50) + ' . . .'
                                                        : cellValue
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    {(actions.length > 0 || typeof onEdit === 'function' || typeof onDelete === 'function') && (
                                        <TableCell align="center">
                                            <div className="flex justify-center space-x-2">
                                                {/* Acciones personalizadas */}
                                                {actions.map((action, actIdx) => (
                                                    <Tooltip key={actIdx} title={action.title} arrow>
                                                        <IconButton
                                                            aria-label={action.title}
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                action.onClick(row);
                                                            }}
                                                            className={action.className}
                                                        >
                                                            {action.icon}
                                                        </IconButton>
                                                    </Tooltip>
                                                ))}
                                                
                                                {/* Acciones por defecto */}
                                                {typeof onEdit === 'function' && (
                                                    <Tooltip title="Editar" arrow>
                                                        <IconButton 
                                                            aria-label="edit" 
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(row);
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {typeof onDelete === 'function' && (
                                                    <Tooltip title="Eliminar" arrow>
                                                        <IconButton 
                                                            aria-label="delete" 
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(row);
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    )}
                </Table>
                {sortedData.length === 0 && (
                    <div className='flex justify-center py-2 sticky left-0'>
                        <span className='text-xs text-gray-500 italic'>{noDataText}</span>
                    </div>
                )}
                <div className='flex justify-center items-center mt-1'>
                    <CustomTablePagination 
                        count={count} 
                        page={currentPage} 
                        limit={limit} 
                        handlePageLimitChange={handlePageLimitChange}
                    />
                </div>
            </div>

            {legend &&
                <span className='text-xs text-gray-500 italic'>
                    <strong>Leyenda:</strong> {legend}
                </span>
            }
        </div>
    )
}

export default CustomTable