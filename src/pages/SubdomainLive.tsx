import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, Settings, ArrowRight } from "lucide-react";
import { useState } from "react";

const SubdomainLive = () => {
  const [searchParams] = useSearchParams();
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";

  const qpSubdomain = searchParams.get("subdomain");
  const derivedDomain = hostname.endsWith(".m2hgamerz.site") ? hostname : null;
  const fallbackDomain = qpSubdomain ? `${qpSubdomain}.m2hgamerz.site` : "yoursubdomain.m2hgamerz.site";

  const fullDomain = derivedDomain ?? fallbackDomain;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center animate-slide-up">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-8">
          <Check className="h-10 w-10 text-success" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">Your Subdomain is Live!</h1>
        <p className="text-muted-foreground mb-8">
          Congratulations! Your subdomain has been created and is now active.
        </p>

        {/* Domain Display */}
        <div className="glass-card p-6 mb-8">
          <p className="text-sm text-muted-foreground mb-2">Your new subdomain</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl font-mono font-semibold">{fullDomain}</span>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="glass-card p-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Default DNS</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your subdomain is pointing to our default landing page. Update DNS records anytime from your dashboard.
            </p>
          </div>
          <div className="glass-card p-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">SSL Enabled</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your subdomain has SSL enabled via Cloudflare proxy. HTTPS is ready to use.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="hero">
            <Link to="/dashboard">
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href={`https://${fullDomain}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Visit Subdomain
            </a>
          </Button>
        </div>

        {/* Help */}
        <p className="text-xs text-muted-foreground mt-8">
          Need help? Contact us at{" "}
          <a href="mailto:help@m2hgamerz.site" className="text-foreground hover:underline">
            help@m2hgamerz.site
          </a>
        </p>
      </div>
    </div>
  );
};

export default SubdomainLive;