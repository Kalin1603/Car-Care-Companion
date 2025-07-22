import React, { FC } from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeSwitcher: FC<{ className?: string }> = ({ className }) => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            className={`icon-btn theme-switcher-btn ${className || ''}`}
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
        >
            <span className="material-symbols-outlined">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
        </button>
    );
};