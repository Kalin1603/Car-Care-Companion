import React, { FC, useState, useEffect, useRef } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { currencyService } from '../services/currencyService';
import { Currency } from '../types';

export const CurrencySwitcher: FC = () => {
    const { currency, setCurrency } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const currencies: Currency[] = ['USD', 'EUR'];

    const handleSelect = (c: Currency) => {
        setCurrency(c);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);


    return (
        <div className="currency-switcher" ref={wrapperRef}>
            <button className="icon-btn currency-switcher-btn" onClick={() => setIsOpen(!isOpen)} title="Change currency">
                {currencyService.getSymbol(currency)}
            </button>
            {isOpen && (
                <div className="currency-dropdown">
                    {currencies.map(c => (
                        <button key={c} onClick={() => handleSelect(c)} className={c === currency ? 'active' : ''}>
                           {c} ({currencyService.getSymbol(c)})
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};