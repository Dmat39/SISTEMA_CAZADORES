import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import { addOperatorApi, deleteOperatorApi, getAllOperatorApi, updateOperatorApi } from '../../api/supervisor/OperatorService.jsx';
import UpdateForm from '../../components/Supervisors/UpdateForm.jsx';
import CreateForm from '../../components/Supervisors/CreateForm.jsx';
import TableForm from '../../components/Supervisors/TableForm.jsx';

const OperatorsAdmin = () => {
    const [operators, setOperators] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);

    const [showUpdate, setShowUpdate] = useState(false);

    const openModalEdit = (payload) => {
        setDataEdit(payload);
        setShowUpdate(true);
    };

    const fetchOperators = async () => {
        try {
            const data = await getAllOperatorApi();
            setOperators(data.data);
        } catch (error) {
            toast.error(` Error al obtener los operadores: ${error.message}`);
        }
    };

    const deleteOperator = async (payload) => {
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
                                    await deleteOperatorApi(payload.id);
                                    await fetchOperators();
                                    toast.success(" Operador eliminado exitosamente!", {
                                        position: 'top-right',
                                    });
                                } catch (err) {
                                    toast.error(`Error al eliminar operador: ${err.message}`);
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
                duration: 999999,
                className: "flex justify-center"
            }
        );

    };

    const updateOperator = async (payload) => {
        try {
            await updateOperatorApi(payload, payload.id);
            toast.success('Operador actualizado exitosamente!');
        } catch (error) {
            toast.error(` Error al actualizar el operador: ${error.message}`);
        }
    }

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        fetchOperators();
    }, []);

    const handleCreate = async (newOperator) => {
        try {
            await addOperatorApi(newOperator);
            await fetchOperators();
            setShowCreate(false);
            toast.success('Operador creado exitosamente!');
        } catch (error) {
            toast.error(` Error al crear al operador: ${error.message}`);
        }
    };

    return (
        <div className="m-4">
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="block">
                        <h2 className="text-2xl font-bold">Mantenimiento de Operadores</h2>
                        <p className="text-gray-600">Gestiona y organiza todos tus operadores</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                        type="button"
                    >
                        <Icon path={mdiPlus} size={1} />
                        Agregar Operador
                    </button>
                </div>

                <hr className='border-gray-200' />
                <TableForm data={operators} onDelete={deleteOperator} onEdit={openModalEdit}/>
            </div>

            <UpdateForm
                isOpen={showUpdate}
                onClose={() => setShowUpdate(false)}
                data={dataEdit}
                onSubmit={async (updatedOperator) => {
                    await updateOperator(updatedOperator);
                    await fetchOperators();
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

export default OperatorsAdmin;
