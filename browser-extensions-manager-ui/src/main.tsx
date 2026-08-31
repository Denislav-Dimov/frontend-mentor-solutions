import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeProvider';
import setInitialTheme from './utilities/setInitialTheme';
import App from './App';
import './styles/index.css';

setInitialTheme();

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
