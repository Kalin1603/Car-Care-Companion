import React, { useState, FC, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import enTranslations from '../i18n/en.ts';

const SLIDESHOW_IMAGES = [
    'https://images.pexels.com/photos/8986139/pexels-photo-8986139.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/4488636/pexels-photo-4488636.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/68705/pexels-photo-68705.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/4489749/pexels-photo-4489749.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/3807276/pexels-photo-3807276.jpeg?auto=compress&cs=tinysrgb&w=1920',
];

// Local translation function to enforce English on this screen
const getNestedTranslation = (key: string): string | undefined => {
    return key.split('.').reduce((obj: any, k) => obj && obj[k], enTranslations);
};

const t = (key: string, replacements?: { [key: string]: string | number }): string => {
    let translation = getNestedTranslation(key);
    if (!translation) {
        return key;
    }
    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            translation = translation!.replace(`{${placeholder}}`, String(replacements[placeholder]));
        });
    }
    return translation;
};


export const AuthScreen: FC<{ onLoginSuccess: (user: User) => void }> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
      username: '', password: '', fullName: '', email: '', phone: '', confirmPassword: '', address: ''
  });
  const [error, setError] = useState('');
  const [regSuccessInfo, setRegSuccessInfo] = useState<{username: string, email: string} | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % SLIDESHOW_IMAGES.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({...prev, [name]: value}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (activeTab === 'register') {
        const { username, password, email, fullName, confirmPassword, address, phone } = formData;
        if (!username || !password || !email || !fullName || !confirmPassword) {
          setError(t('auth.errorFields'));
          return;
        }
        if (password !== confirmPassword) {
            setError(t('auth.errorPasswordMismatch'));
            return;
        }
        const registeredUser = authService.register({ username, password, email, phone, fullName, address });
        setRegSuccessInfo({ username: registeredUser.username, email: registeredUser.email });
      } else {
        const user = authService.login(formData.username, formData.password);
        if (user) {
          onLoginSuccess(user);
        } else {
          setError(t('auth.errorCredentials'));
        }
      }
    } catch (err: any) {
      setError(t(`auth.${err.message}`));
    }
  };

  const handleSimulateConfirm = () => {
      if (regSuccessInfo) {
          authService.confirmUser(regSuccessInfo.username);
          alert(t('auth.accountConfirmed', { username: regSuccessInfo.username }));
          setRegSuccessInfo(null);
          setActiveTab('login');
      }
  }

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError('');
    setRegSuccessInfo(null);
    setFormData({ username: '', password: '', fullName: '', email: '', phone: '', confirmPassword: '', address: '' });
  };
  
  const renderConfirmationScreen = () => (
    <div className="auth-confirmation">
        <h2>{t('auth.confirmEmailTitle')}</h2>
        <p>{t('auth.confirmEmailMessage')} <strong>{regSuccessInfo?.email}</strong>.</p>
        <div className="simulation-note">
            <p>{t('auth.confirmEmailSimulation')}</p>
            <button className="btn btn-secondary" onClick={handleSimulateConfirm}>{t('auth.simulateConfirmation')}</button>
        </div>
        <button className="back-to-login-btn" onClick={() => switchTab('login')}>{t('auth.backToLogin')}</button>
    </div>
  );

  const renderForms = () => (
    <>
        <div className="auth-tabs">
            <button className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>
                {t('auth.loginAction')}
            </button>
            <button className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>
                {t('auth.registerAction')}
            </button>
        </div>
        <form onSubmit={handleSubmit} key={activeTab}>
            {error && <p className="auth-error">{error}</p>}
            {activeTab === 'login' ? (
                <>
                    <div className="form-group">
                        <label>{t('auth.usernameLoginLabel')}</label>
                        <input name="username" type="text" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('auth.passwordLabel')}</label>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} required />
                    </div>
                </>
            ) : (
                <>
                    <div className="form-group">
                        <label>{t('auth.fullNameLabel')}</label>
                        <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
                    </div>
                     <div className="form-group">
                        <label>{t('auth.usernameLabel')}</label>
                        <input name="username" type="text" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('auth.emailLabel')}</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('auth.addressLabel')}</label>
                        <input name="address" type="text" value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>{t('auth.passwordLabel')}</label>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('auth.confirmPasswordLabel')}</label>
                        <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                </>
            )}
            <button type="submit" className="btn btn-primary btn-block" style={{marginTop: '1rem'}}>
                {activeTab === 'login' ? t('auth.loginAction') : t('auth.registerAction')}
            </button>
        </form>
    </>
  );

  return (
    <div className="auth-layout">
        {SLIDESHOW_IMAGES.map((src, index) => (
            <div
                key={src}
                className="auth-slideshow-image"
                style={{
                    backgroundImage: `url(${src})`,
                    opacity: index === currentImageIndex ? 1 : 0,
                }}
            />
        ))}
        <div className="auth-overlay"></div>
        <div className="auth-card">
            <div className="auth-logo">
                Servi<span className="auth-logo-x">X</span>
            </div>
            {regSuccessInfo ? renderConfirmationScreen() : renderForms()}
        </div>
    </div>
  );
};