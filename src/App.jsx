import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setToken } from '../src/api/config.jsx';
import Router from './routes/Router';

function App() {
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      setToken(token);
    }
  }, [token]);

  return <Router />;
}

export default App;