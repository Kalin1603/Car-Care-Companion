import React, { FC, useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { useI18n } from '../hooks/useI18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useToast } from '../hooks/useToast';

interface ProfileSettingsModalProps {
    isOpen: boolean; 
    onClose: () => void;
    user: User;
    onSave: (updatedData: Partial<User>) => void;
    onLogout: () => void;
}

type ProfileTab = 'profile' | 'security' | 'preferences';

export const ProfileSettingsModal: FC<ProfileSettingsModalProps> = ({ isOpen, onClose, user, onSave, onLogout }) => {
    const { t } = useI18n();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
    
    const [formData, setFormData] = useState({
        fullName: user.fullName, email: user.email, phone: user.phone, profilePicture: user.profilePicture, address: user.address || ''
    });
    const [passData, setPassData] = useState({ oldPass: '', newPass: '' });

    useEffect(() => {
      if(isOpen) {
        setActiveTab('profile');
        setFormData({ fullName: user.fullName, email: user.email, phone: user.phone, profilePicture: user.profilePicture, address: user.address || '' });
        setPassData({ oldPass: '', newPass: '' });
      }
    }, [user, isOpen]);

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setPassData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveData = () => {
        onSave(formData);
    };

    const handleSavePassword = () => {
        if (passData.oldPass !== user.password) {
            showToast(t('modals.errorOldPassword'), { type: 'error' });
            return;
        }
        if (passData.newPass.length < 3) {
            showToast(t('modals.errorNewPassword'), { type: 'error' });
            return;
        }
        onSave({ password: passData.newPass });
        setPassData({ oldPass: '', newPass: '' });
    };

    if (!isOpen) return null;

    const renderTabContent = () => {
        switch(activeTab) {
            case 'profile':
                return (
                    <div className="profile-settings-layout">
                        <div className="profile-picture-uploader" onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                            {formData.profilePicture ? (
                                <img src={formData.profilePicture} alt={t('modals.fullName')} className="profile-picture-preview" />
                            ) : (
                                <div className="profile-picture-placeholder">
                                    <span className="material-symbols-outlined">add_a_photo</span>
                                </div>
                            )}
                        </div>
                        <div className="profile-form-fields">
                            <div className="form-group"><label>{t('modals.fullName')}</label><input type="text" name="fullName" value={formData.fullName} onChange={handleDataChange} /></div>
                            <div className="form-group"><label>{t('modals.email')}</label><input type="email" name="email" value={formData.email} onChange={handleDataChange} disabled /></div>
                            <div className="form-group"><label>{t('modals.phone')}</label><input type="tel" name="phone" value={formData.phone} onChange={handleDataChange} /></div>
                            <div className="form-group"><label>{t('modals.address')}</label><input type="text" name="address" value={formData.address} onChange={handleDataChange} /></div>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div>
                        <div className="form-group"><label>{t('modals.oldPassword')}</label><input type="password" name="oldPass" value={passData.oldPass} onChange={handlePassChange} /></div>
                        <div className="form-group"><label>{t('modals.newPassword')}</label><input type="password" name="newPass" value={passData.newPass} onChange={handlePassChange} /></div>
                    </div>
                );
            case 'preferences':
                return <LanguageSwitcher />;
            default:
                return null;
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{t('modals.profileSettingsTitle')}</h2>
                    <button onClick={onClose} className="modal-close-btn" aria-label={t('modals.close')}>&times;</button>
                </header>
                <div className="modal-tabs">
                    <button className={`modal-tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>{t('modals.personalData')}</button>
                    <button className={`modal-tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>{t('modals.changePassword')}</button>
                    <button className={`modal-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>{t('modals.language')}</button>
                </div>
                <div className="modal-body">
                   <div className="modal-tab-content" key={activeTab}>
                       {renderTabContent()}
                   </div>
                </div>
                <footer className="modal-actions">
                    <button className="btn btn-danger" onClick={onLogout}>{t('modals.logout')}</button>
                    <div className="right-actions">
                       {activeTab === 'profile' && (
                           <button className="btn btn-primary" onClick={handleSaveData}>{t('modals.saveData')}</button>
                       )}
                       {activeTab === 'security' && (
                            <button className="btn btn-primary" onClick={handleSavePassword}>{t('modals.changePasswordAction')}</button>
                       )}
                    </div>
                </footer>
            </div>
        </div>
    );
};