import React, { useState, useEffect, useCallback, FC } from 'react';
import { User, View, Car, ServiceRecord } from './types';
import { dataService } from './services/dataService';
import { useI18n } from './hooks/useI18n';
import { useToast } from './hooks/useToast';
import { Sidebar } from './components/Sidebar';
import { DashboardScreen } from './components/DashboardScreen';
import { CarProfileScreen } from './components/CarProfileScreen';
import { DiagnosticsScreen } from './components/DiagnosticsScreen';
import { AddServiceModal } from './components/AddServiceModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { CurrencySwitcher } from './components/CurrencySwitcher';

export const App: FC<{ user: User; onLogout: () => void; onProfileUpdate: (data: Partial<User>) => void }> = ({ user, onLogout, onProfileUpdate }) => {
    const [view, setView] = useState<View>('dashboard');
  
    const [car, setCar] = useState<Car | null>(null);
    const [services, setServices] = useState<ServiceRecord[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    const { t } = useI18n();
    const { showToast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        setCar(dataService.getCar(user.username));
        setServices(dataService.getServices(user.username));
        setIsLoading(false);
    }, [user]);

    const saveData = useCallback((updatedCar: Car, updatedServices: ServiceRecord[]) => {
        dataService.saveData(user.username, updatedCar, updatedServices);
    }, [user]);
    
    const handleCarUpdate = (updatedCar: Car) => {
        if(services) {
            setCar(updatedCar);
            saveData(updatedCar, services);
            showToast(t('common.carSavedSuccess'), { type: 'success' });
            setView('dashboard');
        }
    };

    const handleProfileSave = (updatedData: Partial<User>) => {
        const passwordChanged = !!updatedData.password;
        onProfileUpdate(updatedData);
        
        if (passwordChanged) {
            showToast(t('common.passwordChangedSuccess'), { type: 'success' });
        } else {
            showToast(t('common.profileUpdatedSuccess'), { type: 'success' });
        }
    };
    
    const handleOpenEditService = (service: ServiceRecord) => {
        setEditingService(service);
        setIsServiceModalOpen(true);
    }
    
    const handleCloseServiceModal = () => {
        setIsServiceModalOpen(false);
        setEditingService(null);
    }

    const handleSaveService = (serviceData: Omit<ServiceRecord, 'id' | 'date'>, idToUpdate?: string) => {
        if(car && services) {
            let newServices;
            let toastMessage;

            if (idToUpdate) { // Editing existing service
                newServices = services.map(s => s.id === idToUpdate ? { ...s, ...serviceData } : s);
                toastMessage = t('common.serviceUpdatedSuccess');
            } else { // Adding new service
                const newService: ServiceRecord = { ...serviceData, id: new Date().toISOString(), date: new Date().toISOString().split('T')[0] };
                newServices = [...services, newService];
                toastMessage = t('common.serviceAddedSuccess');
            }
            
            const newCar = serviceData.mileage > car.mileage ? { ...car, mileage: serviceData.mileage } : car;

            setServices(newServices);
            setCar(newCar);
            saveData(newCar, newServices);
            showToast(toastMessage, { type: 'success' });
            handleCloseServiceModal();
        }
    };

    if (isLoading || !car || !services) {
        return <div className="loading-spinner-fullpage" title={t('common.loading')}></div>;
    }

    const renderView = () => {
        switch(view) {
            case 'dashboard': return <DashboardScreen car={car} services={services} user={user} onEditService={handleOpenEditService} />;
            case 'car_profile': return <CarProfileScreen car={car} onUpdate={handleCarUpdate} />;
            case 'diagnostics': return <DiagnosticsScreen car={car} />;
            default: return <DashboardScreen car={car} services={services} user={user} onEditService={handleOpenEditService} />;
        }
    };

    return (
        <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar 
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
                currentView={view} 
                onNavigate={setView} 
                user={user} 
                onProfileClick={() => setIsProfileModalOpen(true)}
            />
            <main className="main-content">
                <header className="main-header">
                    <button className="btn btn-primary" onClick={() => setIsServiceModalOpen(true)}>
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
            <AddServiceModal 
                isOpen={isServiceModalOpen} 
                onClose={handleCloseServiceModal} 
                onSave={handleSaveService} 
                car={car}
                serviceToEdit={editingService}
            />
            <ProfileSettingsModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
                onSave={handleProfileSave}
                onLogout={() => { onLogout(); setIsProfileModalOpen(false); }}
            />
        </div>
    );
};