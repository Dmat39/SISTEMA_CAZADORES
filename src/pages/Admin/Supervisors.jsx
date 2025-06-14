import React, {useEffect, useRef, useState} from 'react';
import Table from "../../components/Admin/TableForm.jsx";
import CreateForm from "../../components/Admin/CreateForm.jsx";
import {
    getAllSupervisorApi,
    addsupervidorServiceApi, deleteSupervisorApi, updateSupervisorApi
} from '../../api/supervisor/SupervidorService';
import UpdateForm from "../../components/Admin/UpdateForm.jsx";
import {toast} from 'sonner';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';

const SupervisorsAdmin = () => {
    const [supervisors, setSupervisors] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const fetched = useRef(false);
    const [dataEdit, setDataEdit] = useState(null);

    const [showUpdate, setShowUpdate] = useState(false);

    const openModalEdit = (payload) => {
        setDataEdit(payload);
        setShowUpdate(true);
    };

    const fetchSupervisors = async () => {
        try {
            const data = await getAllSupervisorApi();
            setSupervisors(data.data);

        } catch (error) {
            toast.error(` Error al crear el supervisor ${error}`);

        }
    };

    const deleteSupervisor = async (payload) => {
        toast(
            () => (
                <div className="flex flex-col space-y-2">
                    <p>¿Estás seguro de eliminar a <strong>{payload.name} {payload.lastname}</strong>?</p>
                    <div className="flex justify-end gap-2">
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
                                    toast.error(`Error al eliminar supervisor ${err}`);
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
            }
        );

    };

    const updateSupervisor = async (payload) => {
        console.log(payload, " aqui edito");
        const id = payload.id;
        try {
            await updateSupervisorApi(payload, id);
            toast.success('Supervisor actualizado exitosamente!');
        } catch (error) {
            toast.error(` Error al crear el supervisor ${error}`);
        }
    }

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        fetchSupervisors();

    }, []);

    const handleCreate = async (newSupervisor) => {
        console.log(newSupervisor);
        try {
            await addsupervidorServiceApi(newSupervisor);
            await fetchSupervisors();
            setShowCreate(false);
            toast.success('Supervisor creado exitosamente!');
        } catch (error) {
            toast.error(` Error al crear el supervisor ${error}`);
            console.error("Error al crear supervisor:", error);
        }
    };

    return (
        <div className="p-4 sm:ml-64 mt-20">
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Mantenimiento de Supervisores</h2>


                    <button
                        onClick={() => setShowCreate(true)}
                        className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                        type="button"
                    >
                        <Icon path={mdiPlus} size={1} />
                        Agregar Supervisor
                    </button>

                </div>

                <Table data={supervisors} onDelete={deleteSupervisor} onEdit={openModalEdit}/>
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
