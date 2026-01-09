import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Globe, Plus, LogOut, Home, Heart, 
  Copy, Trash2, ExternalLink, Check, Loader2, Shield,
  Settings, ChevronRight, X
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

// Default CNAME record for new subdomains - points to the subdomain live page
const DEFAULT_RECORD_VALUE = "73c81fe2bd0b3f5d.vercel-dns-017.com";
const DEFAULT_RECORD_TYPE = "CNAME";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { subdomains, isLoading, createSubdomain, deleteSubdomain, updateSubdomain } = useSubdomains();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit form state
  const [editRecordType, setEditRecordType] = useState<"A" | "CNAME">("A");
  const [editRecordValue, setEditRecordValue] = useState("");
  const [editProxied, setEditProxied] = useState(true);

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
    
    // Create with default CNAME record pointing to landing page
    const result = await createSubdomain(subdomain, DEFAULT_RECORD_TYPE as "CNAME", DEFAULT_RECORD_VALUE, false);
    
    if (result.success) {
      setShowCreateForm(false);
      setSubdomain("");
      // Navigate to subdomain live page
      navigate(`/subdomain-live?subdomain=${subdomain}`);
    }
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    await deleteSubdomain(id);
    setIsDeleting(null);
  };

  const handleOpenEdit = (sub: any) => {
    setShowEditForm(sub.id);
    setEditRecordType(sub.record_type);
    setEditRecordValue(sub.record_value);
    setEditProxied(sub.proxied);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditForm) return;
    
    setIsUpdating(true);
    const result = await updateSubdomain(showEditForm, editRecordValue, editProxied);
    
    if (result.success) {
      setShowEditForm(null);
    }
    setIsUpdating(false);
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

  const editingSubdomain = subdomains.find(s => s.id === showEditForm);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 border-r border-border bg-background hidden lg:block">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-foreground" />
            <span className="font-semibold text-sm">M2H Domains</span>
          </Link>
        </div>

        <nav className="p-2 space-y-1">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-foreground text-sm">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-sm">
            <Settings className="h-4 w-4" />
            Profile
          </Link>
          <Link to="/donation-history" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-sm">
            <Heart className="h-4 w-4" />
            Donations
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-sm">
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
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
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
              <p className="text-2xl font-semibold mt-1">{subdomains.filter(s => s.status === 'active').length}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <Loader2 className="h-4 w-4 text-warning" />
              </div>
              <p className="text-2xl font-semibold mt-1">{subdomains.filter(s => s.status === 'pending').length}</p>
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
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="flex-1 font-mono"
                        maxLength={20}
                        minLength={3}
                        required
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">.m2hgamerz.site</span>
                    </div>
                    <p className="text-xs text-muted-foreground">3-20 characters, lowercase letters, numbers, and hyphens</p>
                  </div>

                  <div className="glass-card p-3 text-sm">
                    <p className="text-muted-foreground">
                      Your subdomain will be created with a default landing page. You can update DNS records after creation.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="hero" className="flex-1" disabled={isCreating || subdomain.length < 3}>
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

          {/* Edit Form Modal */}
          {showEditForm && editingSubdomain && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
              <div className="glass-card p-6 w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold">Edit DNS Settings</h2>
                    <p className="text-sm text-muted-foreground font-mono">{editingSubdomain.full_domain}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowEditForm(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Record Type</Label>
                    <Select value={editRecordType} onValueChange={(v) => setEditRecordType(v as "A" | "CNAME")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A Record (IP Address)</SelectItem>
                        <SelectItem value="CNAME">CNAME Record (Domain)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">{editRecordType === "A" ? "IP Address" : "Target Domain"}</Label>
                    <Input
                      placeholder={editRecordType === "A" ? "123.45.67.89" : "example.vercel.app"}
                      value={editRecordValue}
                      onChange={(e) => setEditRecordValue(e.target.value)}
                      className="font-mono"
                      required
                    />
                  </div>

                  {editRecordType === "A" && (
                    <div className="flex items-center justify-between p-3 glass-card">
                      <div>
                        <Label className="text-sm">Cloudflare Proxy</Label>
                        <p className="text-xs text-muted-foreground">CDN & DDoS protection</p>
                      </div>
                      <Switch checked={editProxied} onCheckedChange={setEditProxied} />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditForm(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="hero" className="flex-1" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
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
                  <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors group">
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
                          <span className="font-mono">{sub.record_type}</span>
                          <ChevronRight className="h-3 w-3" />
                          <span className="font-mono truncate max-w-[150px]">{sub.record_value}</span>
                          {sub.proxied && <span className="text-success">(Proxied)</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs border capitalize ${getStatusBadge(sub.status)}`}>
                        {sub.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => handleOpenEdit(sub)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <a 
                        href={`https://${sub.full_domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        disabled={isDeleting === sub.id}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
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
