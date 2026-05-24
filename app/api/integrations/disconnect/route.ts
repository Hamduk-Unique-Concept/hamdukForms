import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');
    const { service } = await request.json();

    if (!service) {
      return NextResponse.json(
        { message: 'Service is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('user_id', userId)
      .eq('service', service);

    if (error) throw error;

    return NextResponse.json(
      { message: 'Integration disconnected successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { message: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
