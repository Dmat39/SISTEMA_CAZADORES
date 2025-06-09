import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div class="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 class="text-7xl font-bold text-red-600 mb-4">404</h1>
      <p class="text-xl text-gray-700 mb-2">Página no encontrada</p>
      <p class="text-gray-500 mb-6">Serás redirigido al mapa en breve...</p>
      <button
        onClick={() => navigate('/dashboard')}
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Ir ahora
      </button>
    </div>
  );
};

export default NotFoundPage;
