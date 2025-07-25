import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js';
import { 
    getAllHuntersApi, 
    deleteHunterApi, 
    createHunterApi, 
    updateHunterApi 
} from '../../api/supervisor/HunterService.jsx';
import Loading from '../../components/Loading.jsx';
import CreateFirstEntity from '../../components/CreateFirstEntity.jsx';
import TableForm from '../../components/TableForm.jsx';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation.jsx';
import UpdateFormOperator from '../../components/Supervisors/UpdateFormOperator.jsx';
import CreateFormOperator from '../../components/Supervisors/CreateFormOperator.jsx';
import NewPwdForm from '../../components/NewPwdForm.jsx';
import { Autocomplete, TextField } from '@mui/material';

const CazadoresSupervisor = () => {
    const [cazadores, setCazadores] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);
    const [dataEditPwd, setDataEditPwd] = useState(null);

    const [showUpdate, setShowUpdate] = useState(false);
    const [showUpdatePwd, setShowUpdatePwd] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [inputValue, setInputValue] = useState("");
    const [filteredCazadores, setFilteredCazadores] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; 

    const openModalEdit = (payload) => {
        setDataEdit(payload);
        setShowUpdate(true);
    };

    const openModalEditPwd = (payload) => {
        setDataEditPwd(payload);
        setShowUpdatePwd(true);
    };

    const fetchCazadores = async () => {
        try {
            setIsLoading(true);
            const response = await getAllHuntersApi(currentPage, pageSize);
            setCazadores(response.data.data);
        } catch (error) {
            toast.error(` Error al obtener los cazadores: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = useDeleteConfirmation({
        fetchData: fetchCazadores,
        deleteApiFn: deleteHunterApi,
        entityName: 'cazador',
    });

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        fetchCazadores();
    }, []);

    useEffect(() => {
        const value = inputValue.trim().toLowerCase();

        const filtered = cazadores.filter(op => {
            const fullName = `${op.name} ${op.lastname}`.toLowerCase();
            return fullName.includes(value);
        });

        setCurrentPage(1);

        setFilteredCazadores(filtered.length > 0 || value ? filtered : cazadores);
    }, [inputValue, cazadores]);

    const totalPages = Math.ceil(filteredCazadores.length / pageSize);
    const paginatedData = filteredCazadores.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const paginationObject = {
        page: currentPage,
        totalPages,
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleCreateCazador = async (newCazador) => {
        try {
            await createHunterApi(newCazador);
            await fetchCazadores();
            setShowCreate(false);
            toast.success('Cazador creado exitosamente!');
        } catch (error) {
            toast.error(` Error al crear al cazador: ${error.message}`);
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
            toast.error(` Error al actualizar al cazador: ${error.message}`);
        }
    };

    return (
        <div className="m-4">
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                    <div className="block">
                        <h2 className="text-2xl font-bold">Mantenimiento de Cazadores</h2>
                        <p className="text-gray-600">Gestiona y organiza todos tus cazadores</p>
                    </div>
                    <div className='flex flex-col md:flex-row items-center w-full max-w-[30rem]'>
                        <div className="mt-2 md:mt-0 w-full">
                            <Autocomplete
                                freeSolo
                                options={cazadores}
                                getOptionLabel={(option) =>
                                    option ? `${option.name} ${option.lastname}` : ''
                                }
                                value={null}
                                inputValue={inputValue}
                                onInputChange={(event, newValue) => setInputValue(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                sx={{ width: '100%' }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Buscar cazador" size="small" />
                                )}
                                
                            />
                        </div>
                        {cazadores.length > 0 ?(
                            <button
                                onClick={() => setShowCreate(true)}
                                className="mt-2 md:mt-0 ml-0 md:ml-2 cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                                type="button"
                            >
                                <Icon path={icons.add} size={1} />
                                Agregar Cazador
                            </button>                        
                        ) : null}
                    </div>
                </div>
                <hr className='border-gray-200' />
                {isLoading ? (
                    <Loading message= "Cargando Cazadores"/>
                ) : 
                    cazadores.length > 0 ?(
                        <TableForm
                            data={paginatedData}
                            pagination={paginationObject}
                            onPageChange={handlePageChange}
                            columns={[
                                { label: 'Nombre', key: 'name'},
                                { label: 'Apellido', key: 'lastname' },
                                { label: 'Teléfono', key: 'phone' },
                                { label: 'DNI', key: 'dni' },
                                { label: 'Usuario', key: 'user.username' },
                                { label: 'Rol', key: 'user.role' },
                            ]}
                            actions={[
                                {
                                    title: 'Nueva contraseña',
                                    onClick: openModalEditPwd,
                                    icon: icons.mdiAccountKey,
                                    className: 'text-black-600 hover:text-black-800',
                                },
                                {
                                    title: 'Editar',
                                    onClick: openModalEdit,
                                    icon: icons.edit,
                                    className: 'text-blue-600 hover:text-blue-800',
                                },
                                {
                                    title: 'Eliminar',
                                    onClick: (op) => confirmDelete(op, (p) => `${p.name} ${p.lastname}`),
                                    icon: icons.delete,
                                    className: 'text-red-600 hover:text-red-800',
                                },
                            ]}
                        />

                    ) : (
                        <CreateFirstEntity 
                            title="No hay cazadores" 
                            body="Comienza creando tu primer cazador para organizar tus registros" 
                            button="Crear primer cazador" onCreate={() => setShowCreate(true)}
                        />
                    )
                }
            </div>
                
            <NewPwdForm
                isOpen={showUpdatePwd}
                onClose={() => setShowUpdatePwd(false)}
                data={dataEditPwd}
                onSubmit={handleUpdateCazador}
            />

            <UpdateFormOperator
                isOpen={showUpdate}
                onClose={() => setShowUpdate(false)}
                data={dataEdit}
                onSubmit={handleUpdateCazador}
            />

            <CreateFormOperator
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreateCazador}
            />
        </div>
    );
};

export default CazadoresSupervisor; 