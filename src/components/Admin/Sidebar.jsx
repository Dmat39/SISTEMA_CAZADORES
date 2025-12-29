import { NavLink, useNavigate } from "react-router-dom";
import {  FaUserGroup } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import { MdSupervisorAccount } from "react-icons/md";
import { MdEngineering } from "react-icons/md";
import { MdReportProblem } from "react-icons/md";
import { MdTrackChanges } from "react-icons/md";
import { useSelector } from "react-redux";

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  const normalizedRole = role?.toLowerCase();
  const isVisualizer = normalizedRole === 'visualizer';
  const basePath = isVisualizer ? '/dashboard/visualizer' : '/dashboard/admin';

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside
      id="logo-sidebar"
      className="fixed top-0 left-0 z-40 w-60 h-screen pt-20 transition-transform -translate-x-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 sm:translate-x-0 transition-colors duration-200"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 pb-4 overflow-y-auto bg-white dark:bg-gray-800 transition-colors duration-200">
        <ul className="space-y-3 font-medium">
          <li>
          <NavLink to={basePath} end className="flex items-center p-2 text-gray-900 dark:text-white rounded-md hover:bg-[#32A3B5] dark:hover:bg-orange-600 group transition-all ease-in-out duration-300">
              <MdDashboard className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover:text-white"/>
              <span className="ms-3 text-[#737791] dark:text-gray-300 group-hover:text-white">Dashboard</span>
            </NavLink>
          </li>
          <li>
          <NavLink to={`${basePath}/incidencia`} end className="flex items-center p-2 text-gray-900 dark:text-white rounded-md hover:bg-[#32A3B5] dark:hover:bg-orange-600 group transition-all ease-in-out duration-300">
              <MdReportProblem className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover:text-white"/>
              <span className="ms-3 text-[#737791] dark:text-gray-300 group-hover:text-white">Incidencias</span>
            </NavLink>
          </li>
          {!isVisualizer && (
            <>
              <li>
                <NavLink to="/dashboard/admin/supervisor" end className="flex items-center p-2 text-gray-900 dark:text-white rounded-md hover:bg-[#32A3B5] dark:hover:bg-orange-600 group transition-all ease-in-out duration-300">
                  <MdSupervisorAccount className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover:text-white"/>
                  <span className="ms-3 text-[#737791] dark:text-gray-300 group-hover:text-white">Supervisores</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/admin/operadores" end className="flex items-center p-2 text-gray-900 dark:text-white rounded-md hover:bg-[#32A3B5] dark:hover:bg-orange-600 group transition-all ease-in-out duration-300">
                  <MdEngineering className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover:text-white"/>
                  <span className="ms-3 text-[#737791] dark:text-gray-300 group-hover:text-white">Operadores</span>
                </NavLink>
              </li>
            </>
          )}

          {/* Nuevo botón de Cazadores */}
          {!isVisualizer && (
            <li>
              <NavLink to="/dashboard/admin/cazadores" end className="flex items-center p-2 text-gray-900 dark:text-white rounded-md hover:bg-[#32A3B5] dark:hover:bg-orange-600 group transition-all ease-in-out duration-300">
                <MdTrackChanges className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover:text-white"/>
                <span className="ms-3 text-[#737791] dark:text-gray-300 group-hover:text-white">Cazadores</span>
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
