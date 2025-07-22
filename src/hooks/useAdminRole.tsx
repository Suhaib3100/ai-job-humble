

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdminRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaffAdmin, setIsStaffAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  useEffect(() => {
    const checkRoles = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        if (error) {
          setIsAdmin(false);
          setIsStaffAdmin(false);
        } else {
          setIsAdmin(data?.some((r: any) => r.role === 'admin'));
          setIsStaffAdmin(data?.some((r: any) => r.role === 'staff_admin'));
        }
      } else {
        setIsAdmin(false);
        setIsStaffAdmin(false);
      }
      setAdminCheckComplete(true);
    };
    checkRoles();
  }, [user]);

  return { isAdmin, isStaffAdmin, adminCheckComplete };
};
