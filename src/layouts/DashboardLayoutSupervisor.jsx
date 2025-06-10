import { Outlet } from "react-router-dom";
import SidebarSupervisor from "../components/Supervisors/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayoutSupervisor = () => {
  return (
    <>
      {/* Sidebar */}
      <SidebarSupervisor />
      {/* Contenido principal */}
      <Navbar />
      <main class="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayoutSupervisor;
