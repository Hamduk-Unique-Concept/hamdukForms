import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { checkFeatureAccess } from '@/lib/billing/feature-access';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const { name, description, type, fields, workspaceId, organizationId } = await request.json();

    // Get the user from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let resolvedOrganizationId = organizationId;
    if (!resolvedOrganizationId || resolvedOrganizationId === 'null') {
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle();

      resolvedOrganizationId = org?.id;
    }

    if (!resolvedOrganizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const access = await checkFeatureAccess(resolvedOrganizationId, 'max_forms');
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'PLAN_LIMIT_REACHED',
          feature: 'max_forms',
          limit: access.limit,
          usage: access.usage,
        },
        { status: 403 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .slice(0, 50);

    // Create the form
    const { data: form, error } = await supabase
      .from('forms')
      .insert([
        {
          name,
          description: description || '',
          slug,
          form_type: type || 'contact',
          workspace_id: workspaceId,
          organization_id: resolvedOrganizationId,
          created_by: user.id,
          is_draft: true,
          status: 'draft',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating form:', error);
      return NextResponse.json(
        { error: 'Failed to create form' },
        { status: 500 }
      );
    }

    // Add form fields
    if (fields && fields.length > 0) {
      const fieldsToInsert = fields.map((field: any, index: number) => ({
        form_id: form.id,
        field_order: index,
        field_type: field.type,
        label: field.label,
        placeholder: field.placeholder || '',
        field_key: field.type + '_' + index,
        is_required: field.required || false,
      }));

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert);

      if (fieldsError) {
        console.error('Error creating fields:', fieldsError);
        // Continue anyway - form was created
      }
    }

    await supabase.from('usage_tracking').upsert(
      {
        organization_id: resolvedOrganizationId,
        metric: 'forms_count',
        value: access.usage + 1,
        period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id,metric,period_start' }
    );

    return NextResponse.json({
      success: true,
      form: {
        id: form.id,
        name: form.name,
        slug: form.slug,
      },
    });
  } catch (error) {
    console.error('Error in form creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const workspaceId = searchParams.get('workspaceId');

    let query = supabase.from('forms').select('*');

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch forms' },
        { status: 500 }
      );
    }

    return NextResponse.json({ forms: data });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
