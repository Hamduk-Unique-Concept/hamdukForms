import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkFeatureAccess } from '@/lib/billing/feature-access';

function generateApiKey(): string {
  return 'hdk_' + crypto.randomBytes(32).toString('hex');
}

function maskApiKey(key: string): string {
  const start = key.substring(0, 7);
  const end = key.substring(key.length - 4);
  return `${start}...${end}`;
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = request.nextUrl.searchParams.get('organizationId');
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const access = await checkFeatureAccess(organizationId, 'api_access');
    if (!access.allowed) {
      return NextResponse.json(
        { error: 'PLAN_LIMIT_REACHED', feature: 'api_access', limit: access.limit },
        { status: 403 }
      );
    }

    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, created_at, rate_limit')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      keys: (keys || []).map((key) => ({
        id: key.id,
        name: key.name,
        maskedKey: `${key.key_prefix || 'hdk'}...`,
        created: key.created_at,
        rateLimit: key.rate_limit || 10000,
        requestsUsed: 0,
      })),
    });
  } catch (error) {
    console.error('API keys error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, organizationId } = await request.json();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const access = await checkFeatureAccess(organizationId, 'api_access');
    if (!access.allowed) {
      return NextResponse.json(
        { error: 'PLAN_LIMIT_REACHED', feature: 'api_access', limit: access.limit },
        { status: 403 }
      );
    }

    const apiKey = generateApiKey();
    const keyPrefix = apiKey.substring(0, 11);

    // Store API key in database (hashed)
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        name,
        key_hash: crypto.createHash('sha256').update(apiKey).digest('hex'),
        key_prefix: keyPrefix,
        organization_id: organizationId,
        rate_limit: 10000,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      name,
      key: apiKey,
      maskedKey: maskApiKey(apiKey),
      created: data.created_at,
      rateLimit: data.rate_limit,
      requestsUsed: 0,
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
