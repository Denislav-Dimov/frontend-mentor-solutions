import { createContext } from 'react';
import type { ThemeContextType } from './ThemeProvider';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default ThemeContext;
