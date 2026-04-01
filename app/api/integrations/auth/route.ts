import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');
    const { integrationId, apiKey, accessToken } = await request.json();

    if (!integrationId) {
      return NextResponse.json(
        { message: 'Integration ID is required' },
        { status: 400 }
      );
    }

    // Store integration connection securely
    const { error } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: userId,
        integration_id: integrationId,
        api_key: apiKey,
        access_token: accessToken,
        is_connected: true,
        connected_at: new Date().toISOString(),
      }, { onConflict: 'user_id,integration_id' });

    if (error) throw error;

    return NextResponse.json(
      { message: `${integrationId} connected successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Integration auth error:', error);
    return NextResponse.json(
      { message: 'Failed to connect integration' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');
    const { integrationId } = await request.json();

    const { error } = await supabase
      .from('user_integrations')
      .update({ is_connected: false })
      .eq('user_id', userId)
      .eq('integration_id', integrationId);

    if (error) throw error;

    return NextResponse.json(
      { message: 'Integration disconnected' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Integration disconnect error:', error);
    return NextResponse.json(
      { message: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
