import React, { useState, useEffect } from 'react';
import { Box, Typography, ClickAwayListener, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const DateRangeFilter = ({ containerStyle = {}, sx = {} }) => {
    const [dateRange, setDateRange] = useState({ startDate: new Date(), endDate: new Date(), key: 'selection' });
    const [tempDateRange, setTempDateRange] = useState({ startDate: new Date(), endDate: new Date(), key: 'selection' });
    const [isOpen, setIsOpen] = useState(false);
    const [displayValue, setDisplayValue] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

    // Helpers para fechas
    const formatDateToLocal = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const parseDateFromLocal = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const formatDisplayDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Opciones de selección rápida
    const quickSelectOptions = [
        { label: 'Hoy', getValue: () => ({ startDate: new Date(), endDate: new Date() }) },
        {
            label: 'Ayer', getValue: () => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return { startDate: yesterday, endDate: yesterday };
            }
        },
        {
            label: 'Últimos 7 días', getValue: () => {
                const today = new Date();
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 6);
                return { startDate: weekAgo, endDate: today };
            }
        },
        {
            label: 'Últimos 30 días', getValue: () => {
                const today = new Date();
                const monthAgo = new Date();
                monthAgo.setDate(monthAgo.getDate() - 29);
                return { startDate: monthAgo, endDate: today };
            }
        },
        {
            label: 'Este mes', getValue: () => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                return { startDate: firstDay, endDate: today };
            }
        }
    ];

    // Actualizar display value
    const updateDisplayValue = (startDate, endDate) => {
        if (!startDate || !endDate) return;
        const startStr = formatDisplayDate(startDate);
        const endStr = formatDisplayDate(endDate);
        setDisplayValue(startStr === endStr ? startStr : `${startStr} - ${endStr}`);
    };

    // Cargar fechas desde URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (start || end) {
            const startDate = start ? parseDateFromLocal(start) : new Date();
            const endDate = end ? parseDateFromLocal(end) : new Date();
            const range = { startDate, endDate, key: 'selection' };

            setDateRange(range);
            setTempDateRange(range);
            updateDisplayValue(startDate, endDate);
        } else {
            setDisplayValue('');
            const today = new Date();
            const defaultRange = { startDate: today, endDate: today, key: 'selection' };
            setDateRange(defaultRange);
            setTempDateRange(defaultRange);
        }
    }, [location.search]);

    // Actualizar URL
    const updateURL = (startDate, endDate) => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('start');
        searchParams.delete('end');

        if (startDate) searchParams.set('start', formatDateToLocal(startDate));
        if (endDate && formatDateToLocal(endDate) !== formatDateToLocal(startDate)) {
            searchParams.set('end', formatDateToLocal(endDate));
        }

        searchParams.set('page', '1');
        navigate({ search: searchParams.toString() });
    };

    // Event handlers
    const handleRangeChange = (item) => setTempDateRange(item.selection);

    const applyDateFilter = () => {
        setDateRange(tempDateRange);
        updateDisplayValue(tempDateRange.startDate, tempDateRange.endDate);
        updateURL(tempDateRange.startDate, tempDateRange.endDate);
        setIsOpen(false);
    };

    const handleQuickSelect = (option) => {
        const { startDate, endDate } = option.getValue();
        setTempDateRange({ startDate, endDate, key: 'selection' });
    };

    const clearDateRangeFilter = () => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('start');
        searchParams.delete('end');
        searchParams.set('page', '1');

        const today = new Date();
        const defaultRange = { startDate: today, endDate: today, key: 'selection' };
        setDateRange(defaultRange);
        setTempDateRange(defaultRange);
        setDisplayValue('');
        setIsOpen(false);
        navigate({ search: searchParams.toString() });
    };

    const handleInputClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setTempDateRange(dateRange);
    };

    const handleClickAway = () => {
        setIsOpen(false);
        setTempDateRange(dateRange);
    };

    const hasActiveFilter = () => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.has('start') || searchParams.has('end');
    };

    // Estilos
    const labelStyles = {
        position: 'absolute', left: '12px', color: '#6b7280', backgroundColor: 'white',
        transition: 'all 0.2s ease', pointerEvents: 'none',
        top: displayValue ? '-8px' : '50%',
        transform: displayValue ? 'translateY(0)' : 'translateY(-50%)',
        fontSize: displayValue ? '12px' : '14px',
        padding: displayValue ? '0 4px' : '0'
    };

    return (
        <div className="flex items-center gap-2" style={containerStyle}>
            <ClickAwayListener onClickAway={handleClickAway}>
                <Box sx={{ position: 'relative', minWidth: 130, ...sx }}>
                    <Box
                        onClick={handleInputClick}
                        sx={{
                            width: '100%',
                            height: '40px',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '14px',
                            outline: 'none',
                            boxShadow: 'none',
                            color: displayValue ? '#374151' : '#9ca3af',
                            border: isOpen ? '3px solid #1976d2' : '1px solid #d1d5db',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: isOpen ? '#1976d2' : '#374151',
                                borderWidth: isOpen ? '3px' : '1px'
                            }
                        }}
                    >
                        <span style={labelStyles}>Rango de Fechas</span>
                        <span style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {displayValue}
                        </span>
                    </Box>

                    {isOpen && (
                        <Box sx={{
                            position: 'absolute', top: '100%', right: 0, zIndex: 1300, backgroundColor: 'white',
                            border: '1px solid #d1d5db', borderRadius: '8px', marginTop: 1, overflow: 'hidden',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            '& .rdrCalendarWrapper': { fontSize: '0.75rem' },
                            '& .rdrDateDisplayWrapper': { display: 'none' }
                        }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', mb: 1, display: 'block' }}>
                                    Selección rápida:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {quickSelectOptions.map((option, index) => (
                                        <Button key={index} size="small" variant="outlined" onClick={() => handleQuickSelect(option)}
                                            sx={{
                                                fontSize: '0.7rem', py: 0.5, px: 1, minWidth: 'auto',
                                                borderColor: '#d1d5db', color: '#374151',
                                                '&:hover': { borderColor: '#4052af', backgroundColor: '#f8f9ff' }
                                            }}>
                                            {option.label}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>

                            <DateRange
                                editableDateInputs={true} onChange={handleRangeChange} moveRangeOnFirstSelection={false}
                                ranges={[tempDateRange]} maxDate={new Date()} rangeColors={['#4052af']}
                                months={1} direction="horizontal" showDateDisplay={false}
                            />

                            <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                                <Button size="small" variant="outlined" onClick={() => setIsOpen(false)}
                                    sx={{ borderColor: '#d1d5db', color: '#6b7280', '&:hover': { borderColor: '#9ca3af', backgroundColor: '#f9fafb' } }}>
                                    Cancelar
                                </Button>
                                <Button size="small" variant="contained" onClick={applyDateFilter}
                                    sx={{ backgroundColor: '#4052af', '&:hover': { backgroundColor: '#364091' } }}>
                                    Aplicar Filtro
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </ClickAwayListener>

            {hasActiveFilter() && (
                <button onClick={clearDateRangeFilter}
                    className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                    title="Limpiar filtro de rango">
                    ✕
                </button>
            )}
        </div>
    );
};

export default DateRangeFilter; 