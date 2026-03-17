import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For demo purposes, return mock security settings
    return NextResponse.json({
      twoFactorEnabled: false,
      ssoEnabled: false,
      lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      activeDevices: 2,
      dataEncryption: true,
    });
  } catch (error) {
    console.error('Security settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { setting, value } = await request.json();

    // Update security setting in database
    // This would typically update user settings in your database

    return NextResponse.json({
      success: true,
      setting,
      value,
    });
  } catch (error) {
    console.error('Security update error:', error);
    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    );
  }
}
