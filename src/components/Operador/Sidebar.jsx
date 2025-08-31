import { useNavigate } from "react-router-dom";
import {  FaUserGroup } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";

const SidebarOperador = () => {
  const navigate = useNavigate();

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
          {/* <li>
            <button type="button" onClick={() => handleNavigation("/dashboard/operador")} className="cursor-pointer flex items-center p-2 text-gray-900 rounded-md dark:text-white hover:bg-[#32A3B5] group transition-all ease-in-out duration-300 w-full">
              <MdDashboard className="w-5 h-5 text-gray-400 group-hover:text-white"/>
              <span className="ms-3 text-[#737791] group-hover:text-white">Dashboard</span>
            </button>
          </li> */}
          <li>
            <button type="button" onClick={() => handleNavigation("/dashboard/operador/incidencia")} className="cursor-pointer flex items-center p-2 text-gray-900 dark:text-white rounded-md hover:bg-[#32A3B5] dark:hover:bg-orange-600 group transition-all ease-in-out duration-300 w-full">
              <FaUserGroup className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover:text-white"/>
              <span className="ms-3 text-[#737791] dark:text-gray-300 group-hover:text-white">Incidencia</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default SidebarOperador;
