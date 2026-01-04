
import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
      title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
    >
      {theme === 'light' ? (
        <span className="material-symbols-outlined">dark_mode</span>
      ) : (
        <span className="material-symbols-outlined">light_mode</span>
      )}
    </button>
  );
};

export default ThemeToggle;
