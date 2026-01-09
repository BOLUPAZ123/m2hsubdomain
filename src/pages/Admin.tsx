import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Globe2,
  Users,
  DollarSign,
  Shield,
  ArrowLeft,
  Loader2,
  Settings,
  Activity,
  Search,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentSettings from "@/components/admin/PaymentSettings";
import UserManagement from "@/components/admin/UserManagement";
import SubdomainManagement from "@/components/admin/SubdomainManagement";
import DonationManagement from "@/components/admin/DonationManagement";
import SystemStats from "@/components/admin/SystemStats";
import SupportTicketManagement from "@/components/admin/SupportTicketManagement";
import SubdomainLimitSettings from "@/components/admin/SubdomainLimitSettings";
import DNSChecker from "@/components/subdomain/DNSChecker";
import { MessageCircle, Sliders } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const {
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
    bulkDisableSubdomains,
    bulkDeleteSubdomains,
    exportUsers,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState("overview");
  const [showDNSChecker, setShowDNSChecker] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "users") fetchUsers();
      if (activeTab === "subdomains") fetchSubdomains();
      if (activeTab === "donations") fetchDonations();
    }
  }, [activeTab, isAdmin, fetchUsers, fetchSubdomains, fetchDonations]);

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabItems = [
    { value: "overview", label: "Overview", icon: Activity },
    { value: "users", label: "Users", icon: Users },
    { value: "subdomains", label: "Subdomains", icon: Globe },
    { value: "donations", label: "Donations", icon: DollarSign },
    { value: "support", label: "Support", icon: MessageCircle },
    { value: "limits", label: "Limits", icon: Sliders },
    { value: "dns", label: "DNS Tools", icon: Search },
    { value: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3 md:py-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors btn-press">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                  <Globe2 className="w-4 h-4 text-background" />
                </div>
                <div>
                  <h1 className="text-sm md:text-lg font-semibold tracking-tight flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    Admin Panel
                  </h1>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">M2H SubDomains Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDNSChecker(!showDNSChecker)}
                className="hidden md:flex btn-press"
              >
                <Search className="h-4 w-4 mr-2" />
                DNS Checker
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  fetchStats();
                  if (activeTab === "users") fetchUsers();
                  if (activeTab === "subdomains") fetchSubdomains();
                  if (activeTab === "donations") fetchDonations();
                }}
                className="btn-press"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden btn-press"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Tab Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-1 animate-slide-down">
              {tabItems.map((tab, idx) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 animate-fade-in ${
                    activeTab === tab.value 
                      ? "bg-secondary text-foreground font-medium" 
                      : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* DNS Checker Modal */}
        {showDNSChecker && (
          <div className="mb-6 vercel-card p-5 animate-scale-in">
            <DNSChecker onClose={() => setShowDNSChecker(false)} />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Desktop Tabs */}
          <TabsList className="hidden md:flex w-full mb-8 h-11 p-1 bg-secondary/30 rounded-lg gap-1">
            {tabItems.map((tab, idx) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className={`flex-1 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm animate-fade-in`}
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Mobile Current Tab Indicator */}
          <div className="md:hidden mb-5 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-medium">
              {tabItems.find(t => t.value === activeTab)?.icon && (
                <span className="text-primary">
                  {(() => {
                    const Icon = tabItems.find(t => t.value === activeTab)?.icon;
                    return Icon ? <Icon className="h-4 w-4" /> : null;
                  })()}
                </span>
              )}
              {tabItems.find(t => t.value === activeTab)?.label}
            </div>
            <Button variant="outline" size="sm" onClick={() => setMobileMenuOpen(true)} className="btn-press">
              <Menu className="h-4 w-4 mr-1" />
              Menu
            </Button>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <SystemStats stats={stats as any} />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement
              users={users as any}
              isLoading={isLoading}
              onSetRole={setUserRole}
              onExport={exportUsers}
            />
          </TabsContent>

          {/* Subdomains Tab */}
          <TabsContent value="subdomains">
            <SubdomainManagement
              subdomains={subdomains as any}
              isLoading={isLoading}
              onDisable={disableSubdomain}
              onDelete={deleteSubdomain}
              onBulkDisable={bulkDisableSubdomains}
              onBulkDelete={bulkDeleteSubdomains}
              onFilterChange={(status) => fetchSubdomains(1, status || undefined)}
            />
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <DonationManagement donations={donations as any} isLoading={isLoading} />
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <SupportTicketManagement />
          </TabsContent>

          {/* Limits Tab */}
          <TabsContent value="limits">
            <SubdomainLimitSettings />
          </TabsContent>

          {/* DNS Tools Tab */}
          <TabsContent value="dns">
            <div className="max-w-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1">DNS Health Tools</h2>
                <p className="text-muted-foreground">Check DNS resolution status for any subdomain</p>
              </div>
              <div className="glass-card p-6">
                <DNSChecker />
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="max-w-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1">Payment Gateway Settings</h2>
                <p className="text-muted-foreground">Configure Cashfree payment integration</p>
              </div>
              <PaymentSettings />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
