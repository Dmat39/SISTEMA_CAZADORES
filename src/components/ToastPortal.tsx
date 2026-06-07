import { createPortal } from 'react-dom';
import { Toaster } from 'sonner';

const ToastPortal = () => {
  const toastRoot = document.getElementById('toast-root');

  if (!toastRoot) return null;

  return createPortal(
    <Toaster richColors position="top-right" />,
    toastRoot
  );
};

export default ToastPortal;
