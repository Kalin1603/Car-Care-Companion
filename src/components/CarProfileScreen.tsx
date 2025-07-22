import React, { FC, useState, useRef, useEffect, useMemo } from 'react';
import { Car, ServiceRecord } from '../types';
import { useI18n } from '../hooks/useI18n';

const calculateOilLife = (car: Car, services: ServiceRecord[]): { percentage: number, color: 'high' | 'medium' | 'low' } => {
    const oilChangeServices = services
        .filter(s => s.type.toLowerCase().includes('oil') || s.category.toLowerCase() === 'engine')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (oilChangeServices.length === 0) {
        return { percentage: 0, color: 'low' };
    }

    const lastOilChange = oilChangeServices[0];
    const kmSinceChange = car.mileage - lastOilChange.mileage;
    const recommendedInterval = 15000; // in km

    if (kmSinceChange < 0) return { percentage: 100, color: 'high' };

    const lifeUsed = (kmSinceChange / recommendedInterval) * 100;
    const percentage = Math.max(0, 100 - lifeUsed);
    
    let color: 'high' | 'medium' | 'low' = 'high';
    if (percentage < 50) color = 'medium';
    if (percentage < 20) color = 'low';

    return { percentage: Math.round(percentage), color };
};

export const CarProfileScreen: FC<{ car: Car; services: ServiceRecord[]; onUpdate: (updatedCar: Car) => void; }> = ({ car, services, onUpdate }) => {
    const { t } = useI18n();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Car>(car);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const oilLife = useMemo(() => calculateOilLife(car, services), [car, services]);

    useEffect(() => {
        setFormData(car);
    }, [car]);

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        
        if (keys.length > 1) {
            setFormData(prev => ({
                ...prev,
                [keys[0]]: {
                    ...(prev[keys[0] as keyof Car] as object),
                    [keys[1]]: keys[0] === 'tirePressure' ? Number(value) : value
                }
            }));
        } else {
            setFormData(prev => ({...prev, [name]: (name === 'year' || name === 'mileage') ? Number(value) || 0 : value }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(car);
        setIsEditing(false);
    };

    return (
        <div className="screen-content">
             <div className="screen-header">
                <h1>{t('carProfile.title')}</h1>
                {!isEditing && (
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        <span className="material-symbols-outlined">edit</span>
                        {t('carProfile.editProfile')}
                    </button>
                )}
            </div>
            
            <div className="car-profile-dashboard">
                <div className="glass-card car-profile-hero-card">
                    <header className="car-profile-header" onClick={() => isEditing && fileInputRef.current?.click()}>
                        {formData.imageUrl && <img src={formData.imageUrl} alt={`${car.make} ${car.model}`} className="car-profile-banner-img" />}
                        <div className="car-profile-banner-overlay">
                            {isEditing && (
                                <div className="upload-prompt">
                                    <span className="material-symbols-outlined">add_a_photo</span>
                                    <p>{t('carProfile.noPhoto')}</p>
                                </div>
                            )}
                            <div className="car-profile-title">
                                {isEditing ? (
                                    <div className="form-grid car-profile-title-edit">
                                        <div className="form-group"><input name="make" value={formData.make} onChange={handleDataChange} placeholder={t('carProfile.make')} /></div>
                                        <div className="form-group"><input name="model" value={formData.model} onChange={handleDataChange} placeholder={t('carProfile.model')} /></div>
                                    </div>
                                ) : (
                                    <div className="car-profile-title-display">
                                        <h2>{car.make || `[${t('carProfile.make')}]`}</h2>
                                        <p>{car.model || `[${t('carProfile.model')}]`}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                </div>

                <div className="glass-card car-profile-specs-card">
                    <h3 className="card-subtitle"><span className="material-symbols-outlined">list_alt</span>{t('carProfile.specifications')}</h3>
                    <div className="specs-grid">
                        {Object.entries({year: "calendar_today", mileage: "speed", vin: "pin", engineType: "settings", transmission: "swap_horiz", exteriorColor: "palette"}).map(([key, icon]) => {
                            const value = car[key as keyof Car];
                            return (
                                <div className="spec-item" key={key}>
                                    <span className="spec-label">{t(`carProfile.${key}`)}</span>
                                    {isEditing ? (
                                        <div className="form-group">
                                            {key === 'transmission' ? (
                                                <select name="transmission" value={formData.transmission} onChange={handleDataChange}>
                                                    <option value="Automatic">{t('carProfile.transmissionOptions.automatic')}</option>
                                                    <option value="Manual">{t('carProfile.transmissionOptions.manual')}</option>
                                                </select>
                                            ) : key === 'exteriorColor' ? (
                                                <input name="exteriorColor" type="color" value={formData.exteriorColor} onChange={handleDataChange}/>
                                            ) : (
                                                <input name={key} type={key === 'year' || key === 'mileage' ? 'number' : 'text'} value={formData[key as keyof Car] as string | number} onChange={handleDataChange} />
                                            )}
                                        </div>
                                    ) : (
                                        <span className="spec-value">
                                            {key === 'exteriorColor' ? (
                                                <span className="spec-value-color">
                                                    <div className="color-swatch" style={{backgroundColor: car.exteriorColor}}></div>
                                                    {car.exteriorColor}
                                                </span>
                                            ) : key === 'transmission' ? (
                                                t(`carProfile.transmissionOptions.${car.transmission.toLowerCase()}`)
                                            ) : (
                                                (typeof value === 'object' ? null : value) || '-'
                                            )}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-card car-profile-maintenance-card">
                    <h3 className="card-subtitle"><span className="material-symbols-outlined">health_and_safety</span>{t('carProfile.maintenanceMonitors')}</h3>
                    <div className="maintenance-monitors-grid">
                        <div className="monitor-widget">
                            <h4 className="monitor-widget-title"><span className="material-symbols-outlined">compress</span>{t('carProfile.tirePressure')}</h4>
                             <div className="tire-pressure-grid">
                                {Object.keys(formData.tirePressure).map((pos) => (
                                    <div className="tire-input-group" key={pos}>
                                        <label>{t(`carProfile.tirePressureLabels.${pos}`)}</label>
                                        {isEditing ? (
                                            <input name={`tirePressure.${pos}`} type="number" value={formData.tirePressure[pos as keyof typeof formData.tirePressure]} onChange={handleDataChange}/>
                                        ) : (
                                            <div>{formData.tirePressure[pos as keyof typeof formData.tirePressure]}</div>
                                        )}
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="monitor-widget">
                            <h4 className="monitor-widget-title"><span className="material-symbols-outlined">oil_barrel</span>{t('carProfile.oilLife')}</h4>
                            <div className="oil-life-value">{oilLife.percentage}%</div>
                            <div className="oil-life-bar-container">
                                <div className={`oil-life-bar ${oilLife.color}`} style={{ width: `${oilLife.percentage}%` }}></div>
                            </div>
                        </div>
                        <div className="monitor-widget">
                             <h4 className="monitor-widget-title"><span className="material-symbols-outlined">opacity</span>{t('carProfile.fluidStatus')}</h4>
                             <div className="fluid-status-list">
                                {Object.keys(formData.fluidLevels).map((fluid) => (
                                    <div className="fluid-status-item" key={fluid}>
                                        <span className="fluid-status-label">{t(`carProfile.${fluid}`)}</span>
                                        {isEditing ? (
                                            <div className="form-group">
                                                <select name={`fluidLevels.${fluid}`} value={formData.fluidLevels[fluid as keyof typeof formData.fluidLevels]} onChange={handleDataChange}>
                                                    <option value="OK">{t('carProfile.fluidOptions.ok')}</option>
                                                    <option value="Low">{t('carProfile.fluidOptions.low')}</option>
                                                    <option value="Check">{t('carProfile.fluidOptions.check')}</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <span className={`fluid-status-value ${formData.fluidLevels[fluid as keyof typeof formData.fluidLevels].toLowerCase()}`}>
                                                {t(`carProfile.fluidOptions.${formData.fluidLevels[fluid as keyof typeof formData.fluidLevels].toLowerCase()}`)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            {isEditing && (
                <div className="car-profile-actions">
                    <button className="btn btn-secondary" onClick={handleCancel}>{t('carProfile.cancel')}</button>
                    <button className="btn btn-primary" onClick={handleSave}>{t('carProfile.save')}</button>
                </div>
            )}
        </div>
    );
};