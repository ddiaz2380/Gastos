// Configuración para Mercado Pago
// En producción, estas variables deben estar en variables de entorno

export const MERCADOPAGO_CONFIG = {
  // Claves de prueba (sandbox)
  PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-your-public-key',
  ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-your-access-token',
  
  // URLs de notificación
  NOTIFICATION_URL: process.env.NEXT_PUBLIC_APP_URL + '/api/mercadopago/notifications',
  SUCCESS_URL: process.env.NEXT_PUBLIC_APP_URL + '/payments/success',
  FAILURE_URL: process.env.NEXT_PUBLIC_APP_URL + '/payments/failure',
  PENDING_URL: process.env.NEXT_PUBLIC_APP_URL + '/payments/pending',
  
  // Configuración por país
  COUNTRIES: {
    AR: {
      currency: 'ARS',
      locale: 'es-AR',
      paymentMethods: ['visa', 'master', 'amex', 'naranja', 'cabal', 'cencosud', 'tarshop'],
    },
    BR: {
      currency: 'BRL',
      locale: 'pt-BR',
      paymentMethods: ['visa', 'master', 'amex', 'elo', 'hipercard', 'pix', 'bolbradesco'],
    },
    MX: {
      currency: 'MXN',
      locale: 'es-MX',
      paymentMethods: ['visa', 'master', 'amex', 'oxxo', 'bancomer', 'banamex'],
    },
    CO: {
      currency: 'COP',
      locale: 'es-CO',
      paymentMethods: ['visa', 'master', 'amex', 'efecty', 'pse'],
    },
    CL: {
      currency: 'CLP',
      locale: 'es-CL',
      paymentMethods: ['visa', 'master', 'amex', 'webpay'],
    },
    PE: {
      currency: 'PEN',
      locale: 'es-PE',
      paymentMethods: ['visa', 'master', 'amex', 'pagoefectivo'],
    },
    UY: {
      currency: 'UYU',
      locale: 'es-UY',
      paymentMethods: ['visa', 'master', 'amex', 'oca', 'lider'],
    },
  },
};

// Tipos para TypeScript
export interface MercadoPagoPayment {
  id: string;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  date_created: string;
  date_approved?: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  payment_method?: {
    id: string;
    type: string;
  };
  transaction_details?: {
    external_resource_url?: string;
  };
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
}

export interface MercadoPagoPreference {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer?: {
    email: string;
    name?: string;
    surname?: string;
    phone?: {
      area_code: string;
      number: string;
    };
    identification?: {
      type: string;
      number: string;
    };
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url?: string;
  auto_return?: 'approved' | 'all';
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
}

// Utilidades
export const formatCurrency = (amount: number, countryCode: string = 'AR') => {
  const config = MERCADOPAGO_CONFIG.COUNTRIES[countryCode as keyof typeof MERCADOPAGO_CONFIG.COUNTRIES];
  if (!config) return `$${amount.toLocaleString()}`;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
  }).format(amount);
};

export const getPaymentMethodsByCountry = (countryCode: string) => {
  const config = MERCADOPAGO_CONFIG.COUNTRIES[countryCode as keyof typeof MERCADOPAGO_CONFIG.COUNTRIES];
  return config?.paymentMethods || [];
};

export const getStatusMessage = (status: string, statusDetail: string) => {
  const messages: Record<string, string> = {
    'pending': 'Pago pendiente',
    'approved': 'Pago aprobado',
    'authorized': 'Pago autorizado',
    'in_process': 'Pago en proceso',
    'in_mediation': 'Pago en mediación',
    'rejected': 'Pago rechazado',
    'cancelled': 'Pago cancelado',
    'refunded': 'Pago reembolsado',
    'charged_back': 'Contracargo',
  };
  
  return messages[status] || 'Estado desconocido';
};