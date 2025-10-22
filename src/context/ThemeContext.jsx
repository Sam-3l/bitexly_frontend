import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('bitexly-theme');
    if (savedTheme === 'light') return false;
    if (savedTheme === 'dark') return true;
    return false; // default to light
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bitexly-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bitexly-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Backward-compatible context value
  const value = {
    isDark,
    toggleTheme,
    // backward compatibility for components expecting a "theme" string
    theme: isDark ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
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

export default ThemeContext;
