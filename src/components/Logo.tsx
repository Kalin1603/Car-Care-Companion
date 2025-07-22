import React, { FC } from 'react';

export const Logo: FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
    return (
        <div className="logo-container">
            <span className="material-symbols-outlined logo-icon">directions_car</span>
            {!isCollapsed && <span className="logo-text">Auto Logbook</span>}
        </div>
    );
};