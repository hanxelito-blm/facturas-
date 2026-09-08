// ===== CURRENCY & TAX CONFIGURATION =====

// Tipos de cambio (USD base = 1)
// Costa Rica: CRC, Impuesto: IVA 13%
// USA: USD, Impuesto: Sales Tax (varía por estado, usamos 0% para ejemplo genérico)
// Europa: EUR, Impuesto: VAT 21% (ejemplo Alemania)

export const CURRENCIES = [
  { code: 'USD', label: 'USD - Dólares', symbol: '$', country: 'US', flag: '🇺🇸' },
  { code: 'CRC', label: 'CRC - Colones', symbol: '₡', country: 'CR', flag: '🇨🇷' },
  { code: 'EUR', label: 'EUR - Euros', symbol: '€', country: 'DE', flag: '🇩🇪' },
];

// Tasas de cambio a USD (1 USD = X moneda local)
export const EXCHANGE_RATES = {
  USD: 1,
  CRC: 530,  // 1 USD ≈ 530 CRC (valor aprox 2024-2025)
  EUR: 0.92, // 1 USD ≈ 0.92 EUR
};

// Impuestos por país (IVA/VAT/Sales Tax)
export const TAX_RATES_BY_COUNTRY = {
  CR: 13,   // Costa Rica IVA 13%
  US: 0,    // USA sin IVA federal (Sales Tax varía por estado)
  DE: 19,   // Alemania VAT 19%
  ES: 21,   // España VAT 21%
  MX: 16,   // México IVA 16%
  CO: 19,   // Colombia IVA 19%
  PE: 18,   // Perú IGV 18%
  CL: 19,   // Chile IVA 19%
  AR: 21,   // Argentina IVA 21%
  BR: 17,   // Brasil ICMS ~17%
};

export const getCurrencyConfig = (currencyCode) => {
  return CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
};

export const getTaxRateForCurrency = (currencyCode) => {
  const currency = getCurrencyConfig(currencyCode);
  return TAX_RATES_BY_COUNTRY[currency.country] || 0;
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  // Convert to USD first, then to target
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
};

export const formatCurrency = (amount, currencyCode, locale = 'es-CR') => {
  const config = getCurrencyConfig(currencyCode);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'CRC' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'CRC' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toLocaleString(locale, { minimumFractionDigits: 0 })}`;
  }
};