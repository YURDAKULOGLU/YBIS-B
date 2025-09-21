import React, { createContext, useContext, PropsWithChildren } from 'react';
import { tokens } from './tokens';

interface ThemeContextType {
  tokens: typeof tokens;
}

const ThemeContext = createContext<ThemeContextType>({ tokens });

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ tokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
