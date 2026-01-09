import { useState, useEffect } from "react";
import { 
  Activity, 
  Database, 
  HardDrive, 
  TrendingUp,
  Users,
  Globe,
  DollarSign,
  Clock,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SystemStatsProps {
  stats?: {
    totalUsers: number;
    totalSubdomains: number;
    totalDonations: number;
  };
}

const SystemStats = ({ stats }: SystemStatsProps) => {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchRecentActivity = async () => {
    setIsLoading(true);
    try {
      // Fetch recent subdomains
      const { data: recentSubs } = await supabase
        .from("subdomains")
        .select("id, subdomain, created_at, status")
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch recent donations
      const { data: recentDonations } = await supabase
        .from("donations")
        .select("id, amount, created_at, status")
        .order("created_at", { ascending: false })
        .limit(5);

      const activities = [
        ...(recentSubs || []).map(s => ({
          type: "subdomain",
          title: `${s.subdomain}.m2hgamerz.site`,
          time: s.created_at,
          status: s.status,
        })),
        ...(recentDonations || []).map(d => ({
          type: "donation",
          title: `₹${d.amount} donation`,
          time: d.created_at,
          status: d.status,
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

      setRecentActivity(activities);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const getActivityIcon = (type: string) => {
    return type === "subdomain" ? Globe : DollarSign;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "success":
        return "text-success";
      case "pending":
        return "text-warning";
      case "failed":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>

        <div className="glass-card p-5 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <p className="text-3xl font-bold">{stats?.totalSubdomains || 0}</p>
          <p className="text-sm text-muted-foreground">Active Subdomains</p>
        </div>

        <div className="glass-card p-5 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <Activity className="h-4 w-4 text-success" />
          </div>
          <p className="text-3xl font-bold">₹{stats?.totalDonations?.toFixed(0) || 0}</p>
          <p className="text-sm text-muted-foreground">Total Donations</p>
        </div>

        <div className="glass-card p-5 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-success" />
            </div>
            <span className="flex items-center gap-1 text-success text-xs">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-3xl font-bold">99.9%</p>
          <p className="text-sm text-muted-foreground">System Uptime</p>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              System Health
            </h3>
            <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
              All Systems Normal
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="w-1/4 h-full bg-success rounded-full" />
                </div>
                <span className="text-xs text-muted-foreground">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">DNS API</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="w-1/3 h-full bg-success rounded-full" />
                </div>
                <span className="text-xs text-muted-foreground">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auth Service</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="w-1/5 h-full bg-success rounded-full" />
                </div>
                <span className="text-xs text-muted-foreground">Healthy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={fetchRecentActivity}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-2">
              {recentActivity.slice(0, 5).map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "subdomain" ? "bg-primary/10" : "bg-success/10"
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        activity.type === "subdomain" ? "text-primary" : "text-success"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(activity.time)}</p>
                    </div>
                    <span className={`text-xs capitalize ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-3">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;
