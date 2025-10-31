// Currency conversion rates (base: USD)
// These rates should be updated periodically or fetched from an API
const exchangeRates = {
  'USD': 1.00,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 149.50,
  'CNY': 7.24,
  'CAD': 1.36,
  'AUD': 1.53,
  'CHF': 0.88,
  'INR': 83.12,
  'MXN': 17.05,
  'BRL': 4.98,
  'ZAR': 18.35,
  'KRW': 1342.50,
  'SGD': 1.34,
  'NZD': 1.65,
  'SEK': 10.58,
  'NOK': 10.72,
  'DKK': 6.85,
  'PLN': 3.96,
  'THB': 35.48,
  'IDR': 15420.00,
  'HUF': 355.20,
  'CZK': 22.95,
  'ILS': 3.75,
  'CLP': 945.50,
  'PHP': 56.25,
  'AED': 3.67,
  'SAR': 3.75,
  'MYR': 4.68,
  'RON': 4.56
};

// Convert from USD to target currency
function convertFromUSD(amountUSD, targetCurrency) {
  const rate = exchangeRates[targetCurrency] || 1;
  return amountUSD * rate;
}

// Convert from source currency to USD
function convertToUSD(amount, sourceCurrency) {
  const rate = exchangeRates[sourceCurrency] || 1;
  return amount / rate;
}

// Convert between any two currencies
function convertCurrency(amount, fromCurrency, toCurrency) {
  // First convert to USD, then to target currency
  const usdAmount = convertToUSD(amount, fromCurrency);
  return convertFromUSD(usdAmount, toCurrency);
}

// Get currency symbol for a currency code
function getCurrencySymbol(currencyCode) {
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'CAD': '$',
    'AUD': '$',
    'CHF': 'Fr',
    'INR': '₹',
    'MXN': '$',
    'BRL': 'R$',
    'ZAR': 'R',
    'KRW': '₩',
    'SGD': '$',
    'NZD': '$',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'THB': '฿',
    'IDR': 'Rp',
    'HUF': 'Ft',
    'CZK': 'Kč',
    'ILS': '₪',
    'CLP': '$',
    'PHP': '₱',
    'AED': 'د.إ',
    'SAR': '﷼',
    'MYR': 'RM',
    'RON': 'lei'
  };
  return currencySymbols[currencyCode] || '$';
}

// Get formatted currency label for form fields (e.g., "CAD ($)" or "€")
function getCurrencyLabel(currencyCode) {
  const currency = currencyCode || window.currentCurrency || 'USD';
  const symbol = getCurrencySymbol(currency);
  
  // Currencies that share symbols - show code + symbol for clarity
  const dollarCurrencies = ['USD', 'CAD', 'AUD', 'MXN', 'SGD', 'NZD', 'CLP'];
  const kronaCurrencies = ['SEK', 'NOK', 'DKK'];
  const yenCurrencies = ['JPY', 'CNY'];
  
  // For currencies that share symbols, show code + symbol
  if (dollarCurrencies.includes(currency) || kronaCurrencies.includes(currency) || yenCurrencies.includes(currency)) {
    return `${currency} (${symbol})`;
  }
  
  // For unique symbols, just show symbol
  return symbol;
}

// Format amount with currency symbol
function formatCurrency(amountUSD, displayCurrency) {
  const currency = displayCurrency || window.currentCurrency || 'USD';
  const convertedAmount = convertFromUSD(amountUSD, currency);
  const symbol = getCurrencySymbol(currency);
  
  // Currencies that share symbols - show code + symbol for clarity
  const dollarCurrencies = ['USD', 'CAD', 'AUD', 'MXN', 'SGD', 'NZD', 'CLP'];
  const kronaCurrencies = ['SEK', 'NOK', 'DKK'];
  const yenCurrencies = ['JPY', 'CNY'];
  
  // Format based on currency (some currencies don't use decimals)
  if (currency === 'JPY' || currency === 'KRW' || currency === 'IDR') {
    const amount = Math.round(convertedAmount).toLocaleString();
    // Show code for JPY to distinguish from CNY
    if (yenCurrencies.includes(currency)) {
      return `${currency} (${symbol}${amount})`;
    }
    return `${currency} (${symbol}${amount})`;
  }
  
  const amount = convertedAmount.toFixed(2);
  
  // For currencies that share symbols, show code + symbol
  if (dollarCurrencies.includes(currency) || kronaCurrencies.includes(currency) || yenCurrencies.includes(currency)) {
    return `${currency} (${symbol}${amount})`;
  }
  
  // For unique symbols, just show symbol
  return `${symbol}${amount}`;
}

// Export functions to window object for global access
window.convertFromUSD = convertFromUSD;
window.convertToUSD = convertToUSD;
window.convertCurrency = convertCurrency;
window.getCurrencySymbol = getCurrencySymbol;
window.getCurrencyLabel = getCurrencyLabel;
window.formatCurrency = formatCurrency;
