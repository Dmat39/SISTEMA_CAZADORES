import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { login as setAuth } from '../../store/slices/authSlice.js';
import { login } from '../../api/auth.jsx';

const useLogin = () => {
 const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await login(credentials);
      const { token, user } = response.data; // ← ✅ CAMBIO AQUÍ

      if (token && user) {
        dispatch(
          setAuth({
            token,
            username: user.username,
            role: user.role,
          })
        );
        return true;
      } else {
        console.error('Login fallido: respuesta inválida', response.data);
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}

export default useLogin;