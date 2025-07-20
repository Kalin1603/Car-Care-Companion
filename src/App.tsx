import React, { useState, useEffect, useCallback, FC } from 'react';
import { User, View, Car, ServiceRecord } from './types';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import { useI18n } from './hooks/useI18n';

import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { DashboardScreen } from './components/DashboardScreen';
import { CarProfileScreen } from './components/CarProfileScreen';
import { DiagnosticsScreen } from './components/DiagnosticsScreen';
import { AddServiceModal } from './components/AddServiceModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { CurrencySwitcher } from './components/CurrencySwitcher';

export const App: FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [view, setView] = useState<View>('dashboard');
  
  const [car, setCar] = useState<Car | null>(null);
  const [services, setServices] = useState<ServiceRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const { t } = useI18n();

  useEffect(() => {
    if (currentUser) {
        setIsLoading(true);
        setCar(dataService.getCar(currentUser.username));
        setServices(dataService.getServices(currentUser.username));
        setIsLoading(false);
    } else {
        setCar(null);
        setServices(null);
        setIsLoading(false);
    }
  }, [currentUser]);

  const saveData = useCallback((updatedCar: Car, updatedServices: ServiceRecord[]) => {
      if(currentUser) {
        dataService.saveData(currentUser.username, updatedCar, updatedServices);
      }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => setCurrentUser(user);
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsProfileModalOpen(false);
  };
  
  const handleCarUpdate = (updatedCar: Car) => {
      if(services) {
          setCar(updatedCar);
          saveData(updatedCar, services);
      }
  };

  const handleProfileUpdate = (updatedData: Partial<User>) => {
    if (currentUser) {
        const updatedUser = authService.updateUser(currentUser.username, updatedData);
        setCurrentUser(updatedUser);
    }
  };

  const handleAddService = (serviceData: Omit<ServiceRecord, 'id' | 'date'>) => {
      if(car && services) {
        const newService: ServiceRecord = { ...serviceData, id: new Date().toISOString(), date: new Date().toISOString().split('T')[0] };
        const newServices = [...services, newService];
        const newCar = serviceData.mileage > car.mileage ? { ...car, mileage: serviceData.mileage } : car;

        setServices(newServices);
        setCar(newCar);
        saveData(newCar, newServices);
      }
  };

  if (isLoading) return <div className="loading-spinner-fullpage" title={t('common.loading')}></div>;
  if (!currentUser) return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  if (!car || !services) return <div className="loading-spinner-fullpage" title={t('common.loading')}></div>;

  const renderView = () => {
    switch(view) {
        case 'dashboard': return <DashboardScreen car={car} services={services} user={currentUser} />;
        case 'car_profile': return <CarProfileScreen car={car} onUpdate={handleCarUpdate} />;
        case 'diagnostics': return <DiagnosticsScreen car={car} />;
        default: return <DashboardScreen car={car} services={services} user={currentUser} />;
    }
  };

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar 
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
            currentView={view} 
            onNavigate={setView} 
            user={currentUser} 
            onProfileClick={() => setIsProfileModalOpen(true)}
        />
        <main className="main-content">
            <header className="main-header">
                <button className="btn btn-primary" onClick={() => setIsAddServiceModalOpen(true)}>
                    <span className="material-symbols-outlined">add</span>
                    {t('header.addService')}
                </button>
                <CurrencySwitcher />
                <ThemeSwitcher />
            </header>
            <div className="content-wrapper" key={view}>
                {renderView()}
            </div>
        </main>
        <AddServiceModal isOpen={isAddServiceModalOpen} onClose={() => setIsAddServiceModalOpen(false)} onSave={handleAddService} car={car} />
        <ProfileSettingsModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={currentUser}
            onSave={handleProfileUpdate}
            onLogout={handleLogout}
        />
    </div>
  );
};