import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Globe, Users, DollarSign, Shield, ArrowLeft,
  Loader2, Ban, Trash2, ExternalLink, Check, CreditCard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentSettings from "@/components/admin/PaymentSettings";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { 
    stats, users, subdomains, donations, isLoading,
    fetchStats, fetchUsers, fetchSubdomains, fetchDonations,
    disableSubdomain, deleteSubdomain
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-success/20 text-success border-success/30",
      pending: "bg-warning/20 text-warning border-warning/30",
      failed: "bg-destructive/20 text-destructive border-destructive/30",
      disabled: "bg-muted/50 text-muted-foreground border-muted",
      success: "bg-success/20 text-success border-success/30",
    };
    return styles[status] || styles.pending;
  };

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
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">All Users</h2>
              </div>
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {user.user_roles?.some(r => r.role === 'admin') && (
                          <span className="px-2 py-1 rounded-full text-xs border bg-primary/20 text-primary border-primary/30">
                            Admin
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Subdomains Tab */}
          <TabsContent value="subdomains">
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">All Subdomains</h2>
              </div>
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {subdomains.map((sub) => (
                    <div key={sub.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium font-mono">{sub.full_domain}</span>
                          <a 
                            href={`https://${sub.full_domain}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Owner: {sub.profiles?.name} ({sub.profiles?.email})
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs border capitalize ${getStatusBadge(sub.status)}`}>
                          {sub.status}
                        </span>
                        {sub.status !== 'disabled' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => disableSubdomain(sub.id)}
                            className="text-warning hover:text-warning"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSubdomain(sub.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">Donation History</h2>
              </div>
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </div>
              ) : donations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No donations yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {donations.map((donation) => (
                    <div key={donation.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {donation.profiles?.name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {donation.profiles?.email || 'Guest donation'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs border capitalize ${getStatusBadge(donation.status)}`}>
                          {donation.status}
                        </span>
                        <span className="font-bold text-success">
                          {donation.currency} {donation.amount}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
