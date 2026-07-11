import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js';
import {
    getAllHuntersApi,
    deleteHunterApi,
    createHunterApi,
    updateHunterApi
} from '../../api/supervisor/HunterService.tsx';
import { changeUserRoleApi } from '../../api/admin/userApi';
import Loading from '../../components/Loading';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation.tsx';
import UpdateFormOperator from '../../components/Supervisors/UpdateFormOperator.tsx';
import CreateFormOperator from '../../components/Supervisors/CreateFormOperator.tsx';
import NewPwdForm from '../../components/NewPwdForm.tsx';
import ChangeRoleModal from '../../components/Admin/ChangeRoleModal.tsx';
import CustomTablePagination from '../../components/Pagination/TablePagination.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Users } from 'lucide-react';
import { useSetPageTitle } from '../../contexts/PageTitleContext';

const CazadoresAdmin = () => {
    useSetPageTitle('Cazadores', 'Gestión de cazadores');
    const navigate = useNavigate();
    const location = useLocation();

    const [cazadores, setCazadores] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [showCreate, setShowCreate] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);
    const [dataEditPwd, setDataEditPwd] = useState(null);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showUpdatePwd, setShowUpdatePwd] = useState(false);
    const [dataEditRole, setDataEditRole] = useState(null);
    const [showChangeRole, setShowChangeRole] = useState(false);

    const rowsPerPage = 10;
    const searchParams = new URLSearchParams(location.search);
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || rowsPerPage;

    const openModalEdit = (payload) => { setDataEdit(payload); setShowUpdate(true); };
    const openModalEditPwd = (payload) => { setDataEditPwd(payload); setShowUpdatePwd(true); };
    const openModalChangeRole = (payload) => { setDataEditRole(payload); setShowChangeRole(true); };

    const fetchCazadores = async () => {
        try {
            setIsLoading(true);
            const params = {
                page: currentPage,
                limit,
                ...(inputValue.trim() && { search: inputValue.trim() }),
            };
            const response = await getAllHuntersApi(params);
            setCazadores(response.data.data || []);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            toast.error(`Error al obtener cazadores: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = useDeleteConfirmation({
        fetchData: fetchCazadores,
        deleteApiFn: deleteHunterApi,
        entityName: 'cazador',
    });

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
        const timer = setTimeout(fetchCazadores, inputValue ? 500 : 0);
        return () => clearTimeout(timer);
    }, [currentPage, limit, inputValue]);

    const handleCreateCazador = async (newCazador) => {
        try {
            await createHunterApi(newCazador);
            await fetchCazadores();
            setShowCreate(false);
            toast.success('Cazador creado exitosamente!');
        } catch (error) {
            toast.error(`Error al crear al cazador: ${error.message}`);
        }
    };

    const handleUpdateCazador = async (payload) => {
        try {
            await updateHunterApi(payload, payload.id);
            await fetchCazadores();
            setShowUpdate(false);
            setShowUpdatePwd(false);
            toast.success('Cazador actualizado exitosamente!');
        } catch (error) {
            toast.error(`Error al actualizar al cazador: ${error.message}`);
        }
    };

    const handleChangeRole = async (id, role) => {
        try {
            await changeUserRoleApi(id, role);
            await fetchCazadores();
            setShowChangeRole(false);
            toast.success('Rol actualizado exitosamente!');
        } catch (error) {
            toast.error(`Error al cambiar el rol: ${error.message}`);
        }
    };

    return (
        <div className="p-2 sm:p-4 h-[calc(100vh-5rem)] flex flex-col">
            <div className="flex-1 min-h-0 rounded-xl bg-[#fdfbf5] dark:bg-[#111827] shadow border border-[#e8dfc8] dark:border-white/10 p-4 sm:p-6 flex flex-col gap-4">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a89878] pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar cazador..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full sm:w-64 h-9 pl-9 pr-3 text-sm bg-[#fdfbf5] dark:bg-[#1e293b] border border-[#e8dfc8] dark:border-white/10 text-[#3d2f1f] dark:text-white placeholder-[#7a6a52] dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sm:hidden">Agregar Cazador</span>
                            <span className="hidden sm:inline">Agregar</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <Loading message="Cargando Cazadores" />
                ) : cazadores.length > 0 ? (
                    <div className="flex flex-col gap-3 flex-1 min-h-0">
                        <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-[#e8dfc8] dark:border-white/8">
                            <table className="min-w-full divide-y divide-[#e8dfc8] dark:divide-white/8">
                                <thead className="bg-[#f0e6d0] dark:bg-[#1e293b]">
                                    <tr>
                                        {['Nombre', 'Apellido', 'DNI', 'Teléfono', 'Usuario'].map((h) => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#7a6a52] dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-[#7a6a52] dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#fdfbf5] dark:bg-[#111827] divide-y divide-[#e8dfc8] dark:divide-white/5">
                                    {cazadores.map((item, idx) => (
                                        <tr key={item.id || idx} className="hover:bg-[#f7f0e0] dark:hover:bg-white/5 transition-colors">
                                            <td className="px-5 py-3.5 text-sm text-[#3d2f1f] dark:text-gray-200">{item.name || '—'}</td>
                                            <td className="px-5 py-3.5 text-sm text-[#3d2f1f] dark:text-gray-200">{item.lastname || '—'}</td>
                                            <td className="px-5 py-3.5 text-sm text-[#3d2f1f] dark:text-gray-200">{item.dni || '—'}</td>
                                            <td className="px-5 py-3.5 text-sm text-[#3d2f1f] dark:text-gray-200">{item.phone || '—'}</td>
                                            <td className="px-5 py-3.5 text-sm text-[#3d2f1f] dark:text-gray-200">{item.username || '—'}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex justify-center gap-0.5">
                                                    <button onClick={() => openModalEditPwd(item)} title="Nueva contraseña" className="p-1.5 rounded-lg hover:bg-[#f0e6d0] dark:hover:bg-white/8 transition-colors">
                                                        <Icon path={icons.mdiAccountKey} size={0.85} className="text-[#a89878] dark:text-gray-400" />
                                                    </button>
                                                    <button onClick={() => openModalEdit(item)} title="Editar" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                                                        <Icon path={icons.edit} size={0.85} className="text-blue-500 dark:text-blue-400" />
                                                    </button>
                                                    <button onClick={() => openModalChangeRole(item)} title="Cambiar rol" className="p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
                                                        <Icon path={icons.changeRole} size={0.85} className="text-orange-500 dark:text-orange-400" />
                                                    </button>
                                                    <button onClick={() => confirmDelete(item, (p) => `${p.name} ${p.lastname}`)} title="Eliminar" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
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
                        <Users className="h-12 w-12 text-[#a89878] dark:text-gray-500" />
                        <h3 className="text-base font-semibold text-[#3d2f1f] dark:text-white">No hay cazadores registrados</h3>
                        <p className="text-sm text-[#a89878] dark:text-gray-400 max-w-xs">Aún no se han registrado cazadores en el sistema</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Plus className="h-4 w-4" /> Crear primer cazador
                        </button>
                    </div>
                )}
            </div>

            <NewPwdForm isOpen={showUpdatePwd} onClose={() => setShowUpdatePwd(false)} data={dataEditPwd} onSubmit={handleUpdateCazador} />
            <UpdateFormOperator isOpen={showUpdate} onClose={() => setShowUpdate(false)} data={dataEdit} onSubmit={handleUpdateCazador} />
            <CreateFormOperator isOpen={showCreate} onClose={() => setShowCreate(false)} onSubmit={handleCreateCazador} />
            <ChangeRoleModal isOpen={showChangeRole} onClose={() => setShowChangeRole(false)} data={dataEditRole} onSubmit={handleChangeRole} />
        </div>
    );
};

export default CazadoresAdmin;
