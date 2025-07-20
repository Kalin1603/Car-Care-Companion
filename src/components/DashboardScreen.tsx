import React, { FC } from 'react';
import { Car, ServiceRecord, User } from '../types';
import { useI18n } from '../hooks/useI18n';
import { ServiceHistory } from './ServiceHistory';
import { currencyService } from '../services/currencyService';
import { useCurrency } from '../hooks/useCurrency';

interface DashboardScreenProps {
    car: Car;
    services: ServiceRecord[];
    user: User;
}

export const DashboardScreen: FC<DashboardScreenProps> = ({ car, services, user }) => {
    const { t } = useI18n();
    const { currency } = useCurrency();

    const totalSpentBase = services.reduce((acc, s) => acc + s.cost, 0);
    const totalSpentSelected = currencyService.convertToSelected(totalSpentBase, currency);
    
    return (
        <div className="screen-content">
            <h1>{t('dashboard.welcome', { name: user.fullName.split(' ')[0] || user.username })}</h1>
            <div className="dashboard-grid">
                 <div className="card car-summary-card">
                     <h2 className="card-title">{car.make || t('dashboard.yourCar')} {car.model || ''}</h2>
                     <p><strong>{t('dashboard.mileage')}:</strong> {car.mileage.toLocaleString()} km</p>
                     <p><strong>{t('dashboard.year')}:</strong> {car.year}</p>
                     <p><strong>{t('dashboard.vin')}:</strong> {car.vin || t('dashboard.noVin')}</p>
                 </div>
                 <div className="card stats-card">
                    <h2 className="card-title">{t('dashboard.statistics')}</h2>
                    <div className="stats-content">
                        <div>
                            <span className="stat-value">{services.length}</span>
                            <span className="stat-label">{t('dashboard.totalServices')}</span>
                        </div>
                        <div>
                            <span className="stat-value">{totalSpentSelected.toFixed(2)} {currencyService.getSymbol(currency)}</span>
                            <span className="stat-label">{t('dashboard.totalSpent')}</span>
                        </div>
                    </div>
                 </div>
            </div>
           
            <ServiceHistory services={services} />
        </div>
    );
};