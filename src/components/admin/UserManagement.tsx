import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, Loader2, Shield, ShieldOff, 
  MoreVertical, Mail, Globe, Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  user_roles: { role: string }[];
  subdomain_count?: number;
}

interface UserManagementProps {
  users: User[];
  isLoading: boolean;
  onSetRole: (userId: string, role: "admin" | "user") => void;
}

const UserManagement = ({ users, isLoading, onSetRole }: UserManagementProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isUserAdmin = (user: User) => 
    user.user_roles?.some(r => r.role === 'admin');

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">All Users ({filteredUsers.length})</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? "No users found matching your search" : "No users found"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
                      {isUserAdmin(user) && (
                        <span className="px-2 py-0.5 rounded-full text-xs border bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isUserAdmin(user) ? (
                      <DropdownMenuItem onClick={() => onSetRole(user.user_id, "user")}>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Remove Admin
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onSetRole(user.user_id, "admin")}>
                        <Shield className="h-4 w-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;