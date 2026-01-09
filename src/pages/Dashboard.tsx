import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Globe,
  Plus,
  LogOut,
  Home,
  Heart,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  Loader2,
  Shield,
  Settings,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubdomains } from "@/hooks/useSubdomains";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { subdomains, isLoading, createSubdomain, deleteSubdomain } = useSubdomains();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check subdomain limit (5 total)
    if (subdomains.length >= 5) {
      toast.error("You've reached the maximum limit of 5 subdomains");
      return;
    }

    setIsCreating(true);

    // With wildcard DNS, we just save to database - no DNS record creation needed
    const result = await createSubdomain(subdomain);

    if (result.success) {
      setShowCreateForm(false);
      setSubdomain("");
      toast.success(`${subdomain}.cashurl.shop is now live!`);
    }
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    await deleteSubdomain(id);
    setIsDeleting(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "status-active",
      pending: "status-pending",
      failed: "status-failed",
      disabled: "bg-muted text-muted-foreground border-muted",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 border-r border-border bg-background hidden lg:block">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-foreground" />
            <span className="font-semibold text-sm">CashURL</span>
          </Link>
        </div>

        <nav className="p-2 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-foreground text-sm"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-sm"
          >
            <Settings className="h-4 w-4" />
            Profile
          </Link>
          <Link
            to="/donation-history"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-sm"
          >
            <Heart className="h-4 w-4" />
            Donations
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-sm"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
          <div className="mb-2 px-2">
            <p className="text-sm font-medium truncate">{profile?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-60 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your subdomains</p>
            </div>
            <Button variant="hero" size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4" />
              New Subdomain
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold mt-1">{subdomains.length}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <Check className="h-4 w-4 text-success" />
              </div>
              <p className="text-2xl font-semibold mt-1">{subdomains.filter((s) => s.status === "active").length}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <Loader2 className="h-4 w-4 text-warning" />
              </div>
              <p className="text-2xl font-semibold mt-1">{subdomains.filter((s) => s.status === "pending").length}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Limit</span>
                <span className="text-xs text-muted-foreground">Max 5</span>
              </div>
              <p className="text-2xl font-semibold mt-1">{subdomains.length}/5</p>
            </div>
          </div>

          {/* Create Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
              <div className="glass-card p-6 w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Create Subdomain</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowCreateForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Subdomain Name</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="myproject"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="flex-1 font-mono"
                        maxLength={20}
                        minLength={3}
                        required
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">.cashurl.shop</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      3-20 characters, lowercase letters, numbers, and hyphens
                    </p>
                  </div>

                  <div className="glass-card p-3 text-sm">
                    <p className="text-muted-foreground">
                      Your subdomain will be instantly live and display the CashURL homepage. 
                      All subdomains are powered by wildcard DNS.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      className="flex-1"
                      disabled={isCreating || subdomain.length < 3}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Subdomains List */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-medium text-sm">Your Subdomains</h2>
            </div>
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : subdomains.length === 0 ? (
              <div className="p-12 text-center">
                <Globe className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No subdomains yet</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowCreateForm(true)}>
                  Create your first subdomain
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {subdomains.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm truncate">{sub.full_domain}</span>
                          <button
                            onClick={() => handleCopy(sub.full_domain)}
                            className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                          >
                            {copied === sub.full_domain ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">Wildcard DNS</span>
                          <ChevronRight className="h-3 w-3" />
                          <span className="font-mono truncate max-w-[150px]">cname.vercel-dns.com</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs border capitalize ${getStatusBadge(sub.status)}`}>
                        {sub.status}
                      </span>
                      <a
                        href={`https://${sub.full_domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(sub.id)}
                        disabled={isDeleting === sub.id}
                      >
                        {isDeleting === sub.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="glass-card p-4">
            <h3 className="font-medium text-sm mb-2">How it works</h3>
            <p className="text-xs text-muted-foreground">
              All subdomains are powered by wildcard DNS (*.cashurl.shop). When you create a subdomain, 
              it's instantly live and displays the CashURL homepage. This architecture allows unlimited 
              free subdomains without per-user DNS configuration.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;