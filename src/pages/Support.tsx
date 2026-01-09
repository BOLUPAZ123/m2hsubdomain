import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

const Support = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");

  const fetchTickets = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a support ticket");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        subject: subject.trim(),
        message: message.trim(),
        priority,
      });

      if (error) throw error;

      toast.success("Support ticket submitted successfully!");
      setSubject("");
      setMessage("");
      setPriority("normal");
      fetchTickets();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4 text-warning" />;
      case "in_progress":
        return <MessageCircle className="h-4 w-4 text-primary" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: "bg-warning/20 text-warning border-warning/30",
      in_progress: "bg-primary/20 text-primary border-primary/30",
      resolved: "bg-success/20 text-success border-success/30",
    };
    return colors[status as keyof typeof colors] || "bg-secondary text-muted-foreground";
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-muted text-muted-foreground",
      normal: "bg-secondary text-foreground",
      high: "bg-warning/20 text-warning",
      urgent: "bg-destructive/20 text-destructive",
    };
    return colors[priority as keyof typeof colors] || "bg-secondary";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
        <p className="text-muted-foreground text-lg mb-12">
          Need help? Submit a support ticket and our team will get back to you.
        </p>

        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Submit Ticket Form */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Submit a Ticket
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 min-h-[120px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Ticket History */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Your Tickets
              </h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : tickets.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tickets yet. Submit one if you need help!
                </p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-lg border border-border bg-card/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm">{ticket.subject}</h3>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusBadge(ticket.status)}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {ticket.admin_response && (
                        <div className="mt-2 p-3 rounded-md bg-primary/5 border border-primary/20">
                          <p className="text-xs font-medium text-primary mb-1">Admin Response:</p>
                          <p className="text-sm">{ticket.admin_response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">
              Please login to submit and view support tickets.
            </p>
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12 glass-card p-8">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">How do I create a subdomain?</h3>
              <p className="text-muted-foreground text-sm">
                Sign up for a free account, go to your dashboard, and click "New Subdomain". 
                Enter your desired subdomain name and it will be created instantly.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">How many subdomains can I create?</h3>
              <p className="text-muted-foreground text-sm">
                The default limit is 5 subdomains per user. Admins may adjust this limit for individual users.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">How do I point my subdomain to my website?</h3>
              <p className="text-muted-foreground text-sm">
                After creating your subdomain, click the settings icon to edit DNS records. 
                You can set an A record (IP address) or CNAME record (domain name) to point to your server.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Is SSL/HTTPS included?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! All subdomains have SSL enabled through Cloudflare proxy. HTTPS works automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Need immediate help? Email us at{" "}
            <a href="mailto:help@cashurl.shop" className="text-primary hover:underline">
              help@cashurl.shop
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;