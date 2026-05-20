import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

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
      .select('id, title, description, settings, theme_config, branding_config')
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
    await supabase
      .from('form_response_analytics')
      .update({ views: publishLink.form_id })
      .eq('form_id', publishLink.form_id);

    return NextResponse.json(
      { 
        form,
        fields: fields || [],
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
