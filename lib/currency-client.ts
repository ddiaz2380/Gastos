// Tipos y constantes de monedas para uso tanto en cliente como servidor
export type CurrencyCode = 'ARS' | 'USD' | 'EUR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  ARS: {
    code: 'ARS',
    symbol: '$',
    name: 'Peso Argentino'
  },
  USD: {
    code: 'USD',
    symbol: 'US$',
    name: 'Dólar Estadounidense'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro'
  }
};

// Tasas de cambio aproximadas (en una aplicación real, estas vendrían de una API)
const EXCHANGE_RATES: Record<CurrencyCode, Record<CurrencyCode, number>> = {
  ARS: {
    ARS: 1,
    USD: 0.0012, // 1 USD ≈ 850 ARS
    EUR: 0.0011  // 1 EUR ≈ 920 ARS
  },
  USD: {
    ARS: 850,
    USD: 1,
    EUR: 0.92
  },
  EUR: {
    ARS: 920,
    USD: 1.09,
    EUR: 1
  }
};

/**
 * Formatea un monto con la moneda especificada
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'ARS'): string {
  const currencyInfo = CURRENCIES[currency];
  
  // Configuración específica para cada moneda
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'ARS' ? 0 : 2,
    maximumFractionDigits: currency === 'ARS' ? 0 : 2
  };

  // Para peso argentino, usar formato local
  if (currency === 'ARS') {
    return new Intl.NumberFormat('es-AR', formatOptions).format(amount);
  }
  
  // Para otras monedas, usar formato estándar con símbolo personalizado
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: formatOptions.minimumFractionDigits,
    maximumFractionDigits: formatOptions.maximumFractionDigits
  }).format(amount);
  
  return `${currencyInfo.symbol} ${formatted}`;
}

/**
 * Convierte un monto de una moneda a otra
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const rate = EXCHANGE_RATES[fromCurrency][toCurrency];
  return amount * rate;
}

/**
 * Obtiene la información de una moneda
 */
export function getCurrencyInfo(currency: CurrencyCode) {
  return CURRENCIES[currency];
}

/**
 * Obtiene todas las monedas disponibles
 */
export function getAllCurrencies() {
  return Object.values(CURRENCIES);
}

/**
 * Valida si un código de moneda es válido
 */
export function isValidCurrency(currency: string): currency is CurrencyCode {
  return currency in CURRENCIES;
}

/**
 * Formatea un monto sin símbolo de moneda
 */
export function formatAmount(amount: number, currency: CurrencyCode = 'ARS'): string {
  const decimals = currency === 'ARS' ? 0 : 2;
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

/**
 * Convierte múltiples montos a una moneda base para comparación
 */
export function normalizeAmounts(
  amounts: Array<{ amount: number; currency: CurrencyCode }>,
  baseCurrency: CurrencyCode = 'ARS'
): number[] {
  return amounts.map(({ amount, currency }) => 
    convertCurrency(amount, currency, baseCurrency)
  );
}

/**
 * Calcula el total de múltiples montos en diferentes monedas
 */
export function calculateTotal(
  amounts: Array<{ amount: number; currency: CurrencyCode }>,
  baseCurrency: CurrencyCode = 'ARS'
): number {
  return normalizeAmounts(amounts, baseCurrency).reduce((sum, amount) => sum + amount, 0);
}
