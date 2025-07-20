import React, { FC } from 'react';
import { ServiceRecord } from '../types';
import { useI18n } from '../hooks/useI18n';
import { currencyService } from '../services/currencyService';
import { useCurrency } from '../hooks/useCurrency';

export const ServiceHistory: FC<{ services: ServiceRecord[] }> = ({ services }) => {
  const { t } = useI18n();
  const { currency } = useCurrency();

  return (
    <section className="card" aria-labelledby="history-title">
      <h2 className="card-title" id="history-title">
        <span className="material-symbols-outlined">history</span>
        {t('serviceHistory.title')}
      </h2>
      <div className="service-history-list">
        {services.length > 0 ? (
          services
            .slice()
            .sort((a, b) => b.mileage - a.mileage)
            .map(service => (
              <article key={service.id} className="service-record">
                <div className="service-record-header">
                    <h3>{service.type}</h3>
                    <span className="service-category">{t(`modals.categoryOptions.${service.category.toLowerCase()}`) || service.category}</span>
                </div>
                <div className="service-record-body">
                  <p><strong>{t('serviceHistory.date')}</strong> {new Date(service.date).toLocaleDateString()}</p>
                  <p><strong>{t('serviceHistory.mileage')}</strong> {service.mileage.toLocaleString()} km</p>
                  <p><strong>{t('serviceHistory.serviceStation')}</strong> {service.serviceStation || t('serviceHistory.notAvailable')}</p>
                  {service.notes && <p className="notes"><strong>{t('serviceHistory.notes')}</strong> {service.notes}</p>}
                </div>
                <div className="service-record-footer">
                  <span className="cost">{currencyService.convertToSelected(service.cost, currency).toFixed(2)} {currencyService.getSymbol(currency)}</span>
                </div>
              </article>
            ))
        ) : (
          <p className="empty-state">{t('serviceHistory.noServices')}</p>
        )}
      </div>
    </section>
  );
};