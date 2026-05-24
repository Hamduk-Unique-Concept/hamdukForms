import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
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

    const { formId, action } = await request.json();

    if (!formId || !action) {
      return NextResponse.json(
        { message: 'formId and action are required' },
        { status: 400 }
      );
    }

    if (!['publish', 'unpublish'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get form and verify user has access
    const { data: form, error: fetchError } = await supabase
      .from('forms')
      .select('id, organization_id')
      .eq('id', formId)
      .single();

    if (fetchError || !form) {
      return NextResponse.json(
        { message: 'Form not found' },
        { status: 404 }
      );
    }

    // Verify user has access to the organization
    const { data: hasAccess } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', form.organization_id)
      .eq('owner_id', user.id)
      .single();

    const { data: isMember } = await supabase
      .from('user_organizations')
      .select('id')
      .eq('organization_id', form.organization_id)
      .eq('user_id', user.id)
      .single();

    if (!hasAccess && !isMember) {
      return NextResponse.json(
        { message: 'You do not have access to this form' },
        { status: 403 }
      );
    }

    // Update publish status on forms table
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

    // Get form slug for publish link
    const { data: updatedForm } = await supabase
      .from('forms')
      .select('slug')
      .eq('id', formId)
      .single();

    const formSlug = updatedForm?.slug;
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/forms/${formSlug}`;

    if (isPublished) {
      // Check if a publish link already exists
      const { data: existingLink } = await supabase
        .from('form_publish_links')
        .select('id')
        .eq('form_id', formId)
        .single();

      if (!existingLink) {
        const { error: linkError } = await supabase
          .from('form_publish_links')
          .insert({
            form_id: formId,
            publish_slug: formSlug,
            public_url: publicUrl,
            is_published: true,
            published_at: new Date(),
          });

        if (linkError) throw linkError;
      } else {
        await supabase
          .from('form_publish_links')
          .update({ is_published: true, published_at: new Date(), public_url: publicUrl })
          .eq('form_id', formId);
      }
    } else {
      await supabase
        .from('form_publish_links')
        .update({ is_published: false })
        .eq('form_id', formId);
    }

    return NextResponse.json(
      {
        message: `Form ${action}ed successfully`,
        formId,
        isPublished,
        publishableUrl: isPublished ? publicUrl : null,
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
    const supabase = getSupabaseClient();
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
