import React, { FC, useState } from 'react';
import { ServiceRecord } from '../types';
import { useI18n } from '../hooks/useI18n';
import { currencyService } from '../services/currencyService';
import { useCurrency } from '../hooks/useCurrency';

interface ServiceHistoryProps {
  services: ServiceRecord[];
  onEdit: (service: ServiceRecord) => void;
  onDelete: (serviceId: string) => void;
}

const categoryIcons: Record<string, string> = {
    general: 'miscellaneous_services',
    engine: 'settings',
    brakes: 'disc_full',
    suspension: 'filter_tilt_shift',
    electrical: 'bolt',
    tires: 'tire_repair',
    other: 'build',
};


export const ServiceHistory: FC<ServiceHistoryProps> = ({ services, onEdit, onDelete }) => {
  const { t } = useI18n();
  const { currency } = useCurrency();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (service: ServiceRecord) => {
    if(window.confirm(`${t('modals.deleteConfirmMessage')}: "${service.type}"?`)) {
      setDeletingId(service.id);
      // Let animation play before removing from state
      setTimeout(() => {
        onDelete(service.id);
        setDeletingId(null);
      }, 300);
    }
  };


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
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(service => (
              <article key={service.id} data-category={service.category} className={`timeline-item ${deletingId === service.id ? 'deleting' : ''}`}>
                <div className="timeline-marker">
                    <span className="material-symbols-outlined">{categoryIcons[service.category] || categoryIcons.other}</span>
                </div>
                <div className="timeline-content-card">
                    <div className="timeline-header">
                        <div className="timeline-title">
                            <h3>{service.type}</h3>
                            <p>{new Date(service.date).toLocaleDateString()} &bull; {service.mileage.toLocaleString()} km</p>
                        </div>
                        <div className="service-record-actions">
                            <button onClick={() => onEdit(service)} className="btn-icon" title={t('serviceHistory.edit')}>
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button onClick={() => handleDelete(service)} className="btn-icon delete" title={t('modals.delete')}>
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>

                    <div className="timeline-body">
                         <p><strong>{t('serviceHistory.serviceStation')}</strong> {service.serviceStation || t('serviceHistory.notAvailable')}</p>
                         {service.notes && <p className="notes"><strong>{t('serviceHistory.notes')}</strong> {service.notes}</p>}
                    </div>

                    <div className="timeline-footer">
                        <span className="service-category">{t(`modals.categoryOptions.${service.category.toLowerCase()}`) || service.category}</span>
                        <span className="cost">{currencyService.format(service.cost, currency)}</span>
                    </div>
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