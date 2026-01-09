import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, Save, Loader2, Globe, Users, Search, 
  UserCog, RefreshCw 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserWithLimit {
  id: string;
  user_id: string;
  name: string;
  email: string;
  subdomain_limit?: number;
  subdomain_count?: number;
}

const SubdomainLimitSettings = () => {
  const [globalLimit, setGlobalLimit] = useState(5);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [users, setUsers] = useState<UserWithLimit[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState(5);
  const [isSavingUser, setIsSavingUser] = useState(false);

  const fetchGlobalLimit = async () => {
    setIsLoadingGlobal(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "global_subdomain_limit")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data?.value) {
        setGlobalLimit((data.value as any).limit || 5);
      }
    } catch (err: any) {
      console.error("Error fetching global limit:", err);
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user-specific limits
      const { data: limits } = await supabase
        .from("user_subdomain_limits")
        .select("*");

      // Fetch subdomain counts per user
      const { data: subdomains } = await supabase
        .from("subdomains")
        .select("user_id");

      const countMap: Record<string, number> = {};
      subdomains?.forEach((s) => {
        countMap[s.user_id] = (countMap[s.user_id] || 0) + 1;
      });

      const usersWithLimits = profiles?.map((p) => ({
        ...p,
        subdomain_limit: limits?.find((l) => l.user_id === p.user_id)?.subdomain_limit,
        subdomain_count: countMap[p.user_id] || 0,
      })) || [];

      setUsers(usersWithLimits);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchGlobalLimit();
    fetchUsers();
  }, []);

  const handleSaveGlobalLimit = async () => {
    if (globalLimit < 1) {
      toast.error("Limit must be at least 1");
      return;
    }

    setIsSavingGlobal(true);
    try {
      const { error } = await supabase
        .from("settings")
        .upsert(
          { key: "global_subdomain_limit", value: { limit: globalLimit } },
          { onConflict: "key" }
        );

      if (error) throw error;
      toast.success("Global limit updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update global limit");
    } finally {
      setIsSavingGlobal(false);
    }
  };

  const handleSaveUserLimit = async (userId: string) => {
    if (editLimit < 1) {
      toast.error("Limit must be at least 1");
      return;
    }

    setIsSavingUser(true);
    try {
      const { error } = await supabase
        .from("user_subdomain_limits")
        .upsert(
          { user_id: userId, subdomain_limit: editLimit },
          { onConflict: "user_id" }
        );

      if (error) throw error;
      toast.success("User limit updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user limit");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleRemoveUserLimit = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_subdomain_limits")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("User limit removed, using global default");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove user limit");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Global Subdomain Limit</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          This limit applies to all users who don't have a custom limit set.
        </p>
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <Label htmlFor="globalLimit">Default Limit per User</Label>
            <Input
              id="globalLimit"
              type="number"
              min={1}
              value={globalLimit}
              onChange={(e) => setGlobalLimit(parseInt(e.target.value) || 1)}
              className="mt-1"
              disabled={isLoadingGlobal}
            />
          </div>
          <Button onClick={handleSaveGlobalLimit} disabled={isSavingGlobal}>
            {isSavingGlobal ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Per-User Limits */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Individual User Limits</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={fetchUsers} disabled={isLoadingUsers}>
              {isLoadingUsers ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isLoadingUsers ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {user.subdomain_count} / {user.subdomain_limit || globalLimit}
                    </span>
                    {user.subdomain_limit && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">
                        Custom
                      </span>
                    )}
                  </div>

                  {editingUser === user.user_id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={editLimit}
                        onChange={(e) => setEditLimit(parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveUserLimit(user.user_id)}
                        disabled={isSavingUser}
                      >
                        {isSavingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUser(user.user_id);
                          setEditLimit(user.subdomain_limit || globalLimit);
                        }}
                      >
                        Set Limit
                      </Button>
                      {user.subdomain_limit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveUserLimit(user.user_id)}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubdomainLimitSettings;