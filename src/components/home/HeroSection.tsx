import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(200 80% 50% / 0.15), transparent)' }} />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_15%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_15%)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="container mx-auto px-4 pt-28 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium mb-8 animate-fade-in backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Free forever • No credit card required</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight animate-slide-up leading-[1.1]">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Get your free
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              subdomain instantly
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Create unlimited subdomains under{" "}
            <span className="text-foreground font-mono text-sm bg-secondary/80 px-2.5 py-1 rounded-md border border-border">
              m2hgamerz.site
            </span>
            <br className="hidden sm:block" />
            Instant DNS propagation powered by Cloudflare.
          </p>

          {/* Domain Preview */}
          <div className="glass-card gradient-border p-5 mb-10 max-w-md mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-1 font-mono">
              <span className="text-lg text-primary font-medium">yourname</span>
              <span className="text-lg text-muted-foreground">.m2hgamerz.site</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Your custom subdomain, ready in seconds</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register">
              <Button variant="hero" size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/20">
                Create Free Subdomain
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg" className="text-base px-8 h-12">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 mt-20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">1,000+</div>
              <div className="text-xs text-muted-foreground mt-1">Subdomains Created</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">500+</div>
              <div className="text-xs text-muted-foreground mt-1">Happy Users</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-b from-success to-success/70 bg-clip-text text-transparent">99.9%</div>
              <div className="text-xs text-muted-foreground mt-1">Uptime</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-24 max-w-5xl mx-auto">
          <div className="glass-card gradient-border p-6 animate-slide-up hover-lift group" style={{ animationDelay: '0.5s' }}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Instant Setup</h3>
            <p className="text-sm text-muted-foreground">Just enter a name and you're live. No complex DNS configuration needed.</p>
          </div>
          <div className="glass-card gradient-border p-6 animate-slide-up hover-lift group" style={{ animationDelay: '0.6s' }}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Full DNS Control</h3>
            <p className="text-sm text-muted-foreground">Update DNS records anytime. A, CNAME, and proxy settings included.</p>
          </div>
          <div className="glass-card gradient-border p-6 animate-slide-up hover-lift group" style={{ animationDelay: '0.7s' }}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Cloudflare Protected</h3>
            <p className="text-sm text-muted-foreground">CDN, DDoS protection, and global edge network included free.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
