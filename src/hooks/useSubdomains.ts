import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Subdomain {
  id: string;
  subdomain: string;
  full_domain: string;
  record_type: "A" | "CNAME";
  record_value: string;
  proxied: boolean;
  status: "active" | "pending" | "failed" | "disabled";
  created_at: string;
}

export function useSubdomains() {
  const { session } = useAuth();
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubdomains = useCallback(async () => {
    if (!session) {
      setSubdomains([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("subdomains")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      toast.error("Failed to load subdomains");
    } else {
      setSubdomains(data || []);
    }
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    fetchSubdomains();
  }, [fetchSubdomains]);

  const createSubdomain = async (subdomain: string) => {
    if (!session) {
      toast.error("Please sign in to create a subdomain");
      return { success: false };
    }

    try {
      const response = await supabase.functions.invoke("cloudflare-dns", {
        body: {
          action: "create",
          subdomain,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to create subdomain");
      }

      toast.success("Subdomain created successfully!");
      await fetchSubdomains();
      return { success: true };
    } catch (err: any) {
      toast.error(err.message || "Failed to create subdomain");
      return { success: false, error: err.message };
    }
  };

  const deleteSubdomain = async (subdomainId: string) => {
    if (!session) {
      toast.error("Please sign in");
      return { success: false };
    }

    try {
      const response = await supabase.functions.invoke("cloudflare-dns", {
        body: {
          action: "delete",
          subdomainId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to delete subdomain");
      }

      toast.success("Subdomain deleted successfully!");
      await fetchSubdomains();
      return { success: true };
    } catch (err: any) {
      toast.error(err.message || "Failed to delete subdomain");
      return { success: false, error: err.message };
    }
  };

  const updateSubdomain = async (
    subdomainId: string,
    recordValue?: string,
    proxied?: boolean
  ) => {
    if (!session) {
      toast.error("Please sign in");
      return { success: false };
    }

    try {
      const response = await supabase.functions.invoke("cloudflare-dns", {
        body: {
          action: "update",
          subdomainId,
          recordValue,
          proxied,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to update subdomain");
      }

      toast.success("Subdomain updated successfully!");
      await fetchSubdomains();
      return { success: true };
    } catch (err: any) {
      toast.error(err.message || "Failed to update subdomain");
      return { success: false, error: err.message };
    }
  };

  return {
    subdomains,
    isLoading,
    error,
    createSubdomain,
    deleteSubdomain,
    updateSubdomain,
    refetch: fetchSubdomains,
  };
}
