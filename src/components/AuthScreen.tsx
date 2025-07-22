import React, { useState, FC, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { useI18n } from '../hooks/useI18n';

// This is a type definition for the Google Sign-In credential response
declare global {
    interface Window {
        google: any;
    }
}
interface CredentialResponse {
    credential?: string;
}

export const AuthScreen: FC<{ onLoginSuccess: (user: User) => void }> = ({ onLoginSuccess }) => {
    const { t } = useI18n();
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        username: '', password: '', fullName: '', email: '', phone: '', confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [regSuccessInfo, setRegSuccessInfo] = useState<{username: string, email: string} | null>(null);

    // In a real application, this should be configured via environment variables.
    // This placeholder allows the UI to render correctly for demonstration.
    const GOOGLE_CLIENT_ID = "1001155986938-v11h25il991mpfaf8i9msnbfh2q9663p.apps.googleusercontent.com";

    const handleGoogleSignIn = (response: CredentialResponse) => {
        if (response.credential) {
            try {
                const user = authService.loginWithGoogle(response.credential);
                onLoginSuccess(user);
            } catch (err: any) {
                 setError(t('auth.googleSignInError'));
            }
        }
    };
    
    useEffect(() => {
        // Initialize Google Sign-In.
        if (window.google?.accounts?.id) {
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleSignIn,
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleSignInButton")!,
                    { theme: "outline", size: "large", width: "360" } 
                );
            } catch (error) {
                console.error("Google Sign-In initialization error:", error);
                setError(t('auth.googleSignInError'));
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) {
                const { username, password, email, fullName, confirmPassword, phone } = formData;
                if (!username || !password || !email || !fullName) {
                    setError(t('auth.errorFields'));
                    return;
                }
                if (password !== confirmPassword) {
                    setError(t('auth.errorPasswordMismatch'));
                    return;
                }
                const registeredUser = authService.register({ username, password, email, phone, fullName });
                setRegSuccessInfo({ username: registeredUser.username, email: registeredUser.email });
            } else { // Login
                const user = authService.login(formData.username, formData.password);
                if (user) {
                    onLoginSuccess(user);
                } else {
                    setError(t('auth.errorCredentials'));
                }
            }
        } catch (err: any) {
             const errorMessageKey = `auth.${err.message}`;
             const translatedError = t(errorMessageKey);
             setError(translatedError.startsWith('auth.') ? err.message : translatedError);
        }
    };

    const handleSimulateConfirm = () => {
        if (regSuccessInfo) {
            authService.confirmUser(regSuccessInfo.username);
            alert(t('auth.accountConfirmed', { username: regSuccessInfo.username }));
            setRegSuccessInfo(null);
            setIsRegistering(false);
        }
    };

    const toggleForm = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setRegSuccessInfo(null);
        setFormData({ username: '', password: '', fullName: '', email: '', phone: '', confirmPassword: '' });
    };

    const renderConfirmationScreen = () => (
        <div className="auth-confirmation">
            <h2>{t('auth.confirmEmailTitle')}</h2>
            <p>{t('auth.confirmEmailMessage')} <strong>{regSuccessInfo?.email}</strong>.</p>
            <div className="simulation-note">
                <p>{t('auth.confirmEmailSimulation')}</p>
                <button className="btn btn-secondary" onClick={handleSimulateConfirm}>{t('auth.simulateConfirmation')}</button>
            </div>
            <button className="back-to-login-btn" onClick={() => { setRegSuccessInfo(null); setIsRegistering(false); }}>{t('auth.backToLogin')}</button>
        </div>
    );
    
    const renderForms = () => (
        <>
            <h2>{isRegistering ? t('auth.registerTitle') : t('auth.loginTitle')}</h2>
            <form onSubmit={handleSubmit} key={isRegistering ? 'register' : 'login'}>
                {error && <p className="auth-error">{error}</p>}

                {isRegistering && (
                     <div className="form-group">
                        <label>{t('auth.fullNameLabel')}</label>
                        <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
                    </div>
                )}

                <div className="form-group">
                    <label>{t('auth.usernameLabel')}</label>
                    <input name="username" type="text" value={formData.username} onChange={handleChange} required />
                </div>
                
                {isRegistering && (
                     <div className="form-group">
                        <label>{t('auth.emailLabel')}</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                )}

                <div className="form-group">
                    <label>{t('auth.passwordLabel')}</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} required />
                </div>
                
                {isRegistering && (
                    <div className="form-group">
                        <label>{t('auth.confirmPasswordLabel')}</label>
                        <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                )}

                <button type="submit" className="btn btn-primary btn-block" style={{marginTop: '1rem'}}>
                    {isRegistering ? t('auth.registerAction') : t('auth.loginAction')}
                </button>
            </form>
            <div className="auth-toggle-link">
                {isRegistering ? t('auth.switchToLogin') : t('auth.switchToRegister')}
                <button onClick={toggleForm}>
                    {isRegistering ? t('auth.loginHere') : t('auth.createHere')}
                </button>
            </div>
            
            <div className="auth-divider">{t('auth.or')}</div>
            <div id="googleSignInButton"></div>
        </>
    );

    return (
        <div className="auth-layout">
            <div className="auth-graphic-panel">
                <div className="auth-graphic-content">
                    <h1>{t('appName')}</h1>
                    <p>{t('auth.tagline')}</p>
                </div>
            </div>
            <div className="auth-form-panel">
                <div className="auth-card">
                     <div className="auth-logo">Servi<span className="auth-logo-x">X</span></div>
                     {regSuccessInfo ? renderConfirmationScreen() : renderForms()}
                </div>
            </div>
        </div>
    );
};