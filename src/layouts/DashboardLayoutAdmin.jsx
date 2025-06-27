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
      <main className="flex-1 overflow-y-auto sm:ml-60 pt-20 h-screen">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayoutAdmin;
