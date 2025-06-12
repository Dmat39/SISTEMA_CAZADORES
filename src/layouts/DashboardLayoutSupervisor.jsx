import { Outlet } from "react-router-dom";
import SidebarSupervisor from "../components/Supervisors/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayoutSupervisor = () => {
  return (
    <>
      {/* Sidebar */}
      {/* <SidebarSupervisor /> */}
      {/* Contenido principal */}
      <Navbar />
      {/* <main className="flex-1 overflow-y-auto m-10"> */}
      <main className="pt-16 h-100 overflow-y-auto">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayoutSupervisor;
