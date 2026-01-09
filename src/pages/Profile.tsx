import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  User, ArrowLeft, Loader2, Save, 
  Globe, Heart, Mail, Calendar, Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubdomains } from "@/hooks/useSubdomains";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isLoading: authLoading, refreshProfile } = useAuth();
  const { subdomains } = useSubdomains();
  
  const [name, setName] = useState(profile?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Info */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile?.name || "User"}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-xs border bg-primary/20 text-primary border-primary/30">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{subdomains.length}</p>
                <p className="text-xs text-muted-foreground">Subdomains</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString() 
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">Joined</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <Input
                value={profile?.email || ""}
                disabled
                className="bg-secondary"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isSaving || name === profile?.name}
              variant="hero"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="glass-card p-6">
          <h3 className="font-medium mb-4">Quick Links</h3>
          <div className="space-y-2">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span>Manage Subdomains</span>
            </Link>
            <Link 
              to="/donate" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <Heart className="h-5 w-5 text-destructive" />
              <span>Support Us</span>
            </Link>
            <Link 
              to="/contact" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;