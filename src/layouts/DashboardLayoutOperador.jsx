import { Outlet } from "react-router-dom";
import SidebarOperador from "../components/Operador/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayoutOperador = () => {
  return (
    <>
      {/* Sidebar */}
      <SidebarOperador />
      {/* Contenido principal */}
      <Navbar />
      <main class="flex-1 overflow-y-auto sm:ml-60 pt-20">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayoutOperador;
