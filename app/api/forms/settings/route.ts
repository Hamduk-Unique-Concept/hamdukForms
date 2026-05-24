import { getSupabaseClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = getSupabaseClient();
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');

    if (!formId) {
      return NextResponse.json(
        { message: 'formId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('form_settings')
      .select('*')
      .eq('form_id', formId)
      .single();

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { formId, settings } = await request.json();

    if (!formId || !settings) {
      return NextResponse.json(
        { message: 'formId and settings are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('form_settings')
      .upsert({
        form_id: formId,
        ...settings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'form_id'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
