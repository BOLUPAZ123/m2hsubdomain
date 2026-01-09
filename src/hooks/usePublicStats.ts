import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PublicStats {
  totalSubdomains: number;
  totalUsers: number;
  uptime: number;
  responseTime: number;
  isLoading: boolean;
  lastUpdated: Date;
}

export const usePublicStats = (refreshInterval = 10000): PublicStats & { refresh: () => void } => {
  const [stats, setStats] = useState<PublicStats>({
    totalSubdomains: 0,
    totalUsers: 0,
    uptime: 99.9,
    responseTime: 0,
    isLoading: true,
    lastUpdated: new Date(),
  });

  const fetchStats = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      // Use the secure database function to get public stats
      const { data, error } = await supabase.rpc('get_public_stats');

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error) {
        console.error("Error fetching public stats:", error);
        setStats((prev) => ({ ...prev, isLoading: false, lastUpdated: new Date() }));
        return;
      }

      const statsData = data as { total_subdomains: number; total_users: number } | null;

      setStats({
        totalSubdomains: statsData?.total_subdomains || 0,
        totalUsers: statsData?.total_users || 0,
        uptime: 99.9,
        responseTime,
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching public stats:", error);
      setStats((prev) => ({ ...prev, isLoading: false, lastUpdated: new Date() }));
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Set up interval for continuous updates
    const interval = setInterval(fetchStats, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  return { ...stats, refresh: fetchStats };
};

