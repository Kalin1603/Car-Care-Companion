import { Currency } from "../types";

// Base currency is EUR. Exchange rates are for demonstration.
const conversionRates: Record<Currency, number> = {
    EUR: 1,
    USD: 1.1, 
};

const currencySymbols: Record<Currency, string> = {
    EUR: '€',
    USD: '$',
};

const currencyLocales: Record<Currency, string> = {
    EUR: 'de-DE',
    USD: 'en-US',
};

export const currencyService = {
    /**
     * Gets the symbol for a given currency.
     * @param currency - The currency code.
     * @returns The currency symbol character.
     */
    getSymbol: (currency: Currency): string => {
        return currencySymbols[currency];
    },

    /**
     * Formats an amount for display in a target currency.
     * @param amountInEur - The numerical amount in the base currency (EUR).
     * @param targetCurrency - The currency to display.
     * @returns A formatted currency string (e.g., "$110.00").
     */
    format: (amountInEur: number, targetCurrency: Currency): string => {
        const convertedAmount = amountInEur * conversionRates[targetCurrency];
        const locale = currencyLocales[targetCurrency];
        
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: targetCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        return formatter.format(convertedAmount);
    },
};