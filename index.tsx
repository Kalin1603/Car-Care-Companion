import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './src/App';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { I18nProvider } from './src/contexts/I18nContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { AuthScreen } from './src/components/AuthScreen';
import { authService } from './src/services/authService';
import { User } from './src/types';
import { CurrencyProvider } from './src/contexts/CurrencyContext';

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
          <ToastProvider>
            <CurrencyProvider>
              <Root />
            </CurrencyProvider>
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}