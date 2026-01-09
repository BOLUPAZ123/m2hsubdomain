import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Globe, Search, Loader2, Ban, Trash2, 
  ExternalLink, Check, AlertTriangle, Clock
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
  onFilterChange?: (status: string) => void;
}

const SubdomainManagement = ({ 
  subdomains, 
  isLoading, 
  onDisable, 
  onDelete,
  onFilterChange 
}: SubdomainManagementProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
    onFilterChange?.(value === "all" ? "" : value);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
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
      </div>

      {/* Subdomains List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
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
                <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
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