import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { PageTitleProvider } from '@/contexts/PageTitleContext';
import { useAppSelector } from '@/store/hooks';
import { getMenuForRole } from '@/config/sidebarMenus';
import AppNavbar from './AppNavbar';
import AppSidebar from './AppSidebar';

function LayoutShell({ items }: { items: ReturnType<typeof getMenuForRole> }) {
  const { isCollapsed } = useSidebar();
  return (
    <>
      <AppSidebar items={items} />
      <AppNavbar />
      <main className={[
        'pt-20 h-screen overflow-y-auto bg-slate-200 dark:bg-[#0a0f1e]',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'sm:ml-[72px]' : 'sm:ml-60',
      ].join(' ')}>
        <Outlet />
      </main>
    </>
  );
}

export default function DashboardLayout() {
  const role = useAppSelector((s) => s.auth.role);
  const items = getMenuForRole(role);

  return (
    <PageTitleProvider>
      <SidebarProvider>
        <LayoutShell items={items} />
      </SidebarProvider>
    </PageTitleProvider>
  );
}
