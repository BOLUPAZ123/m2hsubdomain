import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface SubdomainData {
  subdomain: string;
  full_domain: string;
  landing_type: "default" | "redirect" | "html";
  redirect_url: string | null;
  html_content: string | null;
  html_title: string | null;
  status: string;
}

interface SubdomainLandingHandlerProps {
  children: React.ReactNode;
}

const SubdomainLandingHandler = ({ children }: SubdomainLandingHandlerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [subdomainData, setSubdomainData] = useState<SubdomainData | null>(null);
  const location = useLocation();

  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Extract subdomain from hostname
    const getSubdomainName = () => {
      if (hostname === "cashurl.shop" || hostname === "www.cashurl.shop") {
        return null;
      }
      if (hostname.endsWith(".cashurl.shop")) {
        return hostname.replace(".cashurl.shop", "");
      }
      return null;
    };

    const subdomainName = getSubdomainName();
    
    if (!subdomainName) {
      setIsLoading(false);
      return;
    }

    // Fetch subdomain configuration
    const fetchSubdomain = async () => {
      try {
        const { data, error } = await supabase
          .from("subdomains")
          .select("subdomain, full_domain, landing_type, redirect_url, html_content, html_title, status")
          .eq("subdomain", subdomainName)
          .eq("status", "active")
          .maybeSingle();

        if (error) {
          console.error("Error fetching subdomain:", error);
          setIsLoading(false);
          return;
        }

        if (data) {
          setSubdomainData({
            ...data,
            landing_type: (data.landing_type as "default" | "redirect" | "html") || "default",
          });
        }
      } catch (err) {
        console.error("Failed to fetch subdomain:", err);
      }
      setIsLoading(false);
    };

    fetchSubdomain();
  }, []);

  // Handle subdomain landing pages
  useEffect(() => {
    if (!subdomainData || isLoading) return;

    // Handle redirect
    if (subdomainData.landing_type === "redirect" && subdomainData.redirect_url) {
      window.location.href = subdomainData.redirect_url;
      return;
    }
  }, [subdomainData, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show custom HTML if landing type is html
  if (subdomainData?.landing_type === "html" && subdomainData.html_content) {
    return (
      <html>
        <head>
          <title>{subdomainData.html_title || subdomainData.full_domain}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>{`
            body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
          `}</style>
        </head>
        <body>
          <div 
            dangerouslySetInnerHTML={{ __html: subdomainData.html_content }}
            style={{ minHeight: "100vh" }}
          />
        </body>
      </html>
    );
  }

  // Default: show main site
  return <>{children}</>;
};

export default SubdomainLandingHandler;
