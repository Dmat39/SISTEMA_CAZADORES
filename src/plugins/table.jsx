import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, TableSortLabel, Tooltip } from '@mui/material';
import { useLocation } from 'react-router-dom';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import CustomTablePagination from '../Pagination/TablePagination';
import { SortData } from '../../../helpers/GeneralFunctions';

const CustomTable = ({
                         data = [],
                         loading = false,
                         legend,
                         defaultHeaders = [],
                         ArrLookup = [],
                         noDataText = 'No hay datos disponibles',
                         rowOnClick = null,
                         count = 0,
                         page = 1,
                         limit = 20,
                         handlePageLimitChange,
                     }) => {
    const headers = data.length > 0
        ? Object.keys(data[0]).filter((key) => key !== 'id' && key !== 'notShow')
        : defaultHeaders;

    const location = useLocation();
    const [orderBy, setOrderBy] = useState('index');
    const [orderDirection, setOrderDirection] = useState('asc');
    const [sortedData, setSortedData] = useState([]);

    const handleSortRequest = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    useEffect(() => {
        const dataWithIndex = data.map((item, index) => ({
            ...item,
            index: index + 1, // Agrega el índice (puedes empezar desde 1)
        }));
        setSortedData(SortData(dataWithIndex, orderBy, orderDirection));
    }, [data, orderBy, orderDirection]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchParam = searchParams.get('search'); // Obtén el parámetro de búsqueda 'search'

        if (searchParam && filter) {
            const lowerCaseSearch = searchParam.toLowerCase();
            const filteredData = data.filter((item) =>
                headers.some((key) =>
                    item[key]?.toString().toLowerCase().includes(lowerCaseSearch)
                )
            );
            // Agrega el índice a los datos filtrados
            const filteredDataWithIndex = filteredData.map((item, index) => ({
                ...item,
                index: index + 1, // Reasigna el índice en función del arreglo filtrado
            }));

            setSortedData(SortData(filteredDataWithIndex, orderBy, orderDirection));
        } else {
            // Si no hay búsqueda, muestra todos los datos ordenados
            const dataWithIndex = data.map((item, index) => ({
                ...item,
                index: index + 1,
            }));
            setSortedData(SortData(dataWithIndex, orderBy, orderDirection));
        }
    }, [location.search, data, orderBy, orderDirection]);

    return (
        <div className='w-full relative'>
            <div className={`flex justify-center items-center bg-white/80 z-20 h-full w-full py-3 absolute
                transition-opacity duration-300 ease-in-out ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <CircularProgress size={30} thickness={5} className='!text-[#4052af]' />
            </div>

            <div className='w-full py-3 overflow-auto'>
                <div className='flex justify-center items-center mb-1'>
                    <CustomTablePagination count={count} page={page} limit={limit} handlePageLimitChange={handlePageLimitChange} />
                </div>
                <Table size='small' className='text-nowrap'>
                    <TableHead className='sticky top-0 z-10 bg-neutral-200'>
                        <TableRow>
                            <TableCell
                                sx={{ fontWeight: 600 }}
                                align={'left'}

                            >
                                <TableSortLabel
                                    sx={{
                                        fontSize: '0.75rem',
                                        '& .MuiTableSortLabel-icon': {
                                            fontSize: '0.9rem',
                                        },
                                    }}
                                    align={'left'}
                                    active={orderBy === 'index'}
                                    direction={orderBy === 'index' ? orderDirection : 'asc'}
                                    onClick={() => handleSortRequest('index')}
                                >
                                    #
                                </TableSortLabel>
                            </TableCell>
                            {headers.map((header) => (
                                <TableCell
                                    key={header}
                                    sx={{ fontWeight: 600 }}
                                    align={'left'}

                                >
                                    <TableSortLabel
                                        active={orderBy === header}
                                        direction={orderBy === header ? orderDirection : 'asc'}
                                        onClick={() => handleSortRequest(header)}
                                        sx={{
                                            fontSize: '0.75rem',
                                            '& .MuiTableSortLabel-icon': {
                                                fontSize: '0.9rem',
                                            },
                                        }}
                                    >
                                        {header.charAt(0).toUpperCase() + header.slice(1)}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            {(typeof onEdit === 'function' || typeof onDelete === 'function') && (
                                <TableCell sx={{ fontWeight: 600 }} align={'left'}></TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    {sortedData.length !== 0 && (
                        <TableBody>
                            {sortedData.map((row) => (

                                <TableRow
                                     onClick={(e) => typeof rowOnClick === 'function' && rowOnClick(e, row)}
                                    className={⁠ ${typeof rowOnClick === 'function' ? 'cursor-pointer hover:bg-gray-100' : ''} ⁠}
                                    key={row.id || row.dni || row.codigo}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell>{(row.index + (page - 1) * limit)}</TableCell>
                                    {headers.map((header) => {
                                        const lookup = ArrLookup.find(item => item.key === header);
                                        const value = lookup ? getValueById(row[header], lookup.obj) : row[header];

                                        return (
                                            <TableCell
                                                key={header}
                                                align={'left'}
                                                className='!text-xs text-wrap'
                                            >
                                                {/* Verificar si el valor es un arreglo */}
                                                {Array.isArray(value) ? (
                                                    value.map((item, index) => (
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
                                                    value
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    {(typeof onEdit === 'function' || typeof onDelete === 'function') && (
                                        <TableCell align="right">
                                            {typeof onEdit === 'function' && (
                                                <IconButton aria-label="edit" size="small"
                                                            onClick={() => onEdit(row)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            {typeof onDelete === 'function' && (

                                                <IconButton aria-label="delete" size="small"
                                                            onClick={() => onDelete(row)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
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
                    <CustomTablePagination count={count} page={page} limit={limit} handlePageLimitChange={handlePageLimitChange} />
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