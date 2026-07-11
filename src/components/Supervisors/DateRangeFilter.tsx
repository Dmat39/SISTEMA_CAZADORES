import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import { CalendarDays, X } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface DropPos { top: number; right: number; }

const DateRangeFilter = ({ containerStyle = {}, sx = {} }: { containerStyle?: React.CSSProperties; sx?: object }) => {
    const [dateRange, setDateRange]       = useState({ startDate: new Date(), endDate: new Date(), key: 'selection' });
    const [tempDateRange, setTempDateRange] = useState({ startDate: new Date(), endDate: new Date(), key: 'selection' });
    const [isOpen, setIsOpen]             = useState(false);
    const [displayValue, setDisplayValue] = useState('');
    const [dropPos, setDropPos]           = useState<DropPos>({ top: 0, right: 0 });

    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { isDark } = useTheme();
    const location   = useLocation();
    const navigate   = useNavigate();

    /* ── Date helpers ─────────────────────────────────────────────── */
    const formatDateToLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const parseDateFromLocal = (s: string) => {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const formatDisplay = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${d}/${m}/${date.getFullYear()}`;
    };

    const updateDisplayValue = (s: Date, e: Date) => {
        if (!s || !e) return;
        const ss = formatDisplay(s);
        const es = formatDisplay(e);
        setDisplayValue(ss === es ? ss : `${ss} — ${es}`);
    };

    /* ── Quick select options ─────────────────────────────────────── */
    const quickOptions = [
        { label: 'Hoy',           getValue: () => { const t = new Date(); return { startDate: t, endDate: t }; } },
        { label: 'Ayer',          getValue: () => { const y = new Date(); y.setDate(y.getDate() - 1); return { startDate: y, endDate: y }; } },
        { label: 'Últ. 7 días',   getValue: () => { const t = new Date(); const s = new Date(); s.setDate(s.getDate() - 6); return { startDate: s, endDate: t }; } },
        { label: 'Últ. 30 días',  getValue: () => { const t = new Date(); const s = new Date(); s.setDate(s.getDate() - 29); return { startDate: s, endDate: t }; } },
        { label: 'Este mes',      getValue: () => { const t = new Date(); return { startDate: new Date(t.getFullYear(), t.getMonth(), 1), endDate: t }; } },
    ];

    /* ── URL sync ─────────────────────────────────────────────────── */
    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const start = sp.get('start');
        const end   = sp.get('end');
        if (start || end) {
            const s = start ? parseDateFromLocal(start) : new Date();
            const e = end   ? parseDateFromLocal(end)   : new Date();
            const range = { startDate: s, endDate: e, key: 'selection' };
            setDateRange(range);
            setTempDateRange(range);
            updateDisplayValue(s, e);
        } else {
            setDisplayValue('');
            const t = new Date();
            const r = { startDate: t, endDate: t, key: 'selection' };
            setDateRange(r);
            setTempDateRange(r);
        }
    }, [location.search]);

    const updateURL = (s: Date, e: Date) => {
        const sp = new URLSearchParams(location.search);
        sp.delete('start'); sp.delete('end');
        if (s) sp.set('start', formatDateToLocal(s));
        if (e && formatDateToLocal(e) !== formatDateToLocal(s)) sp.set('end', formatDateToLocal(e));
        sp.set('page', '1');
        navigate({ search: sp.toString() });
    };

    /* ── Click-away via document listener ────────────────────────── */
    const handleClickAway = useCallback((e: MouseEvent) => {
        if (
            triggerRef.current?.contains(e.target as Node) ||
            dropdownRef.current?.contains(e.target as Node)
        ) return;
        setIsOpen(false);
        setTempDateRange(dateRange);
    }, [dateRange]);

    useEffect(() => {
        if (isOpen) document.addEventListener('mousedown', handleClickAway);
        return ()  => document.removeEventListener('mousedown', handleClickAway);
    }, [isOpen, handleClickAway]);

    /* ── Open / close ─────────────────────────────────────────────── */
    const handleOpen = () => {
        if (!isOpen && triggerRef.current) {
            const r = triggerRef.current.getBoundingClientRect();
            setDropPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
        }
        setIsOpen((v) => !v);
        if (!isOpen) setTempDateRange(dateRange);
    };

    /* ── Actions ──────────────────────────────────────────────────── */
    const applyDateFilter = () => {
        setDateRange(tempDateRange);
        updateDisplayValue(tempDateRange.startDate, tempDateRange.endDate);
        updateURL(tempDateRange.startDate, tempDateRange.endDate);
        setIsOpen(false);
    };

    const clearFilter = () => {
        const sp = new URLSearchParams(location.search);
        sp.delete('start'); sp.delete('end'); sp.set('page', '1');
        const t = new Date();
        const r = { startDate: t, endDate: t, key: 'selection' };
        setDateRange(r); setTempDateRange(r); setDisplayValue('');
        setIsOpen(false);
        navigate({ search: sp.toString() });
    };

    const hasActive = () => {
        const sp = new URLSearchParams(location.search);
        return sp.has('start') || sp.has('end');
    };

    /* ── Styles ───────────────────────────────────────────────────── */
    const bg      = isDark ? '#1e293b' : '#fdfbf5';
    const border  = isDark ? 'rgba(255,255,255,0.1)' : '#e8dfc8';
    const text    = isDark ? '#f1f5f9' : '#3d2f1f';
    const muted   = isDark ? '#64748b' : '#a89878';
    const popupBg = isDark ? '#111827' : '#fdfbf5';

    /* ── Dropdown portal ──────────────────────────────────────────── */
    const dropdown = isOpen ? createPortal(
        <div
            ref={dropdownRef}
            style={{
                position: 'fixed',
                top:   dropPos.top,
                right: dropPos.right,
                zIndex: 99999,
                background: popupBg,
                border: `1px solid ${border}`,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: isDark
                    ? '0 20px 40px rgba(0,0,0,0.6)'
                    : '0 20px 40px rgba(0,0,0,0.15)',
            }}
        >
            {/* Quick select */}
            <Box sx={{
                p: 1.5,
                borderBottom: `1px solid ${border}`,
                '& .rdrCalendarWrapper': { fontSize: '0.75rem', backgroundColor: popupBg, color: text },
                '& .rdrMonthAndYearPickers select': { backgroundColor: bg, color: text, borderColor: border },
                '& .rdrDayDisabled': { backgroundColor: isDark ? '#0f172a' : '#f0e6d0' },
                '& .rdrDayNumber span': { color: text },
                '& .rdrDateDisplayWrapper': { display: 'none' },
            }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: muted, mb: 0.75, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Selección rápida
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {quickOptions.map((o) => (
                        <Button
                            key={o.label}
                            size="small"
                            variant="outlined"
                            onClick={() => setTempDateRange({ ...o.getValue(), key: 'selection' })}
                            sx={{
                                fontSize: '0.68rem', py: 0.4, px: 1, minWidth: 'auto',
                                borderColor: border, color: text, borderRadius: '6px',
                                '&:hover': { borderColor: '#ea580c', color: '#ea580c', backgroundColor: isDark ? '#1e293b' : '#fff7ed' },
                            }}

                        >
                            {o.label}
                        </Button>
                    ))}
                </Box>
            </Box>

            {/* Calendar */}
            <Box sx={{
                '& .rdrCalendarWrapper': { fontSize: '0.75rem', backgroundColor: popupBg, color: text },
                '& .rdrMonthAndYearPickers select': { backgroundColor: bg, color: text, borderColor: border },
                '& .rdrDayDisabled': { backgroundColor: isDark ? '#0f172a' : '#f0e6d0' },
                '& .rdrDayNumber span': { color: text },
                '& .rdrDateDisplayWrapper': { display: 'none' },
            }}>
                <DateRange
                    editableDateInputs={true}
                    onChange={(item: any) => setTempDateRange(item.selection)}
                    moveRangeOnFirstSelection={false}
                    ranges={[tempDateRange]}
                    maxDate={new Date()}
                    rangeColors={['#ea580c']}
                    months={1}
                    direction="horizontal"
                    showDateDisplay={false}
                />
            </Box>

            {/* Footer */}
            <Box sx={{ p: 1.5, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                    size="small" variant="outlined"
                    onClick={() => setIsOpen(false)}
                    sx={{ borderColor: border, color: muted, borderRadius: '8px', fontSize: '0.75rem',
                          '&:hover': { borderColor: muted, backgroundColor: isDark ? '#1e293b' : '#f7f0e0' } }}
                >
                    Cancelar
                </Button>
                <Button
                    size="small" variant="contained"
                    onClick={applyDateFilter}
                    sx={{ backgroundColor: '#ea580c', borderRadius: '8px', fontSize: '0.75rem',
                          '&:hover': { backgroundColor: '#c2410c' } }}
                >
                    Aplicar
                </Button>
            </Box>
        </div>,
        document.body
    ) : null;

    /* ── Render ───────────────────────────────────────────────────── */
    return (
        <div className="flex items-center gap-2" style={containerStyle}>
            {/* Trigger */}
            <div
                ref={triggerRef}
                onClick={handleOpen}
                className={[
                    'flex items-center gap-2 h-9 px-3 rounded-lg cursor-pointer select-none transition-all text-sm',
                    isOpen
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#fdfbf5] dark:bg-[#1e293b] border border-[#e8dfc8] dark:border-white/10 text-[#7a6a52] dark:text-gray-300 hover:border-orange-400 dark:hover:border-orange-500',
                ].join(' ')}
            >
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap font-medium">
                    {displayValue || 'Rango de fechas'}
                </span>
            </div>

            {/* Clear button */}
            {hasActive() && (
                <button
                    onClick={clearFilter}
                    title="Limpiar filtro"
                    className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#e8dfc8] dark:border-white/10 text-[#a89878] hover:text-red-500 hover:border-red-300 dark:hover:border-red-500/50 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            {dropdown}
        </div>
    );
};

export default DateRangeFilter;
