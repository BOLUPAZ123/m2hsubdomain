import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Globe, Search, Loader2, Ban, Trash2, 
  ExternalLink, Check, AlertTriangle, Clock, Download
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Subdomain {
  id: string;
  subdomain: string;
  full_domain: string;
  record_type: string;
  record_value: string;
  status: string;
  created_at: string;
  proxied: boolean;
  profiles: { name: string; email: string };
}

interface SubdomainManagementProps {
  subdomains: Subdomain[];
  isLoading: boolean;
  onDisable: (id: string) => void;
  onDelete: (id: string) => void;
  onBulkDisable?: (ids: string[]) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onFilterChange?: (status: string) => void;
}

const SubdomainManagement = ({ 
  subdomains, 
  isLoading, 
  onDisable, 
  onDelete,
  onBulkDisable,
  onBulkDelete,
  onFilterChange 
}: SubdomainManagementProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const filteredSubdomains = subdomains.filter(sub => {
    const matchesSearch = 
      sub.full_domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { class: string; icon: React.ReactNode }> = {
      active: { 
        class: "bg-success/20 text-success border-success/30",
        icon: <Check className="h-3 w-3" />
      },
      pending: { 
        class: "bg-warning/20 text-warning border-warning/30",
        icon: <Clock className="h-3 w-3" />
      },
      failed: { 
        class: "bg-destructive/20 text-destructive border-destructive/30",
        icon: <AlertTriangle className="h-3 w-3" />
      },
      disabled: { 
        class: "bg-muted/50 text-muted-foreground border-muted",
        icon: <Ban className="h-3 w-3" />
      },
    };
    return styles[status] || styles.pending;
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setSelectedIds(new Set());
    onFilterChange?.(value === "all" ? "" : value);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSubdomains.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSubdomains.map(s => s.id)));
    }
  };

  const handleBulkDisable = async () => {
    if (!onBulkDisable || selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      await onBulkDisable(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success(`Disabled ${selectedIds.size} subdomains`);
    } catch {
      toast.error("Failed to disable subdomains");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      await onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success(`Deleted ${selectedIds.size} subdomains`);
    } catch {
      toast.error("Failed to delete subdomains");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Subdomain", "Full Domain", "Record Type", "Record Value", "Status", "Proxied", "Owner", "Email", "Created At"];
    const rows = filteredSubdomains.map(s => [
      s.subdomain,
      s.full_domain,
      s.record_type,
      s.record_value,
      s.status,
      s.proxied ? "Yes" : "No",
      s.profiles?.name || "",
      s.profiles?.email || "",
      new Date(s.created_at).toLocaleString(),
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subdomains-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by domain, owner name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={bulkActionLoading}>
                <Ban className="h-4 w-4 mr-1" />
                Disable All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disable {selectedIds.size} Subdomains?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disable all selected subdomains and remove their DNS records from Cloudflare.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDisable}>Disable All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={bulkActionLoading}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selectedIds.size} Subdomains?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all selected subdomains and their DNS records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">Delete All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Subdomains List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={filteredSubdomains.length > 0 && selectedIds.size === filteredSubdomains.length}
              onCheckedChange={toggleSelectAll}
            />
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">All Subdomains ({filteredSubdomains.length})</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </div>
        ) : filteredSubdomains.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? "No subdomains found matching your search" : "No subdomains found"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredSubdomains.map((sub) => {
              const status = getStatusBadge(sub.status);
              return (
                <div key={sub.id} className="p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
                  <Checkbox
                    checked={selectedIds.has(sub.id)}
                    onCheckedChange={() => toggleSelection(sub.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium font-mono truncate">{sub.full_domain}</span>
                      <a 
                        href={`https://${sub.full_domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Owner: {sub.profiles?.name || 'Unknown'}</span>
                      <span className="font-mono text-xs">
                        {sub.record_type} → {sub.record_value}
                      </span>
                      {sub.proxied && (
                        <span className="text-success text-xs">Proxied</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs border capitalize flex items-center gap-1 ${status.class}`}>
                      {status.icon}
                      {sub.status}
                    </span>
                    
                    {sub.status !== 'disabled' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDisable(sub.id)}
                        className="text-warning hover:text-warning"
                        title="Disable subdomain"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          title="Delete subdomain"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Subdomain?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{sub.full_domain}</strong>? 
                            This will also remove the DNS record from Cloudflare.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(sub.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubdomainManagement;