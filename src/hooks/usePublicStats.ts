import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PublicStats {
  totalSubdomains: number;
  totalUsers: number;
  uptime: number;
  responseTime: number;
  isLoading: boolean;
}

export const usePublicStats = (): PublicStats => {
  const [stats, setStats] = useState<PublicStats>({
    totalSubdomains: 0,
    totalUsers: 0,
    uptime: 99.9,
    responseTime: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const startTime = performance.now();
      
      try {
        // Fetch subdomain count
        const { count: subdomainCount } = await supabase
          .from("subdomains")
          .select("*", { count: "exact", head: true });

        // Fetch user count from profiles
        const { count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        setStats({
          totalSubdomains: subdomainCount || 0,
          totalUsers: userCount || 0,
          uptime: 99.9,
          responseTime,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching public stats:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};
