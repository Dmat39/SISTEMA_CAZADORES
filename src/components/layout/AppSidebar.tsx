import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import type { MenuItem } from '@/config/sidebarMenus';

interface AppSidebarProps {
  items: MenuItem[];
}

export default function AppSidebar({ items }: AppSidebarProps) {
  const { isOpen, close, isCollapsed, toggleCollapse } = useSidebar();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 sm:hidden" onClick={close} />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-20 left-0 z-40 w-60 overflow-hidden',
          'h-[calc(100vh-5rem)] flex flex-col',
          'bg-[#fdfbf5] dark:bg-[#0f172a]',
          'border-r border-[#e8dfc8] dark:border-white/10 shadow-sm',
          'transition-all duration-300 ease-in-out',
          // Mobile: controlled by isOpen
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible; width shrinks to icon-rail when collapsed
          isCollapsed ? 'sm:w-[72px] sm:translate-x-0' : 'sm:w-60 sm:translate-x-0',
        ].join(' ')}
      >
        {/* ── Nav ─────────────────────────────────────────────── */}
        <nav className="shrink-0 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-1">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold text-[#7a6a52] dark:text-gray-400 uppercase tracking-widest">
              Navegación
            </p>
          )}
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={close}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center h-11 rounded-xl text-sm font-medium transition-all duration-200 select-none',
                  isCollapsed ? 'justify-center px-0' : 'gap-3 px-4',
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'text-[#7a6a52] dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/8 hover:text-orange-600 dark:hover:text-white',
                ].join(' ')
              }
            >
              <item.icon className="h-5 w-5 shrink-0 flex-none" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="shrink-0 px-3 pb-4 border-t border-[#e8dfc8] dark:border-white/10 pt-3">
          {!isCollapsed && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-medium text-[#a89878] dark:text-gray-400">Sistema en línea</span>
                </div>
                <span className="text-[10px] font-semibold text-[#a89878] dark:text-gray-500">v1.0</span>
              </div>
              <div className="h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-300 opacity-70 mb-3" />
            </>
          )}
          {/* Collapse / expand button (desktop only) */}
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expandir panel' : 'Ocultar panel'}
            className="hidden sm:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#a89878] dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/8 hover:text-orange-600 dark:hover:text-white transition-all"
          >
            {isCollapsed
              ? <ChevronRight className="h-4 w-4" />
              : <><ChevronLeft className="h-4 w-4" /><span>Ocultar panel</span></>
            }
          </button>
        </div>
      </aside>
    </>
  );
}
