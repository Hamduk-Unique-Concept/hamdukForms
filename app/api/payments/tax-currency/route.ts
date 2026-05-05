import { NextRequest, NextResponse } from 'next/server';

const EXCHANGE_RATES: Record<string, number> = {
  'NGN': 1,
  'USD': 0.00063,
  'EUR': 0.00058,
  'GBP': 0.0005,
  'KES': 0.0073,
  'UGX': 2.35,
  'GHS': 0.0072,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, taxRate, fromCurrency, toCurrency, country, category } = body;

    if (!action) {
      return NextResponse.json(
        { message: 'Action is required' },
        { status: 400 }
      );
    }

    if (action === 'calculate_tax') {
      if (!amount || !taxRate) {
        return NextResponse.json(
          { message: 'Amount and taxRate are required' },
          { status: 400 }
        );
      }

      const tax = amount * (taxRate / 100);
      const total = amount + tax;

      return NextResponse.json(
        {
          amount,
          taxRate,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100,
          country,
          category,
        },
        { status: 200 }
      );
    }

    if (action === 'convert_currency') {
      if (!amount || !fromCurrency || !toCurrency) {
        return NextResponse.json(
          { message: 'Amount, fromCurrency, and toCurrency are required' },
          { status: 400 }
        );
      }

      const fromRate = EXCHANGE_RATES[fromCurrency];
      const toRate = EXCHANGE_RATES[toCurrency];

      if (!fromRate || !toRate) {
        return NextResponse.json(
          { message: 'Unsupported currency' },
          { status: 400 }
        );
      }

      // Convert to NGN first, then to target currency
      const amountInNGN = amount / fromRate;
      const convertedAmount = amountInNGN * toRate;

      return NextResponse.json(
        {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: Math.round(convertedAmount * 100) / 100,
          targetCurrency: toCurrency,
          exchangeRate: (toRate / fromRate).toFixed(6),
        },
        { status: 200 }
      );
    }

    if (action === 'get_exchange_rates') {
      return NextResponse.json(
        {
          baseCurrency: 'NGN',
          rates: EXCHANGE_RATES,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[v0] Tax/Currency calculation error:', error);
    return NextResponse.json(
      { message: error.message || 'Calculation failed' },
      { status: 500 }
    );
  }
}
