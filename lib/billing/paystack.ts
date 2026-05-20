const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitializeParams {
  email: string;
  amount: number; // in kobo (1 NGN = 100 kobo)
  reference: string;
  metadata?: Record<string, any>;
  callback_url?: string;
  plan?: string; // Plan code for subscriptions
  invoiceLimit?: number; // For subscriptions
}

export interface PaystackVerifyParams {
  reference: string;
}

export interface PaystackResponse<T = any> {
  status: boolean;
  message: string;
  data?: T;
}

export class PaystackClient {
  private secretKey: string;

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY environment variable is not set');
    }
    this.secretKey = secretKey;
  }

  async initialize(params: PaystackInitializeParams): Promise<PaystackResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Paystack initialization failed: ${response.statusText}`);
    }

    return response.json();
  }

  async verify(params: PaystackVerifyParams): Promise<PaystackResponse> {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${params.reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Paystack verification failed: ${response.statusText}`);
    }

    return response.json();
  }

  async createPlan(params: {
    name: string;
    description?: string;
    amount: number; // in kobo
    interval: 'monthly' | 'yearly' | 'quarterly' | 'biannually';
  }): Promise<PaystackResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Paystack plan creation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async createSubscription(params: {
    customer: string; // Email or customer code
    plan: string; // Plan code
    authorization?: string; // Customer authorization code
    start_date?: string; // ISO 8601 format
  }): Promise<PaystackResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Paystack subscription creation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async disableSubscription(params: {
    code: string; // Subscription code
    token: string; // Email token
  }): Promise<PaystackResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/disable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Paystack subscription disable failed: ${response.statusText}`);
    }

    return response.json();
  }

  async enableSubscription(params: {
    code: string; // Subscription code
    token: string; // Email token
  }): Promise<PaystackResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/enable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Paystack subscription enable failed: ${response.statusText}`);
    }

    return response.json();
  }
}

let paystackInstance: PaystackClient | null = null;

export function getPaystackClient(): PaystackClient {
  if (!paystackInstance) {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) {
      throw new Error('PAYSTACK_SECRET_KEY environment variable is not set');
    }
    paystackInstance = new PaystackClient(key);
  }
  return paystackInstance;
}

// Backwards compatibility proxy
export const paystack = new Proxy({} as PaystackClient, {
  get: (target, prop) => {
    return (getPaystackClient() as any)[prop];
  },
});
