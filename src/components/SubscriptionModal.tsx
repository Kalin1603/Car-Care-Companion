import React, { FC, useState, useEffect } from 'react';
import { User, SubscriptionPlan, SubscriptionTier } from '../types';
import { subscriptionService } from '../services/subscriptionService';
import { useI18n } from '../hooks/useI18n';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '../hooks/useToast';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSubscriptionUpdate: (updatedUser: User) => void;
}

export const SubscriptionModal: FC<SubscriptionModalProps> = ({ 
    isOpen, 
    onClose, 
    user, 
    onSubscriptionUpdate 
}) => {
    const { t } = useI18n();
    const { currency } = useCurrency();
    const { showToast } = useToast();
    
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'plans' | 'payment' | 'processing'>('plans');
    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        name: '',
        email: user.email,
        address: user.address || ''
    });

    const plans = subscriptionService.getPlans(currency);
    const currentTier = user.subscriptionTier || 'basic';

    useEffect(() => {
        if (isOpen) {
            setPaymentStep('plans');
            setSelectedPlan(null);
            setPaymentData(prev => ({ ...prev, email: user.email, address: user.address || '' }));
        }
    }, [isOpen, user]);

    const handlePlanSelect = (planId: SubscriptionTier) => {
        if (planId === 'basic') {
            handleDowngrade();
            return;
        }
        setSelectedPlan(planId);
        setPaymentStep('payment');
    };

    const handleDowngrade = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const updatedUser = subscriptionService.cancelSubscription(user);
            onSubscriptionUpdate(updatedUser);
            showToast('Subscription canceled successfully', { type: 'success' });
            onClose();
        } catch (error) {
            showToast('Failed to cancel subscription', { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlan) return;

        setIsLoading(true);
        setPaymentStep('processing');

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Simulate payment success
            const updatedUser = subscriptionService.upgradeSubscription(user, selectedPlan);
            onSubscriptionUpdate(updatedUser);
            
            showToast(`Successfully upgraded to ${selectedPlan.toUpperCase()} plan!`, { type: 'success' });
            onClose();
        } catch (error) {
            showToast('Payment failed. Please try again.', { type: 'error' });
            setPaymentStep('payment');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({ ...prev, [name]: value }));
    };

    const formatCardNumber = (value: string) => {
        return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    };

    const renderPlansStep = () => (
        <div className="subscription-plans">
            <div className="plans-header">
                <h3>Choose Your Plan</h3>
                <p>Unlock premium features and get the most out of ServiX</p>
            </div>
            
            <div className="plans-grid">
                {plans.map(plan => (
                    <div 
                        key={plan.id} 
                        className={`plan-card ${plan.popular ? 'popular' : ''} ${currentTier === plan.id ? 'current' : ''}`}
                    >
                        {plan.popular && <div className="plan-badge">Most Popular</div>}
                        {currentTier === plan.id && <div className="plan-badge current">Current Plan</div>}
                        
                        <div className="plan-header">
                            <h4>{plan.name}</h4>
                            <div className="plan-price">
                                {plan.price === 0 ? (
                                    <span className="price-free">Free</span>
                                ) : (
                                    <>
                                        <span className="price-amount">${plan.price}</span>
                                        <span className="price-period">/{plan.interval}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="plan-features">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-block`}
                            onClick={() => handlePlanSelect(plan.id)}
                            disabled={isLoading || currentTier === plan.id}
                        >
                            {currentTier === plan.id ? 'Current Plan' : 
                             plan.id === 'basic' ? 'Downgrade' : 
                             currentTier === 'basic' ? 'Upgrade' : 'Switch Plan'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPaymentStep = () => {
        const selectedPlanData = plans.find(p => p.id === selectedPlan);
        if (!selectedPlanData) return null;

        return (
            <div className="payment-form">
                <div className="payment-header">
                    <button className="back-btn" onClick={() => setPaymentStep('plans')}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h3>Payment Details</h3>
                        <p>Upgrading to {selectedPlanData.name} - ${selectedPlanData.price}/{selectedPlanData.interval}</p>
                    </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="payment-form-content">
                    <div className="form-section">
                        <h4>Card Information</h4>
                        <div className="form-group">
                            <label>Card Number</label>
                            <div className="input-wrapper">
                                <span className="material-symbols-outlined input-icon">credit_card</span>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formatCardNumber(paymentData.cardNumber)}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value.replace(/\s/g, '') }))}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Expiry Month</label>
                                <select
                                    name="expiryMonth"
                                    value={paymentData.expiryMonth}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">MM</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                            {String(i + 1).padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Expiry Year</label>
                                <select
                                    name="expiryYear"
                                    value={paymentData.expiryYear}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">YYYY</option>
                                    {Array.from({ length: 10 }, (_, i) => {
                                        const year = new Date().getFullYear() + i;
                                        return (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>CVC</label>
                                <input
                                    type="text"
                                    name="cvc"
                                    value={paymentData.cvc}
                                    onChange={handleInputChange}
                                    placeholder="123"
                                    maxLength={4}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>Billing Information</h4>
                        <div className="form-group">
                            <label>Cardholder Name</label>
                            <input
                                type="text"
                                name="name"
                                value={paymentData.name}
                                onChange={handleInputChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={paymentData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Billing Address</label>
                            <input
                                type="text"
                                name="address"
                                value={paymentData.address}
                                onChange={handleInputChange}
                                placeholder="123 Main St, City, Country"
                                required
                            />
                        </div>
                    </div>

                    <div className="payment-summary">
                        <div className="summary-row">
                            <span>{selectedPlanData.name} Plan</span>
                            <span>${selectedPlanData.price}/{selectedPlanData.interval}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${selectedPlanData.price}</span>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                        {isLoading ? <div className="loading-spinner" /> : `Pay $${selectedPlanData.price}`}
                    </button>
                </form>
            </div>
        );
    };

    const renderProcessingStep = () => (
        <div className="payment-processing">
            <div className="processing-animation">
                <div className="loading-spinner-large"></div>
            </div>
            <h3>Processing Payment...</h3>
            <p>Please don't close this window while we process your payment.</p>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content subscription-modal" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>
                        {paymentStep === 'plans' ? 'Subscription Plans' : 
                         paymentStep === 'payment' ? 'Payment' : 'Processing'}
                    </h2>
                    {paymentStep !== 'processing' && (
                        <button onClick={onClose} className="modal-close-btn" aria-label="Close">
                            &times;
                        </button>
                    )}
                </header>
                
                <div className="modal-body">
                    {paymentStep === 'plans' && renderPlansStep()}
                    {paymentStep === 'payment' && renderPaymentStep()}
                    {paymentStep === 'processing' && renderProcessingStep()}
                </div>
            </div>
        </div>
    );
};