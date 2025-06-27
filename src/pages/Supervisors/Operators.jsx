import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import Icon from '@mdi/react';
import { icons } from '../../plugins/IconLibrary.js';
import { addOperatorApi, deleteOperatorApi, getAllOperatorApi, updateOperatorApi } from '../../api/supervisor/OperatorService.jsx';
import Loading from '../../components/Loading.jsx';
import CreateFirstEntity from '../../components/CreateFirstEntity.jsx';
import TableForm from '../../components/TableForm.jsx';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation.jsx';
import UpdateFormOperator from '../../components/Supervisors/UpdateFormOperator.jsx';
import CreateFormOperator from '../../components/Supervisors/CreateFormOperator.jsx';
import NewPwdForm from '../../components/NewPwdForm.jsx';
import { Autocomplete, TextField } from '@mui/material';

const OperatorsAdmin = () => {
    const [operators, setOperators] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);
    const [dataEditPwd, setDataEditPwd] = useState(null);

    const [showUpdate, setShowUpdate] = useState(false);
    const [showUpdatePwd, setShowUpdatePwd] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [inputValue, setInputValue] = useState("");
    const [filteredOperators, setFilteredOperators] = useState([]);

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

    const fetchOperators = async () => {
        try {
            setIsLoading(true);
            const data = await getAllOperatorApi();
            setOperators(data.data);
        } catch (error) {
            toast.error(` Error al obtener los operadores: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = useDeleteConfirmation({
        fetchData: fetchOperators,
        deleteApiFn: deleteOperatorApi,
        entityName: 'operator',
    });

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        fetchOperators();
    }, []);

    useEffect(() => {
        const value = inputValue.trim().toLowerCase();

        const filtered = operators.filter(op => {
            const fullName = `${op.name} ${op.lastname}`.toLowerCase();
            return fullName.includes(value);
        });

        setCurrentPage(1);

        setFilteredOperators(filtered.length > 0 || value ? filtered : operators);
    }, [inputValue, operators]);

    const totalPages = Math.ceil(filteredOperators.length / pageSize);
    const paginatedData = filteredOperators.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const paginationObject = {
        page: currentPage,
        totalPages,
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleCreateOperator = async (newOperator) => {
        try {
            await addOperatorApi(newOperator);
            await fetchOperators();
            setShowCreate(false);
            toast.success('Operador creado exitosamente!');
        } catch (error) {
            toast.error(` Error al crear al operador: ${error.message}`);
        }
    };

    const handleUpdateOperator = async (payload) => {
        try {
            await updateOperatorApi(payload, payload.id);
            await fetchOperators();
            setShowUpdate(false);
            setShowUpdatePwd(false);
            toast.success('Operador actualizado exitosamente!');
        } catch (error) {
            toast.error(` Error al actualizar al operador: ${error.message}`);
        }
    };

    return (
        <div className="m-4">
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                    <div className="block">
                        <h2 className="text-2xl font-bold">Mantenimiento de Operadores</h2>
                        <p className="text-gray-600">Gestiona y organiza todos tus operadores</p>
                    </div>
                    <div className='flex flex-col md:flex-row items-center w-full max-w-[30rem]'>
                        <div className="mt-2 md:mt-0 w-full">
                            <Autocomplete
                                freeSolo
                                options={operators}
                                getOptionLabel={(option) =>
                                    option ? `${option.name} ${option.lastname}` : ''
                                }
                                value={null}
                                inputValue={inputValue}
                                onInputChange={(event, newValue) => setInputValue(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                sx={{ width: '100%' }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Buscar operador" size="small" />
                                )}
                                
                            />
                        </div>
                        {operators.length > 0 ?(
                            <button
                                onClick={() => setShowCreate(true)}
                                className="mt-2 md:mt-0 ml-0 md:ml-2 cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                                type="button"
                            >
                                <Icon path={icons.add} size={1} />
                                Agregar Operador
                            </button>                        
                        ) : null}
                    </div>
                </div>
                <hr className='border-gray-200' />
                {isLoading ? (
                    <Loading message= "Cargando Operadores"/>
                ) : 
                    operators.length > 0 ?(
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
                            title="No hay operadores" 
                            body="Comienza creando tu primer operador para organizar tus registros" 
                            button="Crear primer operador" onCreate={() => setShowCreate(true)}
                        />
                    )
                }
            </div>
                
            <NewPwdForm
                isOpen={showUpdatePwd}
                onClose={() => setShowUpdatePwd(false)}
                data={dataEditPwd}
                onSubmit={handleUpdateOperator}
            />

            <UpdateFormOperator
                isOpen={showUpdate}
                onClose={() => setShowUpdate(false)}
                data={dataEdit}
                onSubmit={handleUpdateOperator}
            />

            <CreateFormOperator
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreateOperator}
            />
        </div>
    );
};

export default OperatorsAdmin;
