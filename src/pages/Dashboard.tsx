import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Globe, Plus, Settings, LogOut, Home, Heart, 
  Copy, Trash2, ExternalLink, Check, AlertCircle,
  Server, Link as LinkIcon, Loader2, Shield
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useSubdomains } from "@/hooks/useSubdomains";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { subdomains, isLoading, createSubdomain, deleteSubdomain } = useSubdomains();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [recordType, setRecordType] = useState<"A" | "CNAME">("A");
  const [recordValue, setRecordValue] = useState("");
  const [proxied, setProxied] = useState(true);
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
    setIsCreating(true);
    
    const result = await createSubdomain(subdomain, recordType, recordValue, proxied);
    
    if (result.success) {
      setShowCreateForm(false);
      setSubdomain("");
      setRecordValue("");
      setRecordType("A");
      setProxied(true);
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
      disabled: "bg-muted/50 text-muted-foreground border-muted",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card/50 hidden lg:block">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-bold">M2H<span className="gradient-text">Gamerz</span></span>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary text-foreground">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link to="/donate" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Heart className="h-4 w-4" />
            Donate
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium truncate">{profile?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {profile?.name || "User"}!</p>
            </div>
            <Button variant="hero" onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4" />
              New Subdomain
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <span className="text-muted-foreground text-sm">Total Subdomains</span>
              </div>
              <p className="text-3xl font-bold">{subdomains.length}</p>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-success" />
                </div>
                <span className="text-muted-foreground text-sm">Active</span>
              </div>
              <p className="text-3xl font-bold">{subdomains.filter(s => s.status === 'active').length}</p>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <span className="text-muted-foreground text-sm">Pending</span>
              </div>
              <p className="text-3xl font-bold">{subdomains.filter(s => s.status === 'pending').length}</p>
            </div>
          </div>

          {/* Create Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
              <div className="glass-card p-6 w-full max-w-md animate-slide-up">
                <h2 className="text-xl font-bold mb-4">Create Subdomain</h2>
                
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subdomain Name</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="myproject"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="flex-1"
                        maxLength={20}
                        minLength={3}
                        required
                      />
                      <span className="text-muted-foreground text-sm whitespace-nowrap">.m2hgamerz.site</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only (3-20 chars)</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Record Type</Label>
                    <Select value={recordType} onValueChange={(v) => setRecordType(v as "A" | "CNAME")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4" />
                            A Record (IP Address)
                          </div>
                        </SelectItem>
                        <SelectItem value="CNAME">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            CNAME Record (Domain)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{recordType === "A" ? "IP Address" : "Target Domain"}</Label>
                    <Input
                      placeholder={recordType === "A" ? "123.45.67.89" : "example.vercel.app"}
                      value={recordValue}
                      onChange={(e) => setRecordValue(e.target.value)}
                      required
                    />
                  </div>

                  {recordType === "A" && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Cloudflare Proxy</Label>
                        <p className="text-xs text-muted-foreground">Enable CDN & DDoS protection</p>
                      </div>
                      <Switch checked={proxied} onCheckedChange={setProxied} />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="hero" className="flex-1" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Subdomain"
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
              <h2 className="font-semibold">Your Subdomains</h2>
            </div>
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              </div>
            ) : subdomains.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No subdomains yet. Create your first one!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {subdomains.map((sub) => (
                  <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium font-mono">{sub.full_domain}</span>
                          <button 
                            onClick={() => handleCopy(sub.full_domain)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copied === sub.full_domain ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-mono">{sub.record_type}</span>
                          <span>→</span>
                          <span className="font-mono truncate max-w-[200px]">{sub.record_value}</span>
                          {sub.proxied && <span className="text-primary text-xs">(Proxied)</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs border capitalize ${getStatusBadge(sub.status)}`}>
                        {sub.status}
                      </span>
                      <a 
                        href={`https://${sub.full_domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        disabled={isDeleting === sub.id}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        {isDeleting === sub.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
