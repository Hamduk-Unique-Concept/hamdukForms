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

    // Extract token properly - this is a JWT session token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token by getting the user from the JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log('[v0] Auth error:', authError);
      return NextResponse.json({ message: 'Unauthorized', error: authError?.message }, { status: 401 });
    }

    const {
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

    // Check if form exists
    const { data: existingForm, error: fetchError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('organization_id', organizationId)
      .single();

    if (existingForm) {
      // Update existing form
      const { error: updateError } = await supabase
        .from('forms')
        .update({
          title,
          description,
          settings: settings || {},
          theme_config: themeConfig || {},
          branding_config: brandingConfig || {},
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
            fields.map((field: any, index: number) => ({
              form_id: formId,
              field_type: field.type,
              field_key: field.key || `field_${index}`,
              label: field.label,
              placeholder: field.placeholder,
              help_text: field.helpText,
              default_value: field.defaultValue,
              is_required: field.required || false,
              validation_rules: field.validations || {},
              options: field.options || [],
              conditional_logic: field.conditionalLogic || [],
              order_index: index,
            }))
          );

        if (fieldsError) throw fieldsError;
      }

      return NextResponse.json(
        { message: 'Form saved successfully', formId },
        { status: 200 }
      );
    } else {
      // Create new form
      const generatedSlug = slug || `form-${Date.now()}`;

      const { data: newForm, error: insertError } = await supabase
        .from('forms')
        .insert({
          organization_id: organizationId,
          created_by: user.id,
          title,
          description,
          slug: generatedSlug,
          status: 'draft',
          is_published: false,
          settings: settings || {},
          theme_config: themeConfig || {},
          branding_config: brandingConfig || {},
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Insert fields
      if (fields && fields.length > 0) {
        const { error: fieldsError } = await supabase
          .from('form_fields')
          .insert(
            fields.map((field: any, index: number) => ({
              form_id: newForm.id,
              field_type: field.type,
              field_key: field.key || `field_${index}`,
              label: field.label,
              placeholder: field.placeholder,
              help_text: field.helpText,
              default_value: field.defaultValue,
              is_required: field.required || false,
              validation_rules: field.validations || {},
              options: field.options || [],
              conditional_logic: field.conditionalLogic || [],
              order_index: index,
            }))
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
