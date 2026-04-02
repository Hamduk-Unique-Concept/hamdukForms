import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log('[v0] Auth error in publish:', authError);
      return NextResponse.json({ message: 'Unauthorized', error: authError?.message }, { status: 401 });
    }

    const { formId, organizationId, action } = await request.json();

    if (!['publish', 'unpublish'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }

    // Verify user has access to this form
    const { data: form, error: fetchError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError || !form) {
      return NextResponse.json(
        { message: 'Form not found' },
        { status: 404 }
      );
    }

    // Update publish status
    const isPublished = action === 'publish';
    const { error: updateError } = await supabase
      .from('forms')
      .update({
        is_published: isPublished,
        status: isPublished ? 'published' : 'draft',
        published_at: isPublished ? new Date() : null,
        updated_at: new Date(),
      })
      .eq('id', formId);

    if (updateError) throw updateError;

    // Get publishable URL
    const { data: updatedForm } = await supabase
      .from('forms')
      .select('slug')
      .eq('id', formId)
      .single();

    const publishableUrl = isPublished
      ? `${process.env.NEXT_PUBLIC_APP_URL}/forms/${updatedForm?.slug}`
      : null;

    return NextResponse.json(
      {
        message: `Form ${action}ed successfully`,
        formId,
        isPublished,
        publishableUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Form publish error:', error);
    return NextResponse.json(
      { message: 'Failed to publish form' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve form publish status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const formId = searchParams.get('formId');

    if (!formId) {
      return NextResponse.json(
        { message: 'Form ID is required' },
        { status: 400 }
      );
    }

    const { data: form, error } = await supabase
      .from('forms')
      .select('id, is_published, slug, published_at')
      .eq('id', formId)
      .single();

    if (error || !form) {
      return NextResponse.json(
        { message: 'Form not found' },
        { status: 404 }
      );
    }

    const publishableUrl = form.is_published
      ? `${process.env.NEXT_PUBLIC_APP_URL}/forms/${form.slug}`
      : null;

    return NextResponse.json(
      {
        formId,
        isPublished: form.is_published,
        publishableUrl,
        publishedAt: form.published_at,
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
