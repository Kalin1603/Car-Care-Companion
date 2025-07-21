import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthScreen } from './components/AuthScreen';
import { authService } from './services/authService';
import { User } from './types';

const Root = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    const handleProfileUpdate = (updatedData: Partial<User>) => {
        if (currentUser) {
            const updatedUser = authService.updateUser(currentUser.username, updatedData);
            setCurrentUser(updatedUser);
        }
    };

    if (!currentUser) {
        return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
    }

    return <App user={currentUser} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
};


const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <I18nProvider>
          <CurrencyProvider>
            <ToastProvider>
              <Root />
            </ToastProvider>
          </CurrencyProvider>
        </I18nProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
