import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, Save, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentSettings = () => {
  const [isProduction, setIsProduction] = useState(false);
  const [showAppId, setShowAppId] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [config, setConfig] = useState({
    appId: "",
    secretKey: "",
    isProduction: false,
  });

  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: { action: "get-payment-config" },
      });

      if (error) throw error;

      if (data?.config) {
        setConfig({
          appId: data.config.appId || "",
          secretKey: data.config.secretKey || "",
          isProduction: data.config.isProduction || false,
        });
        setIsProduction(data.config.isProduction || false);
      }
    } catch (err: any) {
      console.error("Failed to fetch payment config:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.functions.invoke("admin-actions", {
        body: { 
          action: "update-payment-config",
          isProduction,
        },
      });

      if (error) throw error;

      toast.success(`Switched to ${isProduction ? "Production" : "Sandbox"} mode`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const maskValue = (value: string) => {
    if (!value) return "Not configured";
    if (value.length <= 8) return "•".repeat(value.length);
    return value.slice(0, 4) + "•".repeat(value.length - 8) + value.slice(-4);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Production Mode</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {isProduction 
                ? "Using production Cashfree API (live payments)" 
                : "Using sandbox Cashfree API (test payments)"}
            </p>
          </div>
          <Switch 
            checked={isProduction} 
            onCheckedChange={setIsProduction}
          />
        </div>

        {isProduction && (
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-warning">
              Production mode will process real payments. Make sure your production API keys are configured.
            </p>
          </div>
        )}

        <Button 
          onClick={handleSave} 
          className="mt-4" 
          disabled={isSaving}
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
              Save Mode
            </>
          )}
        </Button>
      </div>

      {/* Current Keys Display */}
      <div className="glass-card p-6">
        <h3 className="font-medium mb-4">Current API Keys</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">App ID (CASHFREE_APP_ID)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly
                type={showAppId ? "text" : "password"}
                value={config.appId || "Not configured"}
                className="font-mono bg-secondary"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAppId(!showAppId)}
              >
                {showAppId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Secret Key (CASHFREE_SECRET_KEY)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly
                type={showSecretKey ? "text" : "password"}
                value={showSecretKey ? config.secretKey : maskValue(config.secretKey)}
                className="font-mono bg-secondary"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          To update API keys, use the secrets management in Lovable Cloud settings.
        </p>
      </div>

      {/* Info */}
      <div className="glass-card p-6">
        <h3 className="font-medium mb-3">API Endpoints</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sandbox:</span>
            <span className="font-mono text-xs">https://sandbox.cashfree.com/pg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Production:</span>
            <span className="font-mono text-xs">https://api.cashfree.com/pg</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;