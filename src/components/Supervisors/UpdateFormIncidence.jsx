import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Autocomplete, CircularProgress, TextField, Select, MenuItem } from '@mui/material';
import { getIncidenceCodesApi } from '../../api/operador/incidenceApi';
import { getAllCrimesApi } from '../../api/crime/CrimeApi';

const UpdateFormIncidence = ({ isOpen, onClose, data, onSubmit, dataSelect }) => {
    const { zones = [], communications = [] } = dataSelect || {};
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);
    const [openCodeAutocomplete, setOpenCodeAutocomplete] = useState(false);
    const [inputValueCode, setInputValueCode] = useState('');
    const [optionsCode, setOptionsCode] = useState([]);
    const [loadingOptionsCode, setLoadingOptionsCode] = useState(false);
    const [crimeOptions, setCrimeOptions] = useState([]);
    const [loadingCrimes, setLoadingCrimes] = useState(false);

    const [form, setForm] = useState({
        code: '',
        name: '',
        description: '',
        zoneId: '',
        communicationId: '',
        date: '',
        status: '',
        observation: '',
        latitude: '',
        longitude: '',
        crimeId: '',
    });    
    
    // Precargar datos cuando se abra el modal
    useEffect(() => {
        if (data) {
            const dateTime = dayjs(data.date);
            setDate(dateTime.startOf('day'));
            setTime(dateTime);
            setInputValueCode(data.code || '');

            setForm({
                code: data.code || '',
                name: data.name || '',
                description: data.description || '',
                zoneId: data.zone?.id || data.zoneId || '',
                communicationId: data.communication?.id || data.communicationId || '',
                status: data.status || '',
                observation: data.observation || '',
                latitude: data.latitude || '',
                longitude: data.longitude || '',
                id: data.id,
                crimeId: data.crimeId || '',
            });
        }
    }, [data]);

    // Cargar códigos de incidencia
    useEffect(() => {
        if (!openCodeAutocomplete) return;
        setLoadingOptionsCode(true);

        const fetchOptions = async () => {
            try {
                const response = await getIncidenceCodesApi(inputValueCode);
                if (response.success && Array.isArray(response.data)) {
                    setOptionsCode(response.data);
                } else {
                    setOptionsCode([]);
                }
            } catch (err) {
                setOptionsCode([]);
                console.error('Error al cargar códigos:', err);
            } finally {
                setLoadingOptionsCode(false);
            }
        };

        const timeout = setTimeout(fetchOptions, 300);
        return () => clearTimeout(timeout);
    }, [inputValueCode, openCodeAutocomplete]);

    // Cargar opciones de crímenes
    useEffect(() => {
        if (!isOpen) return;
        setLoadingCrimes(true);

        const fetchCrimes = async () => {
            try {
                const response = await getAllCrimesApi();
                setCrimeOptions(response.data || []);
            } catch (err) {
                setCrimeOptions([]);
                console.error('Error al cargar crímenes:', err);
            } finally {
                setLoadingCrimes(false);
            }
        };

        fetchCrimes();
    }, [isOpen]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    
    const handleCodeSelection = (event, selectedOption) => {
        if (selectedOption) {
            if (typeof selectedOption === 'object') {
                setForm((prev) => ({
                    ...prev,
                    code: selectedOption.codigo_incidencia,
                    latitude: selectedOption.latitud,
                    longitude: selectedOption.longitud,
                }));
                setInputValueCode(selectedOption.codigo_incidencia);
            } else {
                setForm((prev) => ({
                    ...prev,
                    code: selectedOption,
                    latitude: '',
                    longitude: '',
                }));
                setInputValueCode(selectedOption);
            }
        } else {
            setForm((prev) => ({
                ...prev,
                code: '',
                latitude: '',
                longitude: '',
            }));
            setInputValueCode('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const combinedDateTime = date
            ?.hour(time?.hour() || 0)
            ?.minute(time?.minute() || 0)
            ?.second(0)
            ?.millisecond(0)
            ?.toISOString();

        onSubmit?.({
            ...form,
            date: combinedDateTime,
        });
        
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog open={isOpen} onClose={()=>{}} className="relative z-50">
                <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
                        <div className='mb-2 flex'>
                            <Dialog.Title className="text-lg font-bold">Editar Incidencia</Dialog.Title>
                            <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <hr className='border-gray-200 mb-4'/>
                        <form onSubmit={handleSubmit} className='max-h-[80vh] overflow-y-auto pb-4'>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium text-gray-900">Código</label>
                                <Autocomplete
                                    id="code-autocomplete"
                                    open={openCodeAutocomplete}
                                    onOpen={() => {
                                        setOpenCodeAutocomplete(true);
                                        setInputValueCode(form.code || '');
                                    }}
                                    onClose={() => setOpenCodeAutocomplete(false)}
                                    options={optionsCode}
                                    loading={loadingOptionsCode}
                                    value={form.code}
                                    onChange={handleCodeSelection}
                                    inputValue={inputValueCode}
                                    onInputChange={(e, newInputValue) => setInputValueCode(newInputValue)}
                                    getOptionLabel={(option) => {
                                        if (typeof option === 'object' && option.codigo_incidencia) {
                                            return option.codigo_incidencia;
                                        }
                                        return option;
                                    }}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <div>
                                                <div className="font-medium">{option.codigo_incidencia}</div>
                                                <div className="text-sm text-gray-500">
                                                    Lat: {option.latitud}, Lng: {option.longitud}
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                            {...params}
                                            placeholder="Buscar o ingresar código"
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loadingOptionsCode && <CircularProgress color="inherit" size={20} />}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                                {form.latitude && form.longitude && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        📍 Coordenadas: {form.latitude}, {form.longitude}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium text-gray-900">Crimen</label>
                                <select
                                name="crimeId"
                                value={form.crimeId}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded mt-1 text-sm"
                                >
                                {!form.crimeId && (
                                    <option value="" disabled hidden>
                                    Selecciona un crimen
                                    </option>
                                )}
                                {crimeOptions.map((crime) => (
                                    <option key={crime.id} value={crime.id}>
                                    {crime.name}
                                    </option>
                                ))}
                                </select>

                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                    className="w-full border px-3 py-2 rounded mt-1"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium">Descripción</label>
                                <textarea
                                    name="description"
                                    value={form.description ?? ''}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full border px-3 py-2 rounded mt-1"
                                />
                            </div>

                            <div className='flex flex-col md:flex-row'>
                                <div className="mb-4 w-full mr-4">
                                    <label className="block text-sm font-medium">Zona</label>
                                    <select
                                        name="zoneId"
                                        value={form.zoneId}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded mt-1 text-sm"
                                        >
                                        {!form.zoneId && (
                                            <option value="" disabled hidden>
                                            Seleccione una zona
                                            </option>
                                        )}
                                        {zones.map((zone) => (
                                            <option key={zone.id} value={zone.id}>
                                            {zone.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4 w-full">
                                    <label className="block text-sm font-medium">Medio</label>
                                    <select
                                        name="communicationId"
                                        value={form.communicationId}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded mt-1 text-sm"
                                        >
                                        {!form.communicationId && (
                                            <option value="" disabled hidden>
                                            Seleccione un medio
                                            </option>
                                        )}
                                        {communications.map((com) => (
                                            <option key={com.id} value={com.id}>
                                            {com.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='flex flex-col md:flex-row'>
                                <div className="mb-4 w-full mr-4">
                                    <label className="block text-sm font-medium mb-1">Fecha</label>
                                    <DatePicker
                                        value={date}
                                        onChange={(newDate) => setDate(newDate)}
                                        format="DD/MM/YYYY"
                                        className="w-full border px-3 py-2 rounded mt-1"
                                        slotProps={{
                                            textField: {
                                                InputProps: {
                                                    sx: { height: 40 }
                                                },
                                                size: 'small',
                                                fullWidth: true
                                            }
                                        }}
                                    />
                                </div>
                                <div className="mb-4 w-full">
                                    <label className="block text-sm font-medium mb-1">Hora</label>
                                    <TimePicker
                                        ampm={false}
                                        value={time}
                                        onChange={(newTime) => setTime(newTime)}
                                        className="w-full border px-3 py-2 rounded"
                                        slotProps={{
                                            textField: {
                                                InputProps: {
                                                    sx: { height: 40 }
                                                },
                                                size: 'small',
                                                fullWidth: true
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium">Estado</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className={`w-full border px-3 py-2 rounded mt-1 text-sm focus:ring-block p-2.5
                                        ${form.status === "process" ? "bg-blue-200 focus:ring-blue-500 focus:border-blue-500 border-blue-300 text-blue-900" : ""}
                                        ${form.status === "finished" ? "bg-red-200 focus:ring-red-500 focus:border-red-500 border-red-300 text-red-900" : ""}
                                        ${form.status === "completed" ? "bg-green-200 focus:ring-green-500 focus:border-green-500 border-green-300 text-green-900" : ""}`}
                                >
                                    <option className='bg-white text-black' value="process">En Proceso</option>
                                    <option className='bg-white text-black' value="completed">Completado</option>
                                    <option className='bg-white text-black' value="finished">Finalizado</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium">Observación</label>
                                <textarea
                                    name="observation"
                                    value={form.observation ?? ''}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full border px-3 py-2 rounded mt-1"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mr-2 px-4 py-2 border rounded cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 cursor-pointer"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </LocalizationProvider>
    );
};

export default UpdateFormIncidence;