import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import ThemeToggle from '@/components/UI/ThemeToggle';
import UserDropdown from './UserDropdown';
import { useSidebar } from '@/contexts/SidebarContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePageTitle } from '@/contexts/PageTitleContext';
import logoLight from '@/assets/logo_sjl.png';
import logoDark from '@/assets/logo_sjl_dark.png';

function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const date = now.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="hidden md:flex flex-col items-center select-none translate-y-0.5">
      <span className="text-base font-extrabold tabular-nums text-gray-800 dark:text-white leading-none tracking-tight">
        {h}:{m}
      </span>
      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 mt-0.5 capitalize">
        {date}
      </span>
    </div>
  );
}

export default function AppNavbar() {
  const { toggle } = useSidebar();
  const { isDark } = useTheme();
  const { title, subtitle, live } = usePageTitle();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center border-b border-gray-300 dark:border-white/10 shadow-sm transition-colors duration-200">

      {/* ── Logo (desktop) ── */}
      <div className="hidden sm:flex items-center justify-center w-60 h-full shrink-0 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-white/10">
        <img
          src={isDark ? logoDark : logoLight}
          alt="San Juan de Lurigancho"
          style={{ height: 76, width: 'auto', maxWidth: 230, objectFit: 'contain' }}
        />
      </div>

      {/* ── Navbar body ── */}
      <div className="flex flex-1 items-center px-4 gap-3 bg-white/90 dark:bg-[#0a0f1e]/90 backdrop-blur-xl h-full">

        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={toggle}
          className="sm:hidden rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title */}
        {title && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="h-7 w-px bg-gray-200 dark:bg-white/10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none tracking-tight">
                  {title}
                </span>
                {live && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      En vivo
                    </span>
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-none">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 flex items-center justify-center">
          <LiveClock />
        </div>

        {/* Right: toggle + separator + user */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="h-6 w-px bg-gray-200 dark:bg-white/15" />
          <UserDropdown />
        </div>
      </div>
    </nav>
  );
}
