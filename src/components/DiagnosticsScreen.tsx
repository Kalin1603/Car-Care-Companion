import React, { FC, useState } from 'react';
import { Car, AIDiagnosisResponse, User } from '../types';
import { apiService } from '../services/apiService';
import { useI18n } from '../hooks/useI18n';

interface DiagnosticsScreenProps {
    car: Car;
    user: User;
    onUpgradeClick: () => void;
}

const UpgradeToProView: FC<{ onUpgradeClick: () => void }> = ({ onUpgradeClick }) => {
    const { t } = useI18n();
    return (
        <div className="card pro-upsell-view">
             <div className="pro-upsell-icon">
                <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <h2>{t('pro.unlockAiTitle')}</h2>
            <p className="page-description">{t('pro.unlockAiDiagnosticsDescription')}</p>
            <ul className="pro-feature-list">
                <li><span className="material-symbols-outlined">check_circle</span> {t('pro.feature1')}</li>
                <li><span className="material-symbols-outlined">check_circle</span> {t('pro.feature2')}</li>
                <li><span className="material-symbols-outlined">check_circle</span> {t('pro.feature3')}</li>
            </ul>
            <button className="btn btn-primary" onClick={onUpgradeClick}>
                <span className="material-symbols-outlined">workspace_premium</span>
                {t('pro.upgradeNow')}
            </button>
        </div>
    )
}

export const DiagnosticsScreen: FC<DiagnosticsScreenProps> = ({car, user, onUpgradeClick}) => {
    const { t, language } = useI18n();
    const [problem, setProblem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<AIDiagnosisResponse | null>(null);

    const handleDiagnose = async () => {
        if(!problem.trim()) {
            setError(t('diagnostics.errorNoProblem'));
            return;
        }
        if(!car.make || !car.model) {
            setError(t('diagnostics.errorNoCar'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setResponse(null);
        try {
            const data = await apiService.getAIDiagnosis(car, problem, language);
            setResponse(data);
        } catch (e: any) {
            setError(e.message || t('diagnostics.errorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!user.isPro) {
        return (
            <div className="screen-content">
                <div className="screen-header">
                    <h1>{t('diagnostics.title')} <span className="pro-badge screen-title-pro">{t('common.pro')}</span></h1>
                </div>
                <UpgradeToProView onUpgradeClick={onUpgradeClick} />
            </div>
        )
    }
    
    return (
        <div className="screen-content">
            <div className="screen-header">
                <h1>{t('diagnostics.title')} <span className="pro-badge screen-title-pro">{t('common.pro')}</span></h1>
            </div>
            <div className="card">
                <p className="page-description">{t('diagnostics.description')}</p>
                <div className="form-group">
                    <label>{t('diagnostics.problemDescription')}</label>
                    <textarea 
                        value={problem}
                        onChange={e => setProblem(e.target.value)}
                        rows={4}
                        placeholder={t('diagnostics.problemPlaceholder')}
                    />
                </div>
                <button className="btn btn-primary ai-btn" onClick={handleDiagnose} disabled={isLoading || !apiService.isAvailable()}>
                     {isLoading ? <div className="loading-spinner" /> : (
                        <>
                            <span className="material-symbols-outlined">auto_awesome</span>
                            {t('diagnostics.analyze')}
                        </>
                    )}
                </button>
                {!apiService.isAvailable() && <p className="ai-error">{t('common.aiErrorUnavailable')}</p>}

                {error && <p className="ai-error">{error}</p>}

                {response && (
                    <div className="ai-assistant diagnostics-result">
                        <h3 className="ai-assistant-header">{t('diagnostics.resultsTitle')}</h3>
                        {response.analysis.map((item, index) => (
                            <div key={index} className="diagnosis-item">
                                <h4>{index+1}. {item.possibleCause}</h4>
                                <div className="diagnosis-details">
                                    <span><strong>{t('diagnostics.complexity')}</strong> {item.complexity}</span>
                                    <span><strong>{t('diagnostics.estimatedCost')}</strong> {item.estimatedCost}</span>
                                </div>
                            </div>
                        ))}
                         <div className="recommendation">
                             <p><strong>{t('diagnostics.recommendation')}</strong> {response.recommendation}</p>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};