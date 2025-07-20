import React, { FC, useState } from 'react';
import { Car, AIDiagnosisResponse } from '../types';
import { apiService } from '../services/apiService';
import { useI18n } from '../hooks/useI18n';
import { useCurrency } from '../hooks/useCurrency';

export const DiagnosticsScreen: FC<{car: Car}> = ({car}) => {
    const { t, language } = useI18n();
    const { currency } = useCurrency();
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
            const data = await apiService.getAIDiagnosis(car, problem, language, currency);
            setResponse(data);
        } catch (e: any) {
            setError(e.message || t('diagnostics.errorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="screen-content">
            <h1>{t('diagnostics.title')} <span className="pro-badge screen-title-pro">{t('common.pro')}</span></h1>
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