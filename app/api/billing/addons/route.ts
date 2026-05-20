import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { data: addons, error } = await supabase
      .from('addon_products')
      .select('*')
      .eq('active', true)
      .order('addon_type');

    if (error) throw error;

    return NextResponse.json(
      {
        addons: addons?.map((addon) => ({
          id: addon.id,
          addon_type: addon.addon_type,
          display_name: addon.display_name,
          description: addon.description,
          unit_price: addon.unit_price,
          currency: addon.currency,
          is_recurring: addon.is_recurring,
          billing_interval: addon.billing_interval,
          stripe_price_id: addon.is_recurring ? addon.stripe_price_id_monthly : addon.stripe_price_id,
        })) || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Get addons error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch add-ons' },
      { status: 500 }
    );
  }
}
