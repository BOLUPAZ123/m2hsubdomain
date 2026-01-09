import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Heart, ArrowLeft, Loader2, DollarSign, 
  CheckCircle2, XCircle, Clock, ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Donation {
  id: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  created_at: string;
}

const DonationHistory = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDonated, setTotalDonated] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchDonations();
    }
  }, [user, authLoading, navigate]);

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDonations(data || []);
      
      // Calculate total successful donations
      const total = (data || [])
        .filter(d => d.status === 'success')
        .reduce((sum, d) => sum + d.amount, 0);
      setTotalDonated(total);
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-destructive" />
                <h1 className="text-xl font-bold">Donation History</h1>
              </div>
            </div>
            <Link to="/donate">
              <Button variant="hero" size="sm">
                <Heart className="h-4 w-4" />
                Donate
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Donated</p>
                <p className="text-2xl font-bold">₹{totalDonated.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Donations Made</p>
                <p className="text-2xl font-bold">{donations.filter(d => d.status === 'success').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Donation List */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Your Donations</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </div>
          ) : donations.length === 0 ? (
            <div className="p-12 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground mb-4">No donations yet</p>
              <Link to="/donate">
                <Button variant="outline">Make your first donation</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {donations.map((donation) => (
                <div key={donation.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(donation.status)}
                    <div>
                      <p className="font-medium">
                        {donation.currency} {donation.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(donation.created_at).toLocaleDateString()} at{" "}
                        {new Date(donation.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs border capitalize ${getStatusBadge(donation.status)}`}>
                      {donation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thank You Message */}
        {totalDonated > 0 && (
          <div className="mt-6 glass-card p-6 text-center">
            <Heart className="h-8 w-8 mx-auto mb-3 text-destructive" />
            <h3 className="font-semibold mb-2">Thank you for your support!</h3>
            <p className="text-sm text-muted-foreground">
              Your donations help keep M2H Domains free for everyone.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DonationHistory;