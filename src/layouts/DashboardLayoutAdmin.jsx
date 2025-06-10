import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/Admin/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayoutAdmin = () => {
  return (
    <>
      {/* Sidebar */}
      <SidebarAdmin />
      {/* Contenido principal */}
      <Navbar />
      <main class="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayoutAdmin;
