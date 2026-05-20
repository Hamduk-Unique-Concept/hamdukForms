import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
    // Get user's API keys from database
    // For demo, return mock data
    return NextResponse.json({
      keys: [
        {
          id: 'key_1',
          name: 'Production',
          key: 'hdk_prod_key_here',
          maskedKey: 'hdk_prod...here',
          created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          rateLimit: 10000,
          requestsUsed: 3451,
        },
      ],
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
    const { name } = await request.json();

    const apiKey = generateApiKey();

    // Store API key in database (hashed)
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        name,
        key_hash: crypto.createHash('sha256').update(apiKey).digest('hex'),
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
