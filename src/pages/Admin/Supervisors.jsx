import React, { useEffect, useRef, useState } from 'react';
import Table from "../../components/Admin/TableForm.jsx";
import { getAllSupervisorApi } from '../../api/supervisor/SupervidorService';

const SupervisorsAdmin = () => {
  const [supervisors, setSupervisors] = useState([]);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchSupervisors = async () => {
      try {
        const data = await getAllSupervisorApi();
        setSupervisors(data);
      } catch (error) {
        console.error("Error al obtener los supervisores:", error);
      }
    };

    fetchSupervisors();
  }, []);

  return (
      <div className="p-4 sm:ml-64 mt-20">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Mantenimiento de Supervisores</h2>
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">
              Crear Supervisor
            </button>
          </div>

          <Table data={supervisors} />
        </div>
      </div>
  );
};

export default SupervisorsAdmin;
