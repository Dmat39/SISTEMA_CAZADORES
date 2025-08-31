import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/dark-theme.css';
import App from './App.jsx';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '@mdi/font/css/materialdesignicons.min.css';

import { store, persistor } from './store'; 
import { ThemeProvider } from './contexts/ThemeContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);