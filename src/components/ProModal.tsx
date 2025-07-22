import React, { FC, useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { currencyService } from '../services/currencyService';
import { useCurrency } from '../hooks/useCurrency';

interface ProModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ProModal: FC<ProModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useI18n();
    const { currency } = useCurrency();
    const [isLoading, setIsLoading] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        name: '',
        number: '',
        expiry: '',
        cvc: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsLoading(false);
            onSuccess();
        }, 2000);
    };

    if (!isOpen) return null;

    const price = parseFloat(t('pro.price').replace(',', '.'));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{t('pro.title')}</h2>
                    <button onClick={onClose} className="modal-close-btn" aria-label={t('modals.close')}>&times;</button>
                </header>
                <div className="modal-body">
                    <div className="pro-modal-content">
                        <div className="pro-modal-info">
                             <h3>
                                <span className="material-symbols-outlined">workspace_premium</span>
                                ServiX PRO
                            </h3>
                            <p>{t('pro.description')}</p>
                            
                             <ul className="pro-feature-list">
                                <li><span className="material-symbols-outlined">check_circle</span> {t('pro.feature1')}</li>
                                <li><span className="material-symbols-outlined">check_circle</span> {t('pro.feature2')}</li>
                                <li><span className="material-symbols-outlined">check_circle</span> {t('pro.feature3')}</li>
                            </ul>
                            
                            <div className="pro-modal-price">
                                {currencyService.format(price, currency)}
                                <span> / {t('pro.oneTimePayment')}</span>
                            </div>
                        </div>

                        <form className="payment-form" onSubmit={handlePaymentSubmit}>
                            <div className="form-group full-width">
                                <label>{t('pro.cardholderName')}</label>
                                <input type="text" name="name" value={cardDetails.name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group full-width">
                                <label>{t('pro.cardNumber')}</label>
                                <input type="text" name="number" placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={handleInputChange} required />
                            </div>
                             <div className="form-grid">
                                <div className="form-group">
                                    <label>{t('pro.expiryDate')}</label>
                                    <input type="text" name="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>{t('pro.cvc')}</label>
                                    <input type="text" name="cvc" placeholder="123" value={cardDetails.cvc} onChange={handleInputChange} required />
                                </div>
                            </div>
                             <button type="submit" className="btn btn-primary btn-block" disabled={isLoading} style={{marginTop: '1rem'}}>
                                {isLoading ? (
                                    <>
                                        <div className="loading-spinner" />
                                        {t('pro.paymentProcessing')}
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">lock</span>
                                        {t('pro.payNow')}
                                    </>
                                )}
                             </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};