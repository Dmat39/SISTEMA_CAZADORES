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
      {/* <main className="flex-1 overflow-y-auto m-10"> */}
      <main className="flex-1 overflow-y-auto sm:ml-60 pt-20 h-screen">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayoutSupervisor;
