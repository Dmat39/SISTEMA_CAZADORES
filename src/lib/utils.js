import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Permissions helpers
export const isRole = (role, target) => (role?.toLowerCase?.() || '') === target;
export const isVisualizer = (role) => isRole(role, 'visualizer');
