import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, Search, Loader2, Clock, CheckCircle, 
  AlertCircle, Send, ChevronDown, ChevronUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  profiles?: { name: string; email: string };
}

const SupportTicketManagement = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set(data?.map((t) => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, email")
        .in("user_id", userIds);

      const ticketsWithProfiles = data?.map((ticket) => ({
        ...ticket,
        profiles: profiles?.find((p) => p.user_id === ticket.user_id),
      })) || [];

      setTickets(ticketsWithProfiles);
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
      toast.error("Failed to fetch tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRespond = async (ticketId: string, newStatus: string) => {
    if (!response.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({
          admin_response: response.trim(),
          status: newStatus,
          responded_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (error) throw error;

      toast.success("Response sent successfully");
      setResponse("");
      setExpandedTicket(null);
      fetchTickets();
    } catch (err: any) {
      toast.error(err.message || "Failed to respond");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;
      toast.success("Status updated");
      fetchTickets();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-destructive bg-destructive/10";
      case "high":
        return "text-warning bg-warning/10";
      case "normal":
        return "text-foreground bg-secondary";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Support Tickets ({filteredTickets.length})</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchTickets} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No tickets found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-4">
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(ticket.status)}
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ticket.profiles?.email || "Unknown user"} • {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {expandedTicket === ticket.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {expandedTicket === ticket.id && (
                  <div className="mt-4 space-y-4">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm font-medium mb-1">User Message:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>
                    </div>

                    {ticket.admin_response && (
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm font-medium text-primary mb-1">Previous Response:</p>
                        <p className="text-sm whitespace-pre-wrap">{ticket.admin_response}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded: {ticket.responded_at ? new Date(ticket.responded_at).toLocaleString() : "N/A"}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-sm">Status:</span>
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => handleStatusChange(ticket.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Textarea
                        placeholder="Type your response..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRespond(ticket.id, "in_progress")}
                        disabled={isSubmitting}
                        variant="outline"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Reply
                      </Button>
                      <Button
                        onClick={() => handleRespond(ticket.id, "resolved")}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        Resolve
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketManagement;