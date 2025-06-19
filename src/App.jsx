import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setToken } from '../src/api/config.jsx';
import Router from './routes/Router';
import { Toaster } from 'sonner';
import ToastPortal from './components/ToastPortal.jsx';

function App() {
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      setToken(token);
    }
  }, [token]);

  return(
      <>
        <Router />;
        <ToastPortal />
      </>
     )

}

export default App;