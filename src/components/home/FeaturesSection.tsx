import { Shield, Zap, Globe, Heart, Lock, Server } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Free Subdomains",
    description: "Create as many subdomains as you need under m2hgamerz.site without paying a cent."
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "DNS records are created instantly via Cloudflare's global network."
  },
  {
    icon: Shield,
    title: "DDoS Protection",
    description: "Optional Cloudflare proxy provides enterprise-grade security."
  },
  {
    icon: Server,
    title: "A & CNAME Records",
    description: "Point to IP addresses or other domains with full DNS control."
  },
  {
    icon: Lock,
    title: "Secure Platform",
    description: "Rate limiting, input validation, and abuse protection built-in."
  },
  {
    icon: Heart,
    title: "Community Supported",
    description: "Keep the platform running through optional donations."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need, <span className="gradient-text">Completely Free</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started with your subdomain in under a minute. No hidden fees, no subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card p-6 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
