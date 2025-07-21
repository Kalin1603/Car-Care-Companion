import React, { FC, useState, useEffect, useCallback } from 'react';
import { Car, ServiceRecord, AIAdviceResponse } from '../types';
import { apiService } from '../services/apiService';
import { useI18n } from '../hooks/useI18n';
import { currencyService } from '../services/currencyService';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '../hooks/useToast';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Omit<ServiceRecord, 'id' | 'date'>, idToUpdate?: string) => void;
    car: Car;
    serviceToEdit: ServiceRecord | null;
}

export const AddServiceModal: FC<ServiceModalProps> = ({ isOpen, onClose, onSave, car, serviceToEdit }) => {
  const { t, language } = useI18n();
  const { currency } = useCurrency();
  const { showToast } = useToast();
  
  const isEditing = !!serviceToEdit;

  const [type, setType] = useState('');
  const [mileage, setMileage] = useState(car.mileage);
  const [cost, setCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('general');
  const [serviceStation, setServiceStation] = useState('');
  
  const [aiResponse, setAiResponse] = useState<AIAdviceResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setType(serviceToEdit?.type || '');
    setMileage(serviceToEdit?.mileage || car.mileage);
    setCost(serviceToEdit ? currencyService.convertToSelected(serviceToEdit.cost, currency) : 0);
    setNotes(serviceToEdit?.notes || '');
    setCategory(serviceToEdit?.category || 'general');
    setServiceStation(serviceToEdit?.serviceStation || '');
    setAiResponse(null);
    setIsLoadingAI(false);
    setErrorAI(null);
  }, [serviceToEdit, car.mileage, currency]);

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const handleSave = () => {
    if (!type.trim() || mileage <= 0 || cost < 0) {
      showToast(t('modals.errorFillFields'), { type: 'error' });
      return;
    }
    const costInBaseCurrency = currencyService.convertToBase(cost, currency);
    onSave({ type, mileage, cost: costInBaseCurrency, notes, category, serviceStation }, serviceToEdit?.id);
  };

  const getAIAdvice = useCallback(async () => {
    if (!type) {
        setErrorAI(t('modals.errorAINoServiceType'));
        return;
    }
    setIsLoadingAI(true); setErrorAI(null); setAiResponse(null);
    try {
        const data = await apiService.getAIAdvice(car, type, language, currency);
        setAiResponse(data);
    } catch (e: any) {
        setErrorAI(e.message || t('modals.errorAIGeneric'));
    } finally {
        setIsLoadingAI(false);
    }
  }, [type, car, language, currency, t]);

  if (!isOpen) return null;
  
  const categoryOptions = ['general', 'engine', 'brakes', 'suspension', 'electrical', 'tires', 'other'];
  
  const modalTitle = isEditing ? t('modals.editServiceTitle') : t('modals.addServiceTitle');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{modalTitle}</h2>
          <button onClick={onClose} className="modal-close-btn" aria-label={t('modals.close')}>&times;</button>
        </header>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
                <label>{t('modals.serviceType')}</label>
                <input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder={t('modals.serviceTypePlaceholder')} />
            </div>
            <div className="form-group">
                <label>{t('modals.category')}</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                    {categoryOptions.map(cat => <option key={cat} value={cat}>{t(`modals.categoryOptions.${cat}`)}</option>)}
                </select>
            </div>
            <div className="form-group"><label>{t('modals.mileage')}</label><input type="number" value={mileage} onChange={(e) => setMileage(Number(e.target.value))} /></div>
            <div className="form-group"><label>{t('modals.cost')} ({currencyService.getSymbol(currency)})</label><input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></div>
            <div className="form-group full-width"><label>{t('modals.serviceStation')}</label><input type="text" value={serviceStation} onChange={(e) => setServiceStation(e.target.value)} placeholder={t('modals.serviceStationPlaceholder')} /></div>
            <div className="form-group full-width"><label>{t('modals.notes')}</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('modals.notesPlaceholder')}></textarea></div>
          </div>
          {apiService.isAvailable() && <button className="btn btn-secondary ai-btn" onClick={getAIAdvice} disabled={isLoadingAI}>
              {isLoadingAI ? <div className="loading-spinner" /> : (<><span className="material-symbols-outlined">auto_awesome</span>{t('modals.getAIAdvice')}</>)}
          </button>}
          {errorAI && <p className="ai-error">{errorAI}</p>}
          {aiResponse && (
            <div className="ai-assistant"><h3 className="ai-assistant-header"><span className="material-symbols-outlined">auto_awesome</span>{t('modals.aiAssistant')}</h3>
                <div className="ai-assistant-content">
                    <p><strong>{t('modals.aiEstimatedCost')}</strong> {aiResponse.estimatedCost}</p>
                    <p><strong>{t('modals.aiNextService')}</strong> {aiResponse.nextServiceSuggestion}</p>
                    {aiResponse.additionalTips?.length > 0 && (<>
                         <p><strong>{t('modals.aiTips')}</strong></p>
                         <ul>{aiResponse.additionalTips.map((tip, i) => <li key={i}>{tip}</li>)}</ul></>)}
                </div>
            </div>
          )}
        </div>
        <footer className="modal-actions">
          <div className="right-actions">
            <button className="btn btn-secondary" onClick={onClose}>{t('modals.cancel')}</button>
            <button className="btn btn-primary" onClick={handleSave}>{t('modals.save')}</button>
          </div>
        </footer>
      </div>
    </div>
  );
};
