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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { formId } = await request.json();

    if (!formId) {
      return NextResponse.json({ message: 'Form ID is required' }, { status: 400 });
    }

    // Get original form
    const { data: originalForm } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (!originalForm) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    // Verify user has access
    const { data: hasAccess } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', originalForm.organization_id)
      .eq('owner_id', user.id)
      .single();

    if (!hasAccess) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Create new form with copied data
    const { data: newForm, error: createError } = await supabase
      .from('forms')
      .insert({
        organization_id: originalForm.organization_id,
        created_by: user.id,
        title: `${originalForm.title} (Copy)`,
        description: originalForm.description,
        slug: `${originalForm.slug}-copy-${Date.now()}`,
        settings: originalForm.settings,
        theme_config: originalForm.theme_config,
        branding_config: originalForm.branding_config,
        is_published: false,
        status: 'draft',
      })
      .select('id')
      .single();

    if (createError) throw createError;

    // Get and duplicate fields
    const { data: fields } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', originalForm.id);

    if (fields && fields.length > 0) {
      const newFields = fields.map(field => ({
        form_id: newForm.id,
        field_type: field.field_type,
        field_key: field.field_key,
        label: field.label,
        placeholder: field.placeholder,
        help_text: field.help_text,
        default_value: field.default_value,
        is_required: field.is_required,
        validation_rules: field.validation_rules,
        options: field.options,
        order: field.order,
      }));

      await supabase.from('form_fields').insert(newFields);
    }

    return NextResponse.json(
      { message: 'Form duplicated successfully', newFormId: newForm.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[v0] Duplicate form error:', error);
    return NextResponse.json(
      { message: 'Failed to duplicate form' },
      { status: 500 }
    );
  }
}
