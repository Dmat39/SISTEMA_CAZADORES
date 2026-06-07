import { useEffect, useRef, useState } from 'react';
import CreateForm from '../../components/Admin/CreateForm.tsx';
import { getAllSupervisorApi, addsupervidorServiceApi, deleteSupervisorApi, updateSupervisorApi } from '../../api/supervisor/SupervidorService';
import UpdateForm from '../../components/Admin/UpdateForm.tsx';
import { toast } from 'sonner';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js';
import CustomTablePagination from '../../components/Pagination/TablePagination.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Users } from 'lucide-react';
import { useSetPageTitle } from '../../contexts/PageTitleContext';

const SupervisorsAdmin = () => {
    useSetPageTitle('Supervisores', 'Gestión de supervisores');
    const navigate = useNavigate();
    const location = useLocation();

    const [supervisors, setSupervisors] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [showCreate, setShowCreate] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);
    const [showUpdate, setShowUpdate] = useState(false);

    const rowsPerPage = 10;
    const searchParams = new URLSearchParams(location.search);
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || rowsPerPage;

    const openModalEdit = (payload) => { setDataEdit(payload); setShowUpdate(true); };

    const fetchSupervisors = async () => {
        try {
            setIsLoading(true);
            const params = {
                page: currentPage,
                limit,
                ...(inputValue.trim() && { search: inputValue.trim() }),
            };
            const response = await getAllSupervisorApi(params);
            setSupervisors(response.data.data || []);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            toast.error(`Error al obtener supervisores: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSupervisor = (payload) => {
        toast(
            () => (
                <div className="flex flex-col space-y-2">
                    <p>¿Estás seguro de eliminar a <strong>{payload.name} {payload.lastname}</strong>?</p>
                    <div className="flex justify-center gap-2">
                        <button onClick={() => toast.dismiss()} className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-white/10 dark:border-white/20 dark:text-white">Cancelar</button>
                        <button
                            onClick={async () => {
                                toast.dismiss();
                                try {
                                    await deleteSupervisorApi(payload.id);
                                    await fetchSupervisors();
                                    toast.success('Supervisor eliminado exitosamente!');
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
            { position: 'top-center', className: 'flex justify-center', duration: 999999 }
        );
    };

    const updateSupervisor = async (payload) => {
        try {
            await updateSupervisorApi(payload, payload.id);
            toast.success('Supervisor actualizado exitosamente!');
        } catch (error) {
            toast.error(`Error al actualizar el supervisor ${error.message}`);
        }
    };

    const handlePageLimitChange = (newPage, newLimit) => {
        const sp = new URLSearchParams(location.search);
        if (newLimit !== limit) { sp.set('limit', newLimit.toString()); sp.set('page', '1'); }
        else { sp.set('page', newPage.toString()); }
        navigate({ search: sp.toString() });
    };

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
    }, []);

    useEffect(() => {
        const timer = setTimeout(fetchSupervisors, inputValue ? 500 : 0);
        return () => clearTimeout(timer);
    }, [currentPage, limit, inputValue]);

    const handleCreate = async (newSupervisor) => {
        try {
            await addsupervidorServiceApi(newSupervisor);
            await fetchSupervisors();
            setShowCreate(false);
            toast.success('Supervisor creado exitosamente!');
        } catch (error) {
            toast.error(`Error al crear el supervisor ${error.message}`);
        }
    };

    return (
        <div className="p-2 sm:p-4 h-[calc(100vh-5rem)] flex flex-col">
            <div className="flex-1 min-h-0 rounded-xl bg-slate-50 dark:bg-[#111827] shadow border border-gray-200 dark:border-white/10 p-4 sm:p-6 flex flex-col gap-4">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar supervisor..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full sm:w-64 h-9 pl-9 pr-3 text-sm bg-gray-100 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sm:hidden">Agregar Supervisor</span>
                            <span className="hidden sm:inline">Agregar</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center gap-3 py-10 text-gray-500 dark:text-gray-400">
                        <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                        <span className="text-sm font-medium">Cargando Supervisores . . .</span>
                    </div>
                ) : supervisors.length > 0 ? (
                    <div className="flex flex-col gap-3 flex-1 min-h-0">
                        <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-gray-200 dark:border-white/8">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-white/8">
                                <thead className="bg-gray-100 dark:bg-[#1e293b]">
                                    <tr>
                                        {['Nombre', 'Apellido', 'DNI', 'Teléfono', 'Usuario'].map((h) => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-50 dark:bg-[#111827] divide-y divide-gray-100 dark:divide-white/5">
                                    {supervisors.map((item, idx) => (
                                        <tr key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-5 py-3.5 text-sm text-gray-900 dark:text-gray-200">{item.name || '—'}</td>
                                            <td className="px-5 py-3.5 text-sm text-gray-900 dark:text-gray-200">{item.lastname || '—'}</td>
                                            <td className="px-5 py-3.5 text-sm text-gray-900 dark:text-gray-200">{item.dni || '—'}</td>
                                            <td className="px-5 py-3.5 text-sm text-gray-900 dark:text-gray-200">{item.phone || '—'}</td>
                                            <td className="px-5 py-3.5 text-sm text-gray-900 dark:text-gray-200">{item.username || '—'}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex justify-center gap-0.5">
                                                    <button onClick={() => openModalEdit(item)} title="Editar" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                                                        <Icon path={icons.edit} size={0.85} className="text-blue-500 dark:text-blue-400" />
                                                    </button>
                                                    <button onClick={() => deleteSupervisor(item)} title="Eliminar" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                                        <Icon path={icons.delete} size={0.85} className="text-red-500 dark:text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-center">
                            <CustomTablePagination
                                count={totalCount}
                                page={currentPage}
                                limit={limit}
                                handlePageLimitChange={handlePageLimitChange}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <Users className="h-12 w-12 text-gray-500 dark:text-gray-500" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">No hay supervisores registrados</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Aún no se han registrado supervisores en el sistema</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Plus className="h-4 w-4" /> Crear primer supervisor
                        </button>
                    </div>
                )}
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
            <CreateForm isOpen={showCreate} onClose={() => setShowCreate(false)} onSubmit={handleCreate} />
        </div>
    );
};

export default SupervisorsAdmin;
