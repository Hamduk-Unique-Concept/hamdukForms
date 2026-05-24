import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { checkFeatureAccess } from '@/lib/billing/feature-access';

function serializeColumnValue(value: any, fallback: any) {
  const normalized = value ?? fallback;
  return typeof normalized === 'string' ? normalized : JSON.stringify(normalized);
}

async function getOrCreateDefaultWorkspace(
  supabase: ReturnType<typeof getSupabaseClient>,
  organizationId: string,
  userId: string
) {
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('organization_id', organizationId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (workspace?.id) return workspace.id;

  const { data: created, error } = await supabase
    .from('workspaces')
    .insert({
      organization_id: organizationId,
      name: 'Default Workspace',
      is_default: true,
      created_by: userId,
    })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

function mapFieldForInsert(field: any, formId: string, index: number) {
  return {
    form_id: formId,
    field_type: field.type,
    field_key: field.key || `field_${index}`,
    label: field.label,
    placeholder: field.placeholder,
    help_text: field.helpText,
    default_value: field.defaultValue,
    is_required: field.required || false,
    validation_rules: serializeColumnValue(field.validations, {}),
    options: serializeColumnValue(field.options, []),
    conditional_logic: field.conditionalLogic || {},
    order_index: String(index),
    field_order: index,
  };
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract token properly - this is a JWT session token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token by getting the user from the JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log('[v0] Auth error:', authError);
      return NextResponse.json({ message: 'Unauthorized', error: authError?.message }, { status: 401 });
    }

    let {
      formId,
      organizationId,
      title,
      description,
      slug,
      fields,
      settings,
      themeConfig,
      brandingConfig,
    } = await request.json();

    // If no organizationId, get user's default organization
    if (!organizationId || organizationId === '') {
      const { data: userOrg, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .single();

      if (orgError || !userOrg) {
        console.log('[v0] Error fetching default org:', orgError);
        return NextResponse.json({ message: 'No organization found. Please create one first.' }, { status: 400 });
      }

      organizationId = userOrg.id;
      console.log('[v0] Using default organization:', organizationId);
    }

    const workspaceId = await getOrCreateDefaultWorkspace(supabase, organizationId, user.id);

    // Check if form exists
    const { data: existingForm } = formId
      ? await supabase
          .from('forms')
          .select('id')
          .eq('id', formId)
          .eq('organization_id', organizationId)
          .maybeSingle()
      : { data: null };

    if (existingForm) {
      // Update existing form
      const { error: updateError } = await supabase
        .from('forms')
        .update({
          title,
          description,
          name: title,
          workspace_id: workspaceId,
          settings: serializeColumnValue(settings, {}),
          theme_config: serializeColumnValue(themeConfig, {}),
          branding_config: serializeColumnValue(brandingConfig, {}),
          updated_at: new Date(),
        })
        .eq('id', formId);

      if (updateError) throw updateError;

      // Update fields
      // First delete old fields
      await supabase.from('form_fields').delete().eq('form_id', formId);

      // Insert new fields
      if (fields && fields.length > 0) {
        const { error: fieldsError } = await supabase
          .from('form_fields')
          .insert(
            fields.map((field: any, index: number) => mapFieldForInsert(field, formId, index))
          );

        if (fieldsError) throw fieldsError;
      }

      return NextResponse.json(
        { message: 'Form saved successfully', formId },
        { status: 200 }
      );
    } else {
      const access = await checkFeatureAccess(organizationId, 'max_forms');
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

      // Create new form
      const generatedSlug = slug || `form-${Date.now()}`;

      const { data: newForm, error: insertError } = await supabase
        .from('forms')
        .insert({
          organization_id: organizationId,
          workspace_id: workspaceId,
          created_by: user.id,
          name: title,
          title,
          description,
          slug: generatedSlug,
          status: 'draft',
          is_published: false,
          settings: serializeColumnValue(settings, {}),
          theme_config: serializeColumnValue(themeConfig, {}),
          branding_config: serializeColumnValue(brandingConfig, {}),
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      await supabase.from('usage_tracking').upsert(
        {
          organization_id: organizationId,
          metric: 'forms_count',
          value: access.usage + 1,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,metric,period_start' }
      );

      // Insert fields
      if (fields && fields.length > 0) {
        const { error: fieldsError } = await supabase
          .from('form_fields')
          .insert(
            fields.map((field: any, index: number) => mapFieldForInsert(field, newForm.id, index))
          );

        if (fieldsError) throw fieldsError;
      }

      return NextResponse.json(
        { message: 'Form created successfully', formId: newForm.id },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Form save error:', error);
    return NextResponse.json(
      { message: 'Failed to save form' },
      { status: 500 }
    );
  }
}
