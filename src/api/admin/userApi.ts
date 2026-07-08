import { mainApi } from "../config";

export type UserRole = 'administrator' | 'supervisor' | 'hunter' | 'validator' | 'visualizer';

// Solo administrador puede cambiar el rol de un usuario (hunter/supervisor comparten la misma tabla User)
export const changeUserRoleApi = async (id: string, role: UserRole) => {
  try {
    const response = await mainApi.patch(`/user/${id}/role`, { role });
    return response.data;
  } catch (error: any) {
    console.error("Error changing user role:", error);
    throw error.response ? error.response.data : new Error('Failed to change user role');
  }
}
