import React, { FC } from 'react';
import { User, View } from '../types';
import { useI18n } from '../hooks/useI18n';
import { subscriptionService } from '../services/subscriptionService';
import { Logo } from './Logo';

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    currentView: View;
    onNavigate: (view: View) => void;
    user: User;
    onProfileClick: () => void;
    onSubscriptionClick: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ isCollapsed, toggleCollapse, currentView, onNavigate, user, onProfileClick, onSubscriptionClick }) => {
    const { t } = useI18n();

    const navItems: { id: View, name: string, icon: string, pro?: boolean }[] = [
        { id: 'dashboard', name: t('sidebar.dashboard'), icon: 'dashboard' },
        { id: 'car_profile', name: t('sidebar.carProfile'), icon: 'directions_car' },
        { id: 'diagnostics', name: t('sidebar.diagnostics'), icon: 'build_circle', pro: true },
    ];

    const hasProAccess = subscriptionService.hasFeatureAccess(user, 'ai_diagnostics');
    const currentTier = user.subscriptionTier || 'basic';

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div>
                <div className="sidebar-header">
                    <Logo isCollapsed={isCollapsed} />
                    <button className="sidebar-toggle-btn" onClick={toggleCollapse} title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}>
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button 
                            key={item.id} 
                            title={isCollapsed ? item.name : ''} 
                            className={`sidebar-nav-item ${currentView === item.id ? 'active' : ''} ${item.pro && !hasProAccess ? 'disabled' : ''}`} 
                            onClick={() => {
                                if (item.pro && !hasProAccess) {
                                    onSubscriptionClick();
                                } else {
                                    onNavigate(item.id);
                                }
                            }}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            {!isCollapsed && <span className="nav-item-text">{item.name}</span>}
                            {!isCollapsed && item.pro && !hasProAccess && <span className="pro-badge">{t('common.pro')}</span>}
                        </button>
                    ))}
                    
                    <button 
                        className="sidebar-nav-item subscription-item"
                        onClick={onSubscriptionClick}
                        title={isCollapsed ? 'Subscription' : ''}
                    >
                        <span className="material-symbols-outlined">workspace_premium</span>
                        {!isCollapsed && (
                            <div className="subscription-info">
                                <span className="nav-item-text">Subscription</span>
                                <span className="subscription-tier">{currentTier.toUpperCase()}</span>
                            </div>
                        )}
                    </button>
                </nav>
            </div>

            <div className="sidebar-footer">
                 <button className="sidebar-nav-item user-profile-button" onClick={onProfileClick}>
                    <div className="user-avatar">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.fullName} />
                        ) : (
                            user.username.charAt(0).toUpperCase()
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="user-details">
                            <span className="user-greeting">{user.fullName || user.username}</span>
                            <span className="user-action">{t('sidebar.profileSettings')}</span>
                        </div>
                    )}
                 </button>
            </div>
        </aside>
    );
};