import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, Search, Loader2, CheckCircle2, 
  XCircle, Clock, Download
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Donation {
  id: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  profiles: { name: string; email: string } | null;
}

interface DonationManagementProps {
  donations: Donation[];
  isLoading: boolean;
}

const DonationManagement = ({ donations, isLoading }: DonationManagementProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredDonations = donations.filter(donation => {
    const donorName = donation.profiles?.name || donation.customer_name || '';
    const donorEmail = donation.profiles?.email || donation.customer_email || '';
    
    const matchesSearch = 
      donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.order_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || donation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredDonations
    .filter(d => d.status === 'success')
    .reduce((sum, d) => sum + d.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      success: "bg-success/20 text-success border-success/30",
      pending: "bg-warning/20 text-warning border-warning/30",
      failed: "bg-destructive/20 text-destructive border-destructive/30",
    };
    return styles[status] || styles.pending;
  };

  const exportCSV = () => {
    const headers = ['Date', 'Donor Name', 'Email', 'Amount', 'Currency', 'Status', 'Order ID'];
    const rows = filteredDonations.map(d => [
      new Date(d.created_at).toLocaleDateString(),
      d.profiles?.name || d.customer_name || 'Anonymous',
      d.profiles?.email || d.customer_email || '',
      d.amount.toString(),
      d.currency,
      d.status,
      d.order_id || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Total Successful</p>
          <p className="text-2xl font-bold text-success">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Success Rate</p>
          <p className="text-2xl font-bold">
            {donations.length > 0 
              ? Math.round((donations.filter(d => d.status === 'success').length / donations.length) * 100)
              : 0}%
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          <p className="text-2xl font-bold">{donations.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by donor name, email or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Donations List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Donation History ({filteredDonations.length})</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? "No donations found matching your search" : "No donations yet"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredDonations.map((donation) => (
              <div key={donation.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-4">
                  {getStatusIcon(donation.status)}
                  <div>
                    <p className="font-medium">
                      {donation.profiles?.name || donation.customer_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {donation.profiles?.email || donation.customer_email || 'Guest donation'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs border capitalize ${getStatusBadge(donation.status)}`}>
                    {donation.status}
                  </span>
                  <span className="font-bold text-lg">
                    {donation.currency} {donation.amount.toLocaleString()}
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
    </div>
  );
};

export default DonationManagement;