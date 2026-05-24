import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

function parseMaybeJson(value: any, fallback: any) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = getSupabaseClient();
  try {
    const { slug } = await params;

    // Get published form by slug
    const { data: publishLink, error: linkError } = await supabase
      .from('form_publish_links')
      .select('form_id, password')
      .eq('publish_slug', slug)
      .eq('is_published', true)
      .single();

    if (linkError || !publishLink) {
      return NextResponse.json(
        { message: 'Form not found' },
        { status: 404 }
      );
    }

    // Get form details
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, organization_id, title, description, settings, theme_config, branding_config')
      .eq('id', publishLink.form_id)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { message: 'Form not found' },
        { status: 404 }
      );
    }

    // Get form fields
    const { data: fields } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', form.id)
      .order('order_index');

    // Increment view count
    const { data: analytics } = await supabase
      .from('form_response_analytics')
      .select('views')
      .eq('form_id', publishLink.form_id)
      .maybeSingle();

    await supabase
      .from('form_response_analytics')
      .upsert(
        {
          form_id: publishLink.form_id,
          views: (analytics?.views || 0) + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'form_id' }
      );

    const normalizedFields = (fields || []).map((field: any) => ({
      ...field,
      options: parseMaybeJson(field.options, []),
      validation_rules: parseMaybeJson(field.validation_rules, {}),
      conditional_logic: parseMaybeJson(field.conditional_logic, {}),
    }));

    return NextResponse.json(
      { 
        form: {
          ...form,
          settings: parseMaybeJson(form.settings, {}),
          theme_config: parseMaybeJson(form.theme_config, {}),
          branding_config: parseMaybeJson(form.branding_config, {}),
        },
        fields: normalizedFields,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Form fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}
