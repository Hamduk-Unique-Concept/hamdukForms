'use server';

export const AFRICAN_LANGUAGES = {
  'en': 'English',
  'sw': 'Swahili',
  'am': 'Amharic',
  'ha': 'Hausa',
  'ig': 'Igbo',
  'yo': 'Yoruba',
  'fr': 'French',
  'pt': 'Portuguese',
  'ar': 'Arabic',
  'zu': 'Zulu',
} as const;

export const AFRICAN_CURRENCIES = {
  'NGN': 'Nigerian Naira',
} as const;

export const AFRICAN_COUNTRIES = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN', timezone: 'Africa/Lagos' },
  { code: 'KE', name: 'Kenya', currency: 'NGN', timezone: 'Africa/Nairobi' },
  { code: 'GH', name: 'Ghana', currency: 'NGN', timezone: 'Africa/Accra' },
  { code: 'ZA', name: 'South Africa', currency: 'NGN', timezone: 'Africa/Johannesburg' },
  { code: 'EG', name: 'Egypt', currency: 'NGN', timezone: 'Africa/Cairo' },
  { code: 'ET', name: 'Ethiopia', currency: 'NGN', timezone: 'Africa/Addis_Ababa' },
  { code: 'TZ', name: 'Tanzania', currency: 'NGN', timezone: 'Africa/Dar_es_Salaam' },
  { code: 'UG', name: 'Uganda', currency: 'NGN', timezone: 'Africa/Kampala' },
  { code: 'RW', name: 'Rwanda', currency: 'NGN', timezone: 'Africa/Kigali' },
  { code: 'CM', name: 'Cameroon', currency: 'NGN', timezone: 'Africa/Douala' },
];

// Network speed detection
export function detectNetworkSpeed(): 'slow-2g' | '2g' | '3g' | '4g' {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.effectiveType || '4g';
  }
  return '4g';
}

// Adaptive image loading based on network speed
export function getOptimalImageSize(networkSpeed: string): 'small' | 'medium' | 'large' {
  const speedMap = {
    'slow-2g': 'small',
    '2g': 'small',
    '3g': 'medium',
    '4g': 'large',
  };
  return (speedMap[networkSpeed as keyof typeof speedMap] || 'large') as 'small' | 'medium' | 'large';
}

// Data saver mode detection
export function isDataSaverEnabled(): boolean {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.saveData === true;
  }
  return false;
}

// Format currency based on country
export function formatAfricanCurrency(amount: number, countryCode: string): string {
  const country = AFRICAN_COUNTRIES.find(c => c.code === countryCode);
  if (!country) return amount.toString();

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: country.currency,
  }).format(amount);
}

// Get region-specific payment methods
export function getRegionalPaymentMethods(countryCode: string): string[] {
  const paymentMap: Record<string, string[]> = {
    'NG': ['Paystack', 'Bank Transfer'],
    'KE': ['Paystack', 'Bank Transfer'],
    'GH': ['Paystack', 'Bank Transfer'],
    'ZA': ['Paystack', 'Bank Transfer'],
    'EG': ['Paystack', 'Bank Transfer'],
  };
  
  return paymentMap[countryCode] || ['Paystack', 'Bank Transfer'];
}

// Estimate bandwidth usage
export function estimateBandwidth(dataSize: number): {
  time2g: number;
  time3g: number;
  time4g: number;
} {
  const speeds = {
    '2g': 14400, // bits per second
    '3g': 384000,
    '4g': 4000000,
  };

  return {
    time2g: (dataSize * 8) / speeds['2g'],
    time3g: (dataSize * 8) / speeds['3g'],
    time4g: (dataSize * 8) / speeds['4g'],
  };
}

// Language-specific form features
export function getLanguageConfig(language: string) {
  return {
    direction: language === 'ar' ? 'rtl' : 'ltr',
    dateFormat: language === 'ar' ? 'DD/MM/YYYY' : 'MM/DD/YYYY',
    timeFormat: language === 'ar' ? '24h' : '12h',
  };
}
