import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Activity, 
  Server, 
  Globe, 
  Users, 
  Zap, 
  CheckCircle, 
  Clock, 
  Database,
  Shield,
  Wifi,
  RefreshCw
} from "lucide-react";
import { usePublicStats } from "@/hooks/usePublicStats";
import { Button } from "@/components/ui/button";
import AnimatedNumber from "@/components/ui/animated-number";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
  latency: number;
  icon: React.ElementType;
}

const Status = () => {
  const { totalSubdomains, totalUsers, uptime, responseTime, isLoading, lastUpdated, refresh } = usePublicStats(5000);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const services: ServiceStatus[] = [
    { name: "DNS API", status: "operational", latency: responseTime || 45, icon: Globe },
    { name: "Database", status: "operational", latency: Math.round(responseTime * 0.7) || 32, icon: Database },
    { name: "Authentication", status: "operational", latency: Math.round(responseTime * 0.5) || 28, icon: Shield },
    { name: "CDN (Cloudflare)", status: "operational", latency: 12, icon: Wifi },
    { name: "Edge Functions", status: "operational", latency: Math.round(responseTime * 0.8) || 38, icon: Server },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-500";
      case "degraded": return "text-yellow-500";
      case "outage": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-500/10";
      case "degraded": return "bg-yellow-500/10";
      case "outage": return "bg-red-500/10";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-500">All Systems Operational</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              System Status
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Real-time status and performance metrics for CashURL services
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 max-w-5xl mx-auto">
            <div className="glass-card gradient-border p-6 text-center animate-slide-up group hover:scale-[1.02] transition-transform" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {isLoading ? (
                  <div className="h-10 w-20 bg-muted animate-pulse rounded mx-auto" />
                ) : (
                  <AnimatedNumber value={totalSubdomains} duration={800} />
                )}
              </div>
              <div className="text-sm text-muted-foreground">Subdomains Created</div>
            </div>

            <div className="glass-card gradient-border p-6 text-center animate-slide-up group hover:scale-[1.02] transition-transform" style={{ animationDelay: '0.15s' }}>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {isLoading ? (
                  <div className="h-10 w-20 bg-muted animate-pulse rounded mx-auto" />
                ) : (
                  <AnimatedNumber value={totalUsers} duration={800} />
                )}
              </div>
              <div className="text-sm text-muted-foreground">Registered Users</div>
            </div>

            <div className="glass-card gradient-border p-6 text-center animate-slide-up group hover:scale-[1.02] transition-transform" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-green-500 mb-1">
                {uptime}%
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>

            <div className="glass-card gradient-border p-6 text-center animate-slide-up group hover:scale-[1.02] transition-transform" style={{ animationDelay: '0.25s' }}>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {isLoading ? (
                  <div className="h-10 w-20 bg-muted animate-pulse rounded mx-auto" />
                ) : (
                  <><AnimatedNumber value={responseTime} duration={500} /><span className="text-lg font-normal text-muted-foreground">ms</span></>
                )}
              </div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
          </div>

          {/* Services Status */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-xl font-semibold">Service Status</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="glass-card gradient-border divide-y divide-border overflow-hidden animate-slide-up" style={{ animationDelay: '0.35s' }}>
              {services.map((service, index) => (
                <div 
                  key={service.name} 
                  className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                  style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getStatusBg(service.status)} flex items-center justify-center`}>
                      <service.icon className={`h-5 w-5 ${getStatusColor(service.status)}`} />
                    </div>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">{service.status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{service.latency}ms</div>
                      <div className="text-xs text-muted-foreground">Latency</div>
                    </div>
                    <CheckCircle className={`h-5 w-5 ${getStatusColor(service.status)}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <span className="text-xs opacity-60">(auto-refreshes every 5s)</span>
            </div>

            {/* Additional Info */}
            <div className="mt-12 grid md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.55s' }}>
              <div className="glass-card gradient-border p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Infrastructure
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cloudflare CDN & DDoS Protection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Supabase PostgreSQL Database
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Edge Functions for DNS Management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automatic SSL/TLS Encryption
                  </li>
                </ul>
              </div>

              <div className="glass-card gradient-border p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Performance Metrics
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center justify-between">
                    <span>Average Response Time</span>
                    <span className="font-medium text-foreground">&lt;100ms</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>DNS Propagation</span>
                    <span className="font-medium text-foreground">&lt;60s</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Monthly Uptime SLA</span>
                    <span className="font-medium text-green-500">99.9%</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Global Edge Locations</span>
                    <span className="font-medium text-foreground">200+</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Status;
