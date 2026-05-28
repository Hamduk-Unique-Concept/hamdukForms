import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

function settingBool(settings: any, ...keys: string[]) {
  return keys.some((key) => settings?.[key] === true || settings?.[key] === 'true');
}

function settingValue(settings: any, fallback: any, ...keys: string[]) {
  for (const key of keys) {
    if (settings?.[key] !== undefined && settings?.[key] !== null && settings?.[key] !== '') {
      return settings[key];
    }
  }
  return fallback;
}

function mapSettingsColumns(settings: any) {
  const maxResponses = settingValue(settings, null, 'maxResponses', 'max_responses');

  return {
    show_progress_bar: settingBool(settings, 'progressBar', 'showProgressOnScroll'),
    show_form_title: settingValue(settings, true, 'showFormTitle'),
    show_form_description: settingValue(settings, true, 'showFormDescription'),
    allow_multiple_responses: settingBool(settings, 'allowMultipleResponses'),
    limit_one_response_per_user: settingBool(settings, 'limitOnePerUser', 'oneResponsePerPerson'),
    max_responses: maxResponses ? Number(maxResponses) : null,
    require_password: settingBool(settings, 'requirePassword', 'passwordProtected'),
    form_password: settingValue(settings, null, 'formPassword', 'password'),
    scheduled_open_date: settingValue(settings, null, 'scheduledOpenDate', 'opensAt', 'openDate'),
    scheduled_close_date: settingValue(settings, null, 'scheduledCloseDate', 'closesAt', 'closeDate', 'expiresAt'),
    thank_you_page_enabled: settingBool(settings, 'thankYouPageEnabled'),
    thank_you_title: settingValue(settings, 'Thank you!', 'thankYouTitle'),
    thank_you_message: settingValue(settings, null, 'thankYouMessage'),
    redirect_url: settingValue(settings, null, 'redirectUrl'),
    collect_email: settingBool(settings, 'collectEmail'),
    collect_phone: settingBool(settings, 'collectPhone'),
  };
}

function parseSettings(settings: any) {
  if (typeof settings !== 'string') return settings || {};
  try {
    return JSON.parse(settings || '{}');
  } catch {
    return {};
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseClient();

  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { data: form } = await supabase
      .from('forms')
      .select('id, organization_id, created_by')
      .eq('id', id)
      .maybeSingle();

    if (!form) return NextResponse.json({ message: 'Form not found' }, { status: 404 });

    const { data: owner } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', form.organization_id)
      .eq('owner_id', user.id)
      .maybeSingle();

    const { data: member } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', form.organization_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!owner && !member && form.created_by !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { settings } = await request.json();
    const parsedSettings = parseSettings(settings);
    const { error } = await supabase
      .from('forms')
      .update({
        settings: typeof settings === 'string' ? settings : JSON.stringify(settings || {}),
        ...mapSettingsColumns(parsedSettings),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Form settings update error:', error);
    return NextResponse.json({ message: 'Failed to update form settings' }, { status: 500 });
  }
}
