import React, { FC } from 'react';
import { useI18n } from '../hooks/useI18n';
import { languageOptions } from '../i18n';
import { Language } from '../types';

export const LanguageSwitcher: FC = () => {
    const { t, language, setLanguage } = useI18n();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    return (
        <div className="form-group">
            <label htmlFor="language-select">{t('modals.language')}</label>
            <select id="language-select" value={language} onChange={handleLanguageChange}>
                {(Object.keys(languageOptions) as Array<keyof typeof languageOptions>).map((langKey) => (
                    <option key={langKey} value={langKey}>
                        {languageOptions[langKey]}
                    </option>
                ))}
            </select>
        </div>
    );
};
