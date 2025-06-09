import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = () => {
  return (
    <>
      {/* Sidebar */}
      <Sidebar />
      {/* Contenido principal */}
      <Navbar />
      <main class="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayout;
