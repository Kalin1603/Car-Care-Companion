import React, { useState, FC, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import enTranslations from '../i18n/en.ts';

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

interface OAuthProvider {
    id: string;
    name: string;
    logoUrl: string;
    color: string;
    hoverColor: string;
}

const oauthProviders: OAuthProvider[] = [
    { 
        id: 'google', 
        name: 'Google', 
        logoUrl: 'https://developers.google.com/identity/images/g-logo.png', 
        color: '#4285f4', 
        hoverColor: '#357ae8' 
    },
    { 
        id: 'facebook', 
        name: 'Facebook', 
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg', 
        color: '#1877f2', 
        hoverColor: '#166fe5' 
    },
    { 
        id: 'twitter', 
        name: 'X', 
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg', 
        color: '#000000', 
        hoverColor: '#333333' 
    },
    { 
        id: 'apple', 
        name: 'Apple', 
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', 
        color: '#000000', 
        hoverColor: '#333333' 
    },
];

export const AuthScreen: FC<{ onLoginSuccess: (user: User) => void }> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [formData, setFormData] = useState({
      username: '', password: '', fullName: '', email: '', phone: '', confirmPassword: '', address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [regSuccessInfo, setRegSuccessInfo] = useState<{username: string, email: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({...prev, [name]: value}));
  }

  const handleOAuthLogin = async (provider: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate OAuth flow - in real implementation, this would redirect to OAuth provider
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, create a mock user
      const mockUser: User = {
        username: `${provider}_user_${Date.now()}`,
        password: 'oauth_user',
        email: `user@${provider}.com`,
        fullName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        phone: '',
        address: '',
        isConfirmed: true,
        profilePicture: null,
        subscriptionTier: 'basic'
      };
      
      // Save to localStorage and login
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      const existingUser = users.find((u: User) => u.email === mockUser.email);
      
      if (!existingUser) {
        users.push(mockUser);
        localStorage.setItem('app_users', JSON.stringify(users));
      }
      
      onLoginSuccess(existingUser || mockUser);
    } catch (err) {
      setError(`Failed to authenticate with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      if (activeTab === 'forgot') {
        // Simulate password reset
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!formData.email) {
          setError(t('auth.errorFields'));
          return;
        }
        setSuccess('Password reset link sent to your email address.');
        setTimeout(() => setActiveTab('login'), 3000);
        return;
      }
      
      if (activeTab === 'register') {
        const { username, password, email, fullName, confirmPassword, phone } = formData;
        if (!username || !password || !email || !fullName || !confirmPassword) {
          setError(t('auth.errorFields'));
          return;
        }
        if (password !== confirmPassword) {
            setError(t('auth.errorPasswordMismatch'));
            return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        const registeredUser = authService.register({ username, password, email, phone, fullName, address: formData.address });
        setRegSuccessInfo({ username: registeredUser.username, email: registeredUser.email });
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        const user = authService.login(formData.username, formData.password);
        if (user) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => onLoginSuccess(user), 1000);
        } else {
          setError(t('auth.errorCredentials'));
        }
      }
    } catch (err: any) {
      setError(t(`auth.${err.message}`));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateConfirm = () => {
      if (regSuccessInfo) {
          authService.confirmUser(regSuccessInfo.username);
          setSuccess(t('auth.accountConfirmed', { username: regSuccessInfo.username }));
          setRegSuccessInfo(null);
          setTimeout(() => setActiveTab('login'), 2000);
      }
  }

  const switchTab = (tab: 'login' | 'register' | 'forgot') => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setRegSuccessInfo(null);
    setFormData({ username: '', password: '', fullName: '', email: '', phone: '', confirmPassword: '', address: '' });
  };
  
  const renderConfirmationScreen = () => (
    <div className="auth-confirmation">
        <div className="auth-success-icon">
            <span className="material-symbols-outlined">mark_email_read</span>
        </div>
        <h2>{t('auth.confirmEmailTitle')}</h2>
        <p>{t('auth.confirmEmailMessage')} <strong>{regSuccessInfo?.email}</strong>.</p>
        <div className="simulation-note">
            <p>{t('auth.confirmEmailSimulation')}</p>
            <button className="btn btn-secondary" onClick={handleSimulateConfirm} disabled={isLoading}>
                {isLoading ? <div className="loading-spinner" /> : t('auth.simulateConfirmation')}
            </button>
        </div>
        <button className="back-to-login-btn" onClick={() => switchTab('login')}>{t('auth.backToLogin')}</button>
    </div>
  );

  const renderOAuthButtons = () => (
    <div className="oauth-section">
      <div className="oauth-divider">
        <span>or continue with</span>
      </div>
      <div className="oauth-buttons">
        {oauthProviders.map(provider => (
          <button
            key={provider.id}
            type="button"
            className="oauth-btn"
            onClick={() => handleOAuthLogin(provider.id)}
            disabled={isLoading}
            style={{ '--provider-color': provider.color, '--provider-hover-color': provider.hoverColor } as React.CSSProperties}
          >
            <img src={provider.logoUrl} alt={`${provider.name} logo`} className="oauth-logo" />
            <span className="oauth-text">{provider.name}</span>
          </button>
        ))}
      </div>
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
        
        <form onSubmit={handleSubmit} key={activeTab} className="auth-form">
            {error && <div className="auth-error animate-shake">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            
            {activeTab === 'login' ? (
                <>
                    <div className="form-group">
                        <label>Username*</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">person</span>
                            <input 
                                name="username" 
                                type="text" 
                                value={formData.username} 
                                onChange={handleChange} 
                                required 
                                disabled={isLoading}
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password*</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">lock</span>
                            <input 
                                name="password" 
                                type="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                disabled={isLoading}
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>
                    <div className="auth-links">
                        <button type="button" className="link-btn" onClick={() => switchTab('forgot')}>
                            Forgot password?
                        </button>
                    </div>
                </>
            ) : activeTab === 'register' ? (
                <>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name*</label>
                            <div className="input-wrapper">
                                <span className="material-symbols-outlined input-icon">badge</span>
                                <input 
                                    name="fullName" 
                                    type="text" 
                                    value={formData.fullName} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={isLoading}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Username*</label>
                            <div className="input-wrapper">
                                <span className="material-symbols-outlined input-icon">person</span>
                                <input 
                                    name="username" 
                                    type="text" 
                                    value={formData.username} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={isLoading}
                                    placeholder="johndoe"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email*</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">email</span>
                            <input 
                                name="email" 
                                type="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                disabled={isLoading}
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">phone</span>
                            <input 
                                name="phone" 
                                type="tel" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                disabled={isLoading}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Address (optional)</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">home</span>
                            <input 
                                name="address" 
                                type="text" 
                                value={formData.address} 
                                onChange={handleChange} 
                                disabled={isLoading}
                                placeholder="123 Main St, City, Country"
                            />
                        </div>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Password*</label>
                            <div className="input-wrapper">
                                <span className="material-symbols-outlined input-icon">lock</span>
                                <input 
                                    name="password" 
                                    type="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={isLoading}
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Confirm Password*</label>
                            <div className="input-wrapper">
                                <span className="material-symbols-outlined input-icon">lock</span>
                                <input 
                                    name="confirmPassword" 
                                    type="password" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={isLoading}
                                    placeholder="Confirm password"
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                        <span className="material-symbols-outlined input-icon">email</span>
                        <input 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            disabled={isLoading}
                            placeholder="Enter your email address"
                        />
                    </div>
                    <p className="form-help">We'll send you a link to reset your password.</p>
                </div>
            )}
            
            <button type="submit" className="btn btn-primary btn-block auth-submit-btn" disabled={isLoading}>
                {isLoading ? (
                    <div className="loading-spinner" />
                ) : (
                    <>
                        <span className="material-symbols-outlined">
                            {activeTab === 'login' ? 'login' : activeTab === 'register' ? 'person_add' : 'email'}
                        </span>
                        {activeTab === 'login' ? t('auth.loginAction') : 
                         activeTab === 'register' ? t('auth.registerAction') : 'Send Reset Link'}
                    </>
                )}
            </button>
        </form>
        
        {activeTab !== 'forgot' && renderOAuthButtons()}
        
        {activeTab === 'forgot' && (
            <div className="auth-links">
                <button type="button" className="link-btn" onClick={() => switchTab('login')}>
                    Back to Login
                </button>
            </div>
        )}
    </>
  );

  return (
    <div className="auth-layout">
        <div className="auth-3d-background">
            <iframe 
                src='https://my.spline.design/worldplanet-hvUCnnNiSZe9rmGAJ9vU7phm/' 
                frameBorder='0' 
                width='100%' 
                height='100%'
                title="3D Background Animation"
            />
            <div className="auth-3d-overlay"></div>
            <div className="auth-3d-content">
                <div className="slideshow-text">
                    <h1>Welcome to Auto Logbook</h1>
                    <p>Your comprehensive car maintenance companion. Track services, get AI diagnostics, and keep your vehicle in perfect condition.</p>
                    <div className="feature-highlights">
                        <div className="feature">
                            <span className="material-symbols-outlined">build_circle</span>
                            <span>AI-Powered Diagnostics</span>
                        </div>
                        <div className="feature">
                            <span className="material-symbols-outlined">history</span>
                            <span>Complete Service History</span>
                        </div>
                        <div className="feature">
                            <span className="material-symbols-outlined">notifications</span>
                            <span>Smart Maintenance Reminders</span>
                        </div>
                    </div>
                </div>
                width='100%' 
                height='100%'
                title="3D Background Animation"
            />
            <div className="auth-3d-overlay"></div>
            <div className="auth-3d-content">
                <div className="slideshow-text">
                    <h1>Welcome to Auto Logbook</h1>
                    <p>Your comprehensive car maintenance companion. Track services, get AI diagnostics, and keep your vehicle in perfect condition.</p>
                    <div className="feature-highlights">
                        <div className="feature">
                            <span className="material-symbols-outlined">build_circle</span>
                            <span>AI-Powered Diagnostics</span>
                        </div>
                        <div className="feature">
                            <span className="material-symbols-outlined">history</span>
                            <span>Complete Service History</span>
                        </div>
                        <div className="feature">
                            <span className="material-symbols-outlined">notifications</span>
                            <span>Smart Maintenance Reminders</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="auth-form-panel">
            <div className="auth-card">
                <div className="auth-logo">
                    <span className="material-symbols-outlined">directions_car</span>
                    Auto Logbook
                </div>
                {regSuccessInfo ? renderConfirmationScreen() : renderForms()}
            </div>
        </div>
    </div>
  );
};