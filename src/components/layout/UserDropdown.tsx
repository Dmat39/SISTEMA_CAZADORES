import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import type { UserRole } from '@/store/slices/authSlice';

function displayRole(role: UserRole | null | undefined): string {
  if (role === 'operator' || role === 'hunter') return 'Cazador';
  if (role === 'administrator') return 'Administrador';
  if (role === 'visualizer') return 'Visualizador';
  if (role === 'supervisor') return 'Supervisor';
  return 'Usuario';
}

function getInitials(username: string | null | undefined): string {
  if (!username) return 'U';
  const parts = username.trim().split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

export default function UserDropdown() {
  const dispatch = useAppDispatch();
  const { username, role } = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#f7f0e0] dark:hover:bg-white/10 transition-colors focus:outline-none">
        {/* Orange avatar with initials */}
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
          {getInitials(username)}
        </div>

        {/* Name + role — desktop only */}
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold text-[#3d2f1f] dark:text-white">
            {username || 'Usuario'}
          </span>
          <span className="text-xs text-orange-500 dark:text-orange-400 font-medium">
            {displayRole(role)}
          </span>
        </div>

        <ChevronDown className="h-3.5 w-3.5 text-[#a89878] dark:text-gray-400 hidden sm:block" />
      </MenuButton>

      <MenuItems
        transition
        anchor="bottom end"
        className="z-[60] mt-2 w-52 rounded-2xl bg-[#fdfbf5] dark:bg-[#0f172a] border border-[#e8dfc8] dark:border-white/10 shadow-xl shadow-black/10 dark:shadow-black/40 transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#e8dfc8] dark:border-white/10">
          <p className="text-sm font-semibold text-[#3d2f1f] dark:text-white">
            {username || 'Usuario'}
          </p>
          <p className="text-xs text-orange-500 dark:text-orange-400 font-medium mt-0.5">
            {displayRole(role)}
          </p>
        </div>

        {/* Logout */}
        <div className="p-1.5">
          <MenuItem>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#7a6a52] dark:text-gray-300 data-[focus]:bg-orange-50 dark:data-[focus]:bg-white/10 data-[focus]:text-orange-600 dark:data-[focus]:text-white transition-colors"
            >
              <LogOut className="h-4 w-4 text-orange-500 shrink-0" />
              Cerrar Sesión
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
