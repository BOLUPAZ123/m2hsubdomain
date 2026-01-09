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
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentSettings from "@/components/admin/PaymentSettings";
import UserManagement from "@/components/admin/UserManagement";
import SubdomainManagement from "@/components/admin/SubdomainManagement";
import DonationManagement from "@/components/admin/DonationManagement";

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
          <div className="flex items-center gap-4 py-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subdomains">Subdomains</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total Users</p>
                    <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total Subdomains</p>
                    <p className="text-3xl font-bold">{stats?.totalSubdomains || 0}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total Donations</p>
                    <p className="text-3xl font-bold">₹{stats?.totalDonations?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
            </div>
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

          {/* Payments Tab */}
          <TabsContent value="payments">
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
