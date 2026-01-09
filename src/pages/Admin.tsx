import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Users,
  DollarSign,
  Shield,
  ArrowLeft,
  Loader2,
  Settings,
  Activity,
  Search,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentSettings from "@/components/admin/PaymentSettings";
import UserManagement from "@/components/admin/UserManagement";
import SubdomainManagement from "@/components/admin/SubdomainManagement";
import DonationManagement from "@/components/admin/DonationManagement";
import SystemStats from "@/components/admin/SystemStats";
import DNSChecker from "@/components/subdomain/DNSChecker";
import logo from "@/assets/logo.png";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <img src={logo} alt="M2H" className="w-8 h-8 rounded-lg" />
                <div>
                  <h1 className="text-lg font-bold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Admin Panel
                  </h1>
                  <p className="text-xs text-muted-foreground">M2H SubDomains Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDNSChecker(!showDNSChecker)}
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
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* DNS Checker Modal */}
        {showDNSChecker && (
          <div className="mb-8 glass-card p-6 animate-slide-up">
            <DNSChecker onClose={() => setShowDNSChecker(false)} />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8 h-12">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="subdomains" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Subdomains
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Donations
            </TabsTrigger>
            <TabsTrigger value="dns" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              DNS Tools
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

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
