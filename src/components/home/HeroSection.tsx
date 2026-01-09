import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
      {/* Background Effects */}
      <div className="hero-glow" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">100% Free Forever</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-slide-up">
            Get Your{" "}
            <span className="gradient-text">Free Subdomain</span>
            <br />
            In Seconds
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Create unlimited subdomains under <span className="text-foreground font-mono">m2hgamerz.site</span> completely free. 
            No credit card required. Community-supported.
          </p>

          {/* Domain Preview */}
          <div className="glass-card p-4 mb-8 max-w-md mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-mono">
              <span className="text-primary">your-name</span>
              <span className="text-muted-foreground">.m2hgamerz.site</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Create Free Subdomain
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">1000+</div>
              <div className="text-sm text-muted-foreground">Subdomains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">500+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>

        {/* Feature Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 max-w-4xl mx-auto">
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <Globe className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Instant DNS</h3>
            <p className="text-sm text-muted-foreground">Records propagate in seconds via Cloudflare</p>
          </div>
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <Zap className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">A & CNAME Records</h3>
            <p className="text-sm text-muted-foreground">Full DNS control with both record types</p>
          </div>
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <Sparkles className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Cloudflare Proxy</h3>
            <p className="text-sm text-muted-foreground">Optional CDN & DDoS protection</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
