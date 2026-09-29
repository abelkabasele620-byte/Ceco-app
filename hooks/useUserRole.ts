import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'buyer' | 'seller' | 'courier' | 'admin' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole((data?.role as UserRole) || 'buyer');
      setLoading(false);
    };

    fetchRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { role, loading };
};
