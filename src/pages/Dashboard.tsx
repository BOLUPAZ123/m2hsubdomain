import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Globe,
  Globe2,
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
  X,
  Edit,
  Search,
  ChevronRight,
  ChevronLeft,
  Activity,
  Wifi,
  Clock,
  TrendingUp,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubdomains } from "@/hooks/useSubdomains";
import { useSubdomainAvailability } from "@/hooks/useSubdomainAvailability";
import SubdomainAvailabilityIndicator from "@/components/subdomain/SubdomainAvailabilityIndicator";
import LandingPageSettings from "@/components/subdomain/LandingPageSettings";
import DNSChecker from "@/components/subdomain/DNSChecker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const ITEMS_PER_PAGE = 5;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { subdomains, isLoading, createSubdomain, deleteSubdomain, updateSubdomain } = useSubdomains();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSubdomain, setEditingSubdomain] = useState<any>(null);
  const [showDNSChecker, setShowDNSChecker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Create form state
  const [subdomain, setSubdomain] = useState("");
  const [recordType, setRecordType] = useState<"A" | "CNAME">("CNAME");
  const [recordValue, setRecordValue] = useState("");
  const [proxied, setProxied] = useState(true);
  const [landingType, setLandingType] = useState<"default" | "redirect" | "html">("default");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [htmlTitle, setHtmlTitle] = useState("");
  
  const availability = useSubdomainAvailability(subdomain);
  
  const [copied, setCopied] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Pagination
  const totalPages = Math.ceil(subdomains.length / ITEMS_PER_PAGE);
  const paginatedSubdomains = subdomains.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const resetCreateForm = () => {
    setSubdomain("");
    setRecordType("CNAME");
    setRecordValue("");
    setProxied(true);
    setLandingType("default");
    setRedirectUrl("");
    setHtmlContent("");
    setHtmlTitle("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (subdomains.length >= 5) {
      toast.error("You've reached the maximum limit of 5 subdomains");
      return;
    }

    if (availability.isAvailable === false) {
      toast.error("This subdomain is not available");
      return;
    }

    setIsCreating(true);
    const result = await createSubdomain(
      subdomain,
      recordType,
      recordValue || undefined,
      proxied,
      landingType,
      redirectUrl || undefined,
      htmlContent || undefined,
      htmlTitle || undefined
    );

    if (result.success) {
      setShowCreateForm(false);
      resetCreateForm();
    }
    setIsCreating(false);
  };

  const handleEdit = (sub: any) => {
    setEditingSubdomain(sub);
    setRecordType(sub.record_type);
    setRecordValue(sub.record_value);
    setProxied(sub.proxied);
    setLandingType(sub.landing_type || "default");
    setRedirectUrl(sub.redirect_url || "");
    setHtmlContent(sub.html_content || "");
    setHtmlTitle(sub.html_title || "");
    setShowEditForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubdomain) return;

    setIsUpdating(true);
    const result = await updateSubdomain(
      editingSubdomain.id,
      recordType,
      recordValue,
      proxied,
      landingType,
      redirectUrl || undefined,
      htmlContent || undefined,
      htmlTitle || undefined
    );

    if (result.success) {
      setShowEditForm(false);
      setEditingSubdomain(null);
    }
    setIsUpdating(false);
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

  const getLandingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      default: "Default",
      redirect: "Redirect",
      html: "Custom HTML",
    };
    return labels[type] || "Default";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center transition-transform group-hover:scale-105">
              <Globe2 className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold text-sm">M2H SubDomains</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn-press">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="px-4 pb-4 space-y-1 animate-slide-down border-t border-border/50 pt-3">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm"
            >
              <Settings className="h-4 w-4" />
              Profile
            </Link>
            <Link
              to="/donation-history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm"
            >
              <Heart className="h-4 w-4" />
              Donations
            </Link>
            <Link
              to="/support"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm"
            >
              <Globe className="h-4 w-4" />
              Support
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <div className="pt-3 border-t border-border/50 mt-3">
              <div className="px-3 mb-3">
                <p className="text-sm font-medium truncate">{profile?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground btn-press"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-56 border-r border-border/50 bg-background/95 backdrop-blur-sm hidden lg:flex lg:flex-col animate-slide-in-left">
        <div className="p-4 border-b border-border/50">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:rounded-xl">
              <Globe2 className="w-4 h-4 text-background" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">M2H SubDomains</span>
              <span className="text-[10px] text-muted-foreground">Free DNS Hosting</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            to="/dashboard"
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-foreground" />
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-150 text-sm"
          >
            <Settings className="h-4 w-4" />
            Profile
          </Link>
          <Link
            to="/donation-history"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-150 text-sm"
          >
            <Heart className="h-4 w-4" />
            Donations
          </Link>
          <Link
            to="/support"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-150 text-sm"
          >
            <Globe className="h-4 w-4" />
            Support
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-150 text-sm"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-border/50">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium truncate">{profile?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground btn-press"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-56 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl hidden lg:block">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="animate-fade-in">
              <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your subdomains</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDNSChecker(!showDNSChecker)}
                className="btn-press"
              >
                <Search className="h-4 w-4 mr-2" />
                DNS Check
              </Button>
              <Button variant="default" size="sm" onClick={() => setShowCreateForm(true)} className="btn-press bg-foreground text-background hover:bg-foreground/90">
                <Plus className="h-4 w-4 mr-1" />
                New Subdomain
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Action Bar */}
        <div className="lg:hidden px-4 py-3 border-b border-border/50 bg-background/90 backdrop-blur-xl flex items-center justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDNSChecker(!showDNSChecker)}
            className="btn-press"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="default" size="sm" onClick={() => setShowCreateForm(true)} className="btn-press bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1" />
            New Subdomain
          </Button>
        </div>

        <div className="p-4 md:p-6 space-y-5">
          {/* DNS Checker Modal */}
          {showDNSChecker && (
            <div className="vercel-card p-5 animate-scale-in">
              <DNSChecker onClose={() => setShowDNSChecker(false)} />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="stat-card animate-slide-up stagger-1 opacity-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total</span>
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold tracking-tight">{subdomains.length}</p>
            </div>
            <div className="stat-card animate-slide-up stagger-2 opacity-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Active</span>
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              </div>
              <p className="text-2xl font-semibold tracking-tight text-success">{subdomains.filter((s) => s.status === "active").length}</p>
            </div>
            <div className="stat-card animate-slide-up stagger-3 opacity-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Pending</span>
                <Clock className="h-3.5 w-3.5 text-warning" />
              </div>
              <p className="text-2xl font-semibold tracking-tight text-warning">{subdomains.filter((s) => s.status === "pending").length}</p>
            </div>
            <div className="stat-card animate-slide-up stagger-4 opacity-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">CNAME</span>
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-2xl font-semibold tracking-tight">{subdomains.filter((s) => s.record_type === "CNAME").length}</p>
            </div>
            <div className="stat-card animate-slide-up stagger-5 opacity-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">A Records</span>
                <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold tracking-tight">{subdomains.filter((s) => s.record_type === "A").length}</p>
            </div>
            <div className="stat-card animate-slide-up stagger-6 opacity-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Limit</span>
                <span className="text-[10px] text-muted-foreground font-medium">Max 5</span>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-semibold tracking-tight">{subdomains.length}</p>
                <span className="text-muted-foreground text-sm">/5</span>
              </div>
            </div>
          </div>

          {/* Create Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
              <div className="vercel-card p-6 w-full max-w-lg animate-scale-in my-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold tracking-tight">Create Subdomain</h2>
                  <Button variant="ghost" size="icon" onClick={() => { setShowCreateForm(false); resetCreateForm(); }} className="btn-press">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Subdomain Name</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="myproject"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="flex-1 font-mono input-glow"
                        maxLength={20}
                        minLength={3}
                        required
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">.cashurl.shop</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        3-20 characters, lowercase letters, numbers, and hyphens
                      </p>
                      <SubdomainAvailabilityIndicator {...availability} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Record Type</Label>
                      <Select value={recordType} onValueChange={(v) => setRecordType(v as "A" | "CNAME")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CNAME">CNAME</SelectItem>
                          <SelectItem value="A">A Record</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {recordType === "A" ? "IP Address" : "Target"}
                      </Label>
                      <Input
                        placeholder={recordType === "A" ? "192.168.1.1" : "www.cashurl.shop"}
                        value={recordValue}
                        onChange={(e) => setRecordValue(e.target.value)}
                        className="font-mono text-sm input-glow"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <Label className="text-sm font-medium">Cloudflare Proxy</Label>
                      <p className="text-xs text-muted-foreground">CDN & DDoS protection</p>
                    </div>
                    <Switch checked={proxied} onCheckedChange={setProxied} />
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <LandingPageSettings
                      landingType={landingType}
                      redirectUrl={redirectUrl}
                      htmlContent={htmlContent}
                      htmlTitle={htmlTitle}
                      onLandingTypeChange={setLandingType}
                      onRedirectUrlChange={setRedirectUrl}
                      onHtmlContentChange={setHtmlContent}
                      onHtmlTitleChange={setHtmlTitle}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1 btn-press" onClick={() => { setShowCreateForm(false); resetCreateForm(); }}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 btn-press bg-foreground text-background hover:bg-foreground/90"
                      disabled={isCreating || subdomain.length < 3 || availability.isAvailable === false || availability.isChecking}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="glass-card p-6 w-full max-w-lg animate-slide-up my-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold">Edit Subdomain</h2>
                    <p className="text-sm text-muted-foreground font-mono">{editingSubdomain.full_domain}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowEditForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Record Type</Label>
                      <Select value={recordType} onValueChange={(v) => setRecordType(v as "A" | "CNAME")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CNAME">CNAME</SelectItem>
                          <SelectItem value="A">A Record</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">
                        {recordType === "A" ? "IP Address" : "Target"}
                      </Label>
                      <Input
                        placeholder={recordType === "A" ? "192.168.1.1" : "example.com"}
                        value={recordValue}
                        onChange={(e) => setRecordValue(e.target.value)}
                        className="font-mono text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Cloudflare Proxy</Label>
                      <p className="text-xs text-muted-foreground">CDN & DDoS protection</p>
                    </div>
                    <Switch checked={proxied} onCheckedChange={setProxied} />
                  </div>

                  <div className="border-t border-border pt-4">
                    <LandingPageSettings
                      landingType={landingType}
                      redirectUrl={redirectUrl}
                      htmlContent={htmlContent}
                      htmlTitle={htmlTitle}
                      onLandingTypeChange={setLandingType}
                      onRedirectUrlChange={setRedirectUrl}
                      onHtmlContentChange={setHtmlContent}
                      onHtmlTitleChange={setHtmlTitle}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      className="flex-1"
                      disabled={isUpdating}
                    >
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
          <div className="vercel-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-foreground" />
                <h2 className="font-medium text-sm">Your Subdomains</h2>
              </div>
              {subdomains.length > ITEMS_PER_PAGE && (
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : subdomains.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">No subdomains yet</p>
                <p className="text-xs text-muted-foreground mb-4">Create your first subdomain to get started</p>
                <Button variant="outline" size="sm" className="btn-press" onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Subdomain
                </Button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border/50">
                  {paginatedSubdomains.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 table-row-interactive group animate-fade-in"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-secondary">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium truncate">{sub.full_domain}</span>
                            <button
                              onClick={() => handleCopy(sub.full_domain)}
                              className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                            >
                              {copied === sub.full_domain ? (
                                <Check className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="font-mono">{sub.record_type}</span>
                            <span className="text-border">→</span>
                            <span className="font-mono truncate max-w-[120px]">{sub.record_value}</span>
                            {sub.proxied && <span className="text-success">• Proxied</span>}
                            <span className="text-primary">• {getLandingTypeLabel(sub.landing_type)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-12 md:ml-0">
                        <span className={`px-2 py-1 rounded-md text-xs border capitalize font-medium ${getStatusBadge(sub.status)}`}>
                          {sub.status}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground btn-press"
                            onClick={() => handleEdit(sub)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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
                            className="h-8 w-8 text-muted-foreground hover:text-destructive btn-press"
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
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-border/50 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="btn-press"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          className={`w-8 h-8 p-0 btn-press ${currentPage === page ? 'bg-foreground text-background' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="btn-press"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Info Card */}
          <div className="vercel-card p-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-medium text-sm mb-3">Landing Page Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="font-medium mb-1">Default</p>
                <p className="text-muted-foreground">Shows the M2H homepage</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="font-medium mb-1">Redirect</p>
                <p className="text-muted-foreground">Redirects visitors to your URL</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="font-medium mb-1">Custom HTML</p>
                <p className="text-muted-foreground">Display your own content</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
