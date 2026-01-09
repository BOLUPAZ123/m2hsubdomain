import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Globe, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Server
} from "lucide-react";

interface DNSResult {
  resolver: string;
  resolverName: string;
  status: "success" | "error" | "pending";
  data?: {
    type: string;
    value: string;
    ttl?: number;
  }[];
  error?: string;
}

interface DNSCheckerProps {
  defaultDomain?: string;
  onClose?: () => void;
}

const DNS_RESOLVERS = [
  { name: "Google", url: "https://dns.google/resolve" },
  { name: "Cloudflare", url: "https://cloudflare-dns.com/dns-query" },
];

const DNSChecker = ({ defaultDomain = "", onClose }: DNSCheckerProps) => {
  const [domain, setDomain] = useState(defaultDomain);
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<DNSResult[]>([]);

  const checkDNS = useCallback(async () => {
    if (!domain) return;
    
    setIsChecking(true);
    setResults(DNS_RESOLVERS.map(r => ({ 
      resolver: r.url, 
      resolverName: r.name, 
      status: "pending" as const 
    })));

    const checkResolver = async (resolver: typeof DNS_RESOLVERS[0]): Promise<DNSResult> => {
      try {
        // Query both A and CNAME records
        const aResponse = await fetch(
          `${resolver.url}?name=${encodeURIComponent(domain)}&type=A`,
          { headers: { Accept: "application/dns-json" } }
        );
        const aData = await aResponse.json();

        const cnameResponse = await fetch(
          `${resolver.url}?name=${encodeURIComponent(domain)}&type=CNAME`,
          { headers: { Accept: "application/dns-json" } }
        );
        const cnameData = await cnameResponse.json();

        const records: DNSResult["data"] = [];

        // Parse A records
        if (aData.Answer) {
          aData.Answer.forEach((answer: any) => {
            if (answer.type === 1) { // A record
              records.push({ type: "A", value: answer.data, ttl: answer.TTL });
            }
            if (answer.type === 5) { // CNAME in A response
              records.push({ type: "CNAME", value: answer.data, ttl: answer.TTL });
            }
          });
        }

        // Parse CNAME records
        if (cnameData.Answer) {
          cnameData.Answer.forEach((answer: any) => {
            if (answer.type === 5 && !records.some(r => r.type === "CNAME")) {
              records.push({ type: "CNAME", value: answer.data, ttl: answer.TTL });
            }
          });
        }

        // Check for NXDOMAIN
        if (aData.Status === 3 && cnameData.Status === 3) {
          return {
            resolver: resolver.url,
            resolverName: resolver.name,
            status: "error",
            error: "NXDOMAIN - Domain does not exist",
          };
        }

        if (records.length === 0) {
          return {
            resolver: resolver.url,
            resolverName: resolver.name,
            status: "error",
            error: "No A or CNAME records found",
          };
        }

        return {
          resolver: resolver.url,
          resolverName: resolver.name,
          status: "success",
          data: records,
        };
      } catch (err) {
        return {
          resolver: resolver.url,
          resolverName: resolver.name,
          status: "error",
          error: "Failed to query resolver",
        };
      }
    };

    const newResults = await Promise.all(DNS_RESOLVERS.map(checkResolver));
    setResults(newResults);
    setIsChecking(false);
  }, [domain]);

  const allSuccess = results.length > 0 && results.every(r => r.status === "success");
  const allError = results.length > 0 && results.every(r => r.status === "error");
  const mixedResults = results.length > 0 && !allSuccess && !allError && results.some(r => r.status === "success");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">DNS Health Checker</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Check if your subdomain resolves correctly on global DNS resolvers.
      </p>

      <div className="flex gap-2">
        <Input
          placeholder="subdomain.m2hgamerz.site"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="font-mono text-sm"
        />
        <Button 
          onClick={checkDNS} 
          disabled={isChecking || !domain}
          variant="hero"
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Check
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {/* Summary */}
          <div className={`p-3 rounded-lg border ${
            allSuccess 
              ? "bg-success/10 border-success/30 text-success" 
              : allError 
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : mixedResults
              ? "bg-warning/10 border-warning/30 text-warning"
              : "bg-muted border-border text-muted-foreground"
          }`}>
            <div className="flex items-center gap-2">
              {allSuccess && <CheckCircle2 className="h-4 w-4" />}
              {allError && <XCircle className="h-4 w-4" />}
              {mixedResults && <AlertCircle className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {allSuccess && "Domain is resolving globally"}
                {allError && "Domain is not resolving - check your DNS settings"}
                {mixedResults && "Partial resolution - DNS may still be propagating"}
                {!allSuccess && !allError && !mixedResults && "Checking..."}
              </span>
            </div>
            {allError && (
              <p className="text-xs mt-2 opacity-80">
                If you just created this subdomain, wait a few minutes and try again. 
                You may also need to flush your local DNS cache.
              </p>
            )}
          </div>

          {/* Individual Results */}
          <div className="space-y-2">
            {results.map((result, index) => (
              <div 
                key={index}
                className="glass-card p-3 flex items-start gap-3"
              >
                <div className={`mt-0.5 ${
                  result.status === "success" ? "text-success" :
                  result.status === "error" ? "text-destructive" :
                  "text-muted-foreground"
                }`}>
                  {result.status === "pending" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {result.status === "success" && <CheckCircle2 className="h-4 w-4" />}
                  {result.status === "error" && <XCircle className="h-4 w-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Server className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{result.resolverName} DNS</span>
                  </div>
                  
                  {result.status === "success" && result.data && (
                    <div className="space-y-1">
                      {result.data.map((record, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-secondary font-mono">
                            {record.type}
                          </span>
                          <span className="text-muted-foreground font-mono truncate">
                            {record.value}
                          </span>
                          {record.ttl && (
                            <span className="text-muted-foreground/60">
                              TTL: {record.ttl}s
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {result.status === "error" && result.error && (
                    <p className="text-xs text-destructive">{result.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {onClose && (
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default DNSChecker;
