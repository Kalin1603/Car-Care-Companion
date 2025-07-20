import { Currency } from '../types';

const exchangeRates = {
    USD: 1, // Base currency
    EUR: 0.86003278, // 1 USD = 0.86003278 EUR, rate based on user-provided value
};

const currencySymbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
};

export const currencyService = {
    getSymbol: (currency: Currency): string => {
        return currencySymbols[currency];
    },

    convertToSelected: (baseAmountUSD: number, targetCurrency: Currency): number => {
        const rate = exchangeRates[targetCurrency];
        return baseAmountUSD * rate;
    },

    convertToBase: (amountInSelected: number, sourceCurrency: Currency): number => {
        const rate = exchangeRates[sourceCurrency];
        if (rate === 0) return amountInSelected; // Avoid division by zero
        return amountInSelected / rate;
    }
};