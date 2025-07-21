import React, { FC, useState, useRef } from 'react';
import { Car } from '../types';
import { useI18n } from '../hooks/useI18n';

interface CarProfileScreenProps {
    car: Car;
    onUpdate: (updatedCar: Car) => void;
}

export const CarProfileScreen: FC<CarProfileScreenProps> = ({ car, onUpdate }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState(car);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'year' || name === 'mileage' ? Number(value) || 0 : value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <div className="screen-content">
            <h1>{t('carProfile.title')}</h1>
            <div className="card">
                <form className="car-profile-form" onSubmit={handleSave}>
                    <div className="car-image-uploader" onClick={() => fileInputRef.current?.click()}>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt={`${formData.make} ${formData.model}`} className="car-image" />
                        ) : (
                            <div className="car-image-placeholder">
                                <span className="material-symbols-outlined">add_a_photo</span>
                                <p>{t('carProfile.noPhoto')}</p>
                            </div>
                        )}
                    </div>
                    <div className="form-fields">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>{t('carProfile.make')}</label>
                                <input name="make" type="text" value={formData.make} onChange={handleChange} placeholder={t('carProfile.makePlaceholder')} />
                            </div>
                            <div className="form-group">
                                <label>{t('carProfile.model')}</label>
                                <input name="model" type="text" value={formData.model} onChange={handleChange} placeholder={t('carProfile.modelPlaceholder')} />
                            </div>
                            <div className="form-group">
                                <label>{t('carProfile.year')}</label>
                                <input name="year" type="number" value={formData.year} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>{t('carProfile.mileage')}</label>
                                <input name="mileage" type="number" value={formData.mileage} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>{t('carProfile.vin')}</label>
                                <input name="vin" type="text" value={formData.vin} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                             <button type="submit" className="btn btn-primary">{t('carProfile.save')}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
