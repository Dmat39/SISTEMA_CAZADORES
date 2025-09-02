import React, { useEffect, useRef, useState } from 'react';
import CreateForm from "../../components/Admin/CreateForm.jsx";
import {
    getAllSupervisorApi,
    addsupervidorServiceApi, deleteSupervisorApi, updateSupervisorApi
} from '../../api/supervisor/SupervidorService';
import UpdateForm from "../../components/Admin/UpdateForm.jsx";
import { toast } from 'sonner';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import { icons } from '../../plugins/IconLibrary.js';
import CustomTablePagination from '../../components/Pagination/TablePagination.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const SupervisorsAdmin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark } = useTheme();

    const [supervisors, setSupervisors] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [showCreate, setShowCreate] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);
    const [showUpdate, setShowUpdate] = useState(false);

    const rowsPerPage = 10;

    // Obtener parámetros de URL para paginación
    const searchParams = new URLSearchParams(location.search);
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || rowsPerPage;

    const openModalEdit = (payload) => {
        setDataEdit(payload);
        setShowUpdate(true);
    };

    const fetchSupervisors = async () => {
        try {
            setIsLoading(true);
            const params = {
                page: currentPage,
                limit: limit,
                // Agregar búsqueda si hay input
                ...(inputValue.trim() && { search: inputValue.trim() })
            };

            const response = await getAllSupervisorApi(params);
            // La respuesta tiene estructura: { data: { data: [...], totalCount: ..., totalPages: ... } }
            const supervisorsData = response.data.data || [];
            setSupervisors(supervisorsData);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            console.error('Error fetching supervisors:', error);
            toast.error(`Error al obtener supervisores: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSupervisor = async (payload) => {
        toast(
            () => (
                <div className="flex flex-col space-y-2">
                    <p>¿Estás seguro de eliminar a <strong>{payload.name} {payload.lastname}</strong>?</p>
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(); // cerrar manualmente
                            }}
                            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={async () => {
                                toast.dismiss();
                                try {
                                    await deleteSupervisorApi(payload.id);
                                    await fetchSupervisors();
                                    toast.success(" Supervisor eliminado exitosamente!", {
                                        position: 'top-right',
                                    });
                                } catch (err) {
                                    toast.error(`Error al eliminar supervisor ${err.message}`);
                                }
                            }}
                            className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            ),
            {
                position: "top-center",
                className: "flex justify-center",
                duration: 999999,
            }
        );

    };

    const updateSupervisor = async (payload) => {
        const id = payload.id;
        try {
            await updateSupervisorApi(payload, id);
            toast.success('Supervisor actualizado exitosamente!');
        } catch (error) {
            toast.error(` Error al actualizar el supervisor ${error.message}`);
        }
    }

    // Función para manejar cambio de página/límite
    const handlePageLimitChange = (newPage, newLimit) => {
        const searchParams = new URLSearchParams(location.search);

        if (newLimit !== limit) {
            searchParams.set('limit', newLimit.toString());
            searchParams.set('page', '1'); // Reset a página 1 cuando cambia el límite
        } else {
            searchParams.set('page', newPage.toString());
        }

        navigate({ search: searchParams.toString() });
    };

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        // Solo cargar datos auxiliares en el primer mount
        // fetchSupervisors se maneja en el otro useEffect
    }, []);

    // Ejecutar fetchSupervisors cuando cambien las dependencias
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSupervisors();
        }, inputValue ? 500 : 0); // Debounce solo si hay búsqueda

        return () => clearTimeout(timer);
    }, [currentPage, limit, inputValue]);

    const handleCreate = async (newSupervisor) => {
        try {
            await addsupervidorServiceApi(newSupervisor);
            await fetchSupervisors();
            setShowCreate(false);
            toast.success('Supervisor creado exitosamente!');
        } catch (error) {
            toast.error(` Error al crear el supervisor ${error.message}`);
            console.error("Error al crear supervisor:", error.message);
        }
    };

    return (
        <div className={`m-2 sm:m-4 h-[calc(100vh-1rem)] sm:h-auto flex flex-col ${isDark ? 'bg-black' : ''}`}>
            <div className={`rounded-xl shadow-md p-3 sm:p-6 flex-1 flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6">
                    <div className="block mb-4 lg:mb-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Mantenimiento de Supervisores</h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 transition-colors duration-200">Gestiona y organiza todos los supervisores</p>
                    </div>
                    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end w-full lg:max-w-[60rem] xl:max-w-[70rem] gap-2 mt-2 sm:mt-0'>
                        {/* Campo de búsqueda */}
                        <div className="w-full sm:flex-1 sm:min-w-[200px] lg:max-w-[300px]">
                            <div className='relative w-full'>
                                <Icon
                                    path={icons.searchIcon}
                                    size={0.8}
                                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10'
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar supervisor..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className={`w-full h-10 pl-10 pr-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                            </div>
                        </div>

                        {/* Botón agregar */}
                        <button
                            onClick={() => setShowCreate(true)}
                            className={`w-full sm:w-auto cursor-pointer flex flex-row items-center justify-center gap-1 text-white font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out whitespace-nowrap focus:ring-4 focus:outline-none ${isDark ? 'bg-gray-700 hover:bg-[#32A3B5] focus:ring-gray-600' : 'bg-gray-900 hover:bg-[#32A3B5] focus:ring-blue-500'}`}
                            type="button"
                        >
                            <Icon path={mdiPlus} size={1} />
                            <span className="block sm:hidden">Agregar Supervisor</span>
                            <span className="hidden sm:block">Agregar</span>
                        </button>
                    </div>
                </div>
                {/* <hr className='border-gray-200' /> */}
                <div className="flex-1 flex flex-col min-h-0">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2 ${isDark ? 'border-gray-300' : 'border-gray-900'}`}></div>
                                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Cargando Supervisores...</p>
                            </div>
                        </div>
                    ) :
                        supervisors?.length > 0 ? (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* Paginación superior */}
                                {/* <div className="flex justify-center items-center mb-3">
                                    <CustomTablePagination
                                        count={totalCount}
                                        page={currentPage}
                                        limit={limit}
                                        handlePageLimitChange={handlePageLimitChange}
                                    />
                                </div> */}

                                {/* Tabla */}
                                <div className="overflow-x-auto shadow rounded-lg max-h-[67vh] h-full">
                                    <table className="min-w-full divide-y divide-gray-250 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
                                        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10 transition-colors duration-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Nombre</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Apellido</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">DNI</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Teléfono</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Usuario</th>
                                                {/* <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rol</th> */}
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200" style={{ textAlign: 'center' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-250 dark:divide-gray-700 transition-colors duration-200">
                                            {supervisors.map((item, idx) => (
                                                <tr key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 transition-colors duration-200">
                                                        {item.name || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 transition-colors duration-200">
                                                        {item.lastname || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 transition-colors duration-200">
                                                        {item.dni || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 transition-colors duration-200">
                                                        {item.phone || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 transition-colors duration-200">
                                                        {item.username || '—'}
                                                    </td>
                                                    {/* <td className="px-6 py-4 text-sm text-gray-800">
                                                        {item.user?.role || '—'}
                                                    </td> */}
                                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 space-x-2 transition-colors duration-200">
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={() => openModalEdit(item)}
                                                                title="Editar"
                                                                className="cursor-pointer p-1"
                                                            >
                                                                <Icon
                                                                    path={icons.edit}
                                                                    size={1}
                                                                    className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteSupervisor(item)}
                                                                title="Eliminar"
                                                                className="cursor-pointer p-1"
                                                            >
                                                                <Icon
                                                                    path={icons.delete}
                                                                    size={1}
                                                                    className={`${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación inferior */}
                                <div className="flex justify-center items-center mt-3">
                                    <CustomTablePagination
                                        count={totalCount}
                                        page={currentPage}
                                        limit={limit}
                                        handlePageLimitChange={handlePageLimitChange}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="flex flex-col items-center justify-center text-center px-4 py-8">
                                    <Icon path={icons.mdiAccountMultiple} size={2} className={`mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <h3 className={`text-base sm:text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                        No hay supervisores registrados
                                    </h3>
                                    <p className={`text-sm sm:text-base mb-6 max-w-md ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Aún no se han registrado supervisores en el sistema
                                    </p>
                                    <button
                                        onClick={() => setShowCreate(true)}
                                        className={`inline-flex items-center px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors duration-200 ${isDark ? 'bg-gray-700 hover:bg-[#32A3B5]' : 'bg-gray-900 hover:bg-[#32A3B5]'}`}
                                    >
                                        Crear primer supervisor
                                    </button>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>

            <UpdateForm
                isOpen={showUpdate}
                onClose={() => setShowUpdate(false)}
                data={dataEdit}
                onSubmit={async (updatedSupervisor) => {
                    await updateSupervisor(updatedSupervisor);
                    await fetchSupervisors();
                    setShowUpdate(false);
                }}
            />


            <CreateForm
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreate}

            />
        </div>
    );
};

export default SupervisorsAdmin;
