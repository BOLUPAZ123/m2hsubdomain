import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityResult {
  isAvailable: boolean | null;
  isChecking: boolean;
  error: string | null;
}

export function useSubdomainAvailability(subdomain: string, debounceMs = 300) {
  const [result, setResult] = useState<AvailabilityResult>({
    isAvailable: null,
    isChecking: false,
    error: null,
  });

  const checkAvailability = useCallback(async (name: string) => {
    // Validate format first
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,18}[a-z0-9])?$/;
    if (!subdomainRegex.test(name)) {
      setResult({
        isAvailable: null,
        isChecking: false,
        error: name.length < 3 ? "Minimum 3 characters" : "Invalid format",
      });
      return;
    }

    setResult(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      // Check reserved subdomains
      const { data: reserved } = await supabase
        .from("reserved_subdomains")
        .select("subdomain")
        .eq("subdomain", name)
        .maybeSingle();

      if (reserved) {
        setResult({
          isAvailable: false,
          isChecking: false,
          error: "This subdomain is reserved",
        });
        return;
      }

      // Check existing subdomains
      const { data: existing } = await supabase
        .from("subdomains")
        .select("id")
        .eq("subdomain", name)
        .maybeSingle();

      setResult({
        isAvailable: !existing,
        isChecking: false,
        error: existing ? "Already taken" : null,
      });
    } catch {
      setResult({
        isAvailable: null,
        isChecking: false,
        error: "Failed to check availability",
      });
    }
  }, []);

  useEffect(() => {
    if (!subdomain || subdomain.length < 3) {
      setResult({
        isAvailable: null,
        isChecking: false,
        error: subdomain.length > 0 ? "Minimum 3 characters" : null,
      });
      return;
    }

    const timer = setTimeout(() => {
      checkAvailability(subdomain);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [subdomain, debounceMs, checkAvailability]);

  return result;
}
