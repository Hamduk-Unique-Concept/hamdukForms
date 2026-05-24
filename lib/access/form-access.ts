import { getSupabaseClient } from '@/lib/supabase/client';
import type { NextRequest } from 'next/server';

export async function getAuthUser(request: NextRequest) {
  const supabase = getSupabaseClient();
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  return user || null;
}

export async function canManageForm(formId: string, userId: string) {
  const supabase = getSupabaseClient();
  const { data: form, error } = await supabase
    .from('forms')
    .select('id, organization_id, created_by')
    .eq('id', formId)
    .maybeSingle();

  if (error || !form) return false;
  if (form.created_by === userId) return true;

  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', form.organization_id)
    .eq('user_id', userId)
    .eq('is_active', true)
    .in('role', ['admin', 'editor'])
    .maybeSingle();

  return Boolean(member);
}

export async function canAccessOrganization(organizationId: string, userId: string) {
  const supabase = getSupabaseClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('id, owner_id')
    .eq('id', organizationId)
    .maybeSingle();

  if (!org) return false;
  if (org.owner_id === userId) return true;

  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  return Boolean(member);
}
