import { useAuth } from '@/app/providers';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export function useOrganization() {
  const { user, session } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!user || !session?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          session.access_token
        );

        // Get user's default organization
        const { data: org, error } = await supabase
          .from('organizations')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1)
          .single();

        if (org) {
          setOrganizationId(org.id);
          localStorage.setItem('organizationId', org.id);
        } else if (error?.code === 'PGRST116') {
          console.log('[v0] No organization found, will be created on first form save');
        }
      } catch (err) {
        console.error('[v0] Error fetching organization:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [user, session?.access_token]);

  return { organizationId, loading };
}
