import React, { FC } from 'react';

export const Logo: FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
    return (
        <div className="logo-container">
            {isCollapsed ? (
                 <svg className="logo-svg-collapsed" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logo-gradient-collapsed" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: 'var(--primary-hover)'}} />
                            <stop offset="100%" style={{stopColor: 'var(--primary)'}} />
                        </linearGradient>
                    </defs>
                    <path d="M50,5 C74.85,5 95,25.15 95,50 C95,74.85 74.85,95 50,95 C25.15,95 5,74.85 5,50 C5,25.15 25.15,5 50,5 Z" fill="url(#logo-gradient-collapsed)"/>
                    <text x="50" y="68" textAnchor="middle" fontSize="50" fontWeight="bold" fill="var(--surface)">S</text>
                </svg>
            ) : (
                <span className="logo-text">Servi<span className="logo-text-x">X</span></span>
            )}
        </div>
    );
};