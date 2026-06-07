import {
  LayoutDashboard,
  AlertTriangle,
  ShieldCheck,
  Crosshair,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/store/slices/authSlice';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  end?: boolean;
}

const adminMenus: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/dashboard/admin',            end: true },
  { icon: AlertTriangle,   label: 'Incidencias',  path: '/dashboard/admin/incidencia', end: true },
  { icon: ShieldCheck,     label: 'Supervisores', path: '/dashboard/admin/supervisor', end: true },
  { icon: Crosshair,       label: 'Cazadores',    path: '/dashboard/admin/cazadores',  end: true },
  { icon: ClipboardList,   label: 'Auditoría',    path: '/dashboard/admin/auditoria',  end: true },
];

const visualizerMenus: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/dashboard/visualizer',            end: true },
  { icon: AlertTriangle,   label: 'Incidencias', path: '/dashboard/visualizer/incidencia', end: true },
];

const supervisorMenus: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/dashboard/supervisors',            end: true },
  { icon: AlertTriangle,   label: 'Incidencias', path: '/dashboard/supervisors/incidencia', end: true },
  { icon: Crosshair,       label: 'Cazadores',   path: '/dashboard/supervisors/cazadores',  end: true },
];

const hunterMenus: MenuItem[] = [
  { icon: AlertTriangle, label: 'Incidencia', path: '/dashboard/cazador/incidencia', end: true },
];

export function getMenuForRole(role: UserRole | null): MenuItem[] {
  switch (role) {
    case 'administrator': return adminMenus;
    case 'visualizer':    return visualizerMenus;
    case 'supervisor':    return supervisorMenus;
    case 'hunter':        return hunterMenus;
    default:              return [];
  }
}
