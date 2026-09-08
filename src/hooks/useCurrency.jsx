import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CURRENCIES, getTaxRateForCurrency, formatCurrency as fmtCurrency, convertCurrency } from '../services/currencyService';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('selectedCurrency');
    return saved || 'CRC'; // Default a CRC para Costa Rica
  });

  useEffect(() => {
    localStorage.setItem('selectedCurrency', currency);
  }, [currency]);

  const taxRate = useMemo(() => getTaxRateForCurrency(currency), [currency]);
  const config = useMemo(() => CURRENCIES.find(c => c.code === currency) || CURRENCIES[0], [currency]);

  const formatCurrency = (amount, targetCurrency = currency) => fmtCurrency(amount, targetCurrency);
  const convert = (amount, fromCurrency, toCurrency) => convertCurrency(amount, fromCurrency, toCurrency);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    taxRate,
    config,
    formatCurrency,
    convertCurrency: convert,
    CURRENCIES,
  }), [currency, taxRate, config]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};