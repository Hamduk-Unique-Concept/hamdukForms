import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');

    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('service, is_active, last_synced_at')
      .eq('user_id', userId);

    if (error) throw error;

    const integrationStatus: any = {
      googleDrive: { connected: false },
      oneDrive: { connected: false },
      slack: { connected: false },
      zapier: { connected: false },
      make: { connected: false },
      mailchimp: { connected: false },
    };

    integrations?.forEach(integration => {
      if (integration.service in integrationStatus) {
        integrationStatus[integration.service] = {
          connected: integration.is_active,
          lastSynced: integration.last_synced_at,
        };
      }
    });

    return NextResponse.json(integrationStatus);
  } catch (error) {
    console.error('Integration status error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch integration status' },
      { status: 500 }
    );
  }
}
