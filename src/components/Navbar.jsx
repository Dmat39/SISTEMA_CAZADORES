import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from "react-router-dom";
import ThemeToggle from './UI/ThemeToggle';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const dispatch = useDispatch();

  const { username, role } = useSelector((state) => state.auth || {});

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    window.location.reload();
  };

  const handleConfiguration = () => {
    const normalizedRole = role?.toLowerCase();
    if (normalizedRole === 'operator' || normalizedRole === 'hunter') {
      navigate("/dashboard/operador/incidencia/configuracion")
    } else {
      navigate("/dashboard/supervisors/incidencia/configuracion")
    }

  }

  return (
    <nav className="fixed top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <button
              data-drawer-target="logo-sidebar"
              data-drawer-toggle="logo-sidebar"
              aria-controls="logo-sidebar"
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-500 dark:text-gray-400 rounded-lg sm:hidden hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 transition-colors duration-200"
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                ></path>
              </svg>
            </button>
            <a href="#" className="flex ms-2 md:me-24">
              <img
                src="/logo-muni.png"
                className="w-52 h-14 object-contain"
                alt="Logo San Juan de Lurigancho"
              />
            </a>
          </div>
          <div className="flex flex-row items-center justify-center mr-3 space-x-4">
            <div className='flex flex-row items-center space-x-4'>

               {/* Theme Toggle */}
               <ThemeToggle />
               
              <div className='flex flex-col items-center'>
                <span className='text-[18px] text-gray-900 dark:text-white font-medium transition-colors duration-200'>{username || "Usuario"}</span>
                <span className='text-[13px] text-gray-500 dark:text-gray-400 font-medium transition-colors duration-200'>{
                  role?.toLowerCase() === 'operator' || role?.toLowerCase() === 'cazador' 
                    ? 'operador' 
                    : role || 'Desconocido'
                }</span>
              </div>
              
              <button
                type='button'
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                className='cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 rounded-full transition-all duration-200'
              >
                <img
                  className="w-10 h-10 rounded-full"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                  alt="user photo"
                />
              </button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  list: {
                    'aria-labelledby': 'basic-button',
                  },
                }}
                PaperProps={{
                  className: 'dark:bg-gray-800 dark:text-white'
                }}
              >
                {/* {(
                  <MenuItem 
                    onClick={handleConfiguration}
                    className="dark:hover:bg-gray-700 dark:text-white"
                  >
                    Configuración
                  </MenuItem>
                )} */}
                <MenuItem 
                  onClick={handleLogout}
                  className="dark:hover:bg-gray-700 dark:text-white"
                >
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
