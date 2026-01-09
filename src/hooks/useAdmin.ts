import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  totalSubdomains: number;
  totalDonations: number;
}

interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  user_roles: { role: string }[];
}

interface AdminSubdomain {
  id: string;
  subdomain: string;
  full_domain: string;
  record_type: string;
  record_value: string;
  status: string;
  created_at: string;
  profiles: { name: string; email: string };
}

interface AdminDonation {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  profiles: { name: string; email: string } | null;
}

export function useAdmin() {
  const { session, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subdomains, setSubdomains] = useState<AdminSubdomain[]>([]);
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const callAdminAction = useCallback(async (action: string, data: any = {}) => {
    if (!session || !isAdmin) {
      toast.error("Admin access required");
      return null;
    }

    const response = await supabase.functions.invoke("admin-actions", {
      body: { action, ...data },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data.success) {
      throw new Error(response.data.error || "Action failed");
    }

    return response.data;
  }, [session, isAdmin]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await callAdminAction("get-stats");
      if (data) {
        setStats(data.stats);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [callAdminAction]);

  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await callAdminAction("get-users", { page, limit: 20 });
      if (data) {
        setUsers(data.users);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [callAdminAction]);

  const fetchSubdomains = useCallback(async (page = 1, status?: string) => {
    setIsLoading(true);
    try {
      const data = await callAdminAction("get-all-subdomains", { page, limit: 20, status });
      if (data) {
        setSubdomains(data.subdomains);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [callAdminAction]);

  const fetchDonations = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await callAdminAction("get-donations", { page, limit: 20 });
      if (data) {
        setDonations(data.donations);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [callAdminAction]);

  const disableSubdomain = async (subdomainId: string) => {
    try {
      await callAdminAction("disable-subdomain", { subdomainId });
      toast.success("Subdomain disabled");
      await fetchSubdomains();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteSubdomain = async (subdomainId: string) => {
    try {
      await callAdminAction("delete-subdomain", { subdomainId });
      toast.success("Subdomain deleted");
      await fetchSubdomains();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const setUserRole = async (targetUserId: string, role: "admin" | "user") => {
    try {
      await callAdminAction("set-user-role", { targetUserId, role });
      toast.success(`User role updated to ${role}`);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return {
    stats,
    users,
    subdomains,
    donations,
    isLoading,
    fetchStats,
    fetchUsers,
    fetchSubdomains,
    fetchDonations,
    disableSubdomain,
    deleteSubdomain,
    setUserRole,
  };
}
